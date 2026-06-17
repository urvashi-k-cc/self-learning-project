import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { getTaskByIdApi, getTaskMessagesApi } from "../../helpers/apiRequest";
import { useAuth } from "../../context/AuthContext";
import {
  statusLabels,
  statusStyles,
  quickReplies,
  managerQuickReplies,
} from "@/utils/common";
import socket from "../../lib/socket";

const getFullName = (person) =>
  [person?.first_name, person?.last_name].filter(Boolean).join(" ") ||
  person?.name ||
  "Unknown User";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const buildParticipants = (task, user) => {
  const people = [
    user && { ...user, label: "You" },
    task?.assignedTo && { ...task.assignedTo, label: "Assignee" },
    console.log("Task created By <<<<<<<<<<<<<<<<<<<", task?.createdBy),
    task?.createdBy && { ...task.createdBy, label: `Task Owner` },
    task?.project?.createdBy && {
      ...task.project.createdBy,
      label: "Project Manager",
    },
  ].filter(Boolean);

  const seen = new Set();

  return people.filter((person) => {
    const key = person.id || person.email || getFullName(person);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatChatMessage = (item, userId) => {
  const senderName =
    (item?.sender ? getFullName(item.sender) : item?.senderName) ||
    "Unknown User";
  const createdAt = item?.createdAt ? new Date(item.createdAt) : new Date();
  const senderId = Number(item?.senderId);
  const currentUserId = Number(userId);
  const mine = senderId === currentUserId;

  return {
    id: item?.id?.toString() || item?.clientMessageId,
    author: senderName,
    role: mine ? "You" : "",
    mine,
    text: item?.message || "",
    status: mine ? "sent" : undefined,
    replyTo: item?.replyTo
      ? {
          id: item.replyTo.id?.toString(),
          author:
            (item.replyTo.sender ? getFullName(item.replyTo.sender) : null) ||
            item.replyTo.senderName ||
            "Unknown User",
          text: item.replyTo.message,
        }
      : undefined,
    time: createdAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const ChatOption = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(state?.task || null);
  const [loading, setLoading] = useState(Boolean(id && !state?.task));
  const [message, setMessage] = useState("");
  const [search] = useState("");
  const bottomRef = useRef(null);
  const tempMessageCounterRef = useRef(0);
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  const canReplySpecificMessage =
    user?.role === "manager" || user?.role === "teamLead";

  useEffect(() => {
    if (!id) return;

    const joinRoom = () => {
      const roomId = String(id);

      socket.timeout(5000).emit("join-task", roomId, (error, response) => {
        if (error || response?.success === false) {
          console.error("Failed to join chat room:", error || response?.error);
        }
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave-task", id);
    };
  }, [id]);

  useEffect(() => {
    console.log("[MESSAGE-LISTENER] Setting up receive-message listener");

    const handleReceiveMessage = (data) => {
      console.log("[MESSAGE-LISTENER] Received Message:", data);

      if (String(data?.taskId) !== String(id)) return;

      setMessages((prev) => {
        const newMessage = formatChatMessage(data, user?.id);

        if (data?.clientMessageId) {
          const tempMessageExists = prev.some(
            (message) => message.id === data.clientMessageId,
          );

          if (tempMessageExists) {
            return prev.map((message) =>
              message.id === data.clientMessageId ? newMessage : message,
            );
          }
        }

        const messageExists = prev.some(
          (message) => message.id === data?.id?.toString(),
        );

        if (messageExists) {
          return prev;
        }

        return [...prev, newMessage];
      });
    };

    socket.on("receive-message", handleReceiveMessage);
    console.log("[MESSAGE-LISTENER] Listener registered for receive-message");

    return () => {
      console.log("[MESSAGE-LISTENER] Cleaning up receive-message listener");
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [id, user?.id]);

  useEffect(() => {
    let active = true;

    const loadTaskAndMessages = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const [taskRes, messagesRes] = await Promise.all([
          getTaskByIdApi(id),
          getTaskMessagesApi(id),
        ]);

        if (!active) return;

        setTask(taskRes.task);

        setMessages((currentMessages) => {
          const loadedMessages = (messagesRes.messages || []).map((item) =>
            formatChatMessage(item, user?.id),
          );
          const existingIds = new Set(loadedMessages.map((item) => item.id));
          const liveMessages = currentMessages.filter(
            (item) => !existingIds.has(item.id),
          );

          return [...loadedMessages, ...liveMessages];
        });
      } catch (error) {
        if (active) {
          toast.error(error.response?.data?.message || "Failed to load chat");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTaskAndMessages();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const participants = useMemo(
    () => buildParticipants(task, user),
    [task, user],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredMessages = messages.filter((item) =>
    item.text.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleSend = (text = message) => {
    const trimmed = text.trim();
    if (!trimmed || !id || !user?.id) {
      console.log(
        "[SEND-MESSAGE] Cannot send - trimmed:",
        trimmed,
        "id:",
        id,
        "userId:",
        user?.id,
      );
      return;
    }

    console.log("[SEND-MESSAGE] Sending message:", trimmed);

    tempMessageCounterRef.current += 1;
    const clientMessageId = `temp-${tempMessageCounterRef.current}`;
    const tempMessage = {
      id: clientMessageId,
      author: getFullName(user),
      role: "You",
      mine: true,
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "pending",
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            author: replyingTo.author,
            text: replyingTo.text,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);

    const payload = {
      taskId: id,
      senderId: user.id,
      senderName: getFullName(user),
      message: trimmed,
      replyToId: replyingTo?.id ? Number(replyingTo.id) : null,
      clientMessageId,
    };

    console.log("[SEND-MESSAGE] Emitting send-message socket event:", payload);

    if (!socket.connected) {
      socket.connect();
    }

    socket.timeout(5000).emit("send-message", payload, (error, response) => {
      if (!error && response?.success !== false) return;

      console.error("Failed to send chat message:", error || response?.error);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === clientMessageId ? { ...item, status: "failed" } : item,
        ),
      );
      toast.error("Message was not sent. Please try again.");
    });

    setMessage("");
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-112px)] max-w-7xl grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
      <aside className="hidden border-r border-gray-200 bg-gray-50/70 p-5 lg:block">
        <button
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeft className="h-4 w-4" />
          Tasks
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Current task
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-snug text-gray-950">
                {task.title}
              </h2>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                statusStyles[task.status] || statusStyles.todo
              }`}
            >
              {statusLabels[task.status] || task.status}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Project</p>
              <p className="font-medium text-gray-900">
                {task.project?.name || "No project"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Description</p>
              <p className="line-clamp-4 text-gray-900">
                {task.description || "No description available"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Participants
          </h3>
          <div className="space-y-2">
            {participants.map((person) => {
              const name = getFullName(person);

              return (
                <div
                  key={person.id || name}
                  className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {person.label || person.role}
                    </p>
                    <p className=""></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
                  onClick={() => navigate("/tasks")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold text-gray-950">
                    Task Discussion
                  </h1>
                  <p className="truncate text-sm text-gray-500">{task.title}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {filteredMessages.map((item) =>
              item.type === "system" ? (
                <div
                  key={item.id}
                  className="mx-auto flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {item.text}
                </div>
              ) : (
                <div
                  key={item.id}
                  className={`flex ${item.mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-lg px-4 py-3 shadow-sm sm:max-w-[68%] ${
                      item.mine
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <span
                        className={`text-xs font-semibold ${
                          item.mine ? "text-gray-100" : "text-gray-700"
                        }`}
                      >
                        {item.role || item.author}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] ${
                          item.mine ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {/* <Clock className="h-3 w-3" /> */}
                        {item.time}
                        {item.mine ? (
                          <span className="ml-2 inline-flex items-center gap-0.5">
                            {item.status === "pending" ? (
                              <Check className="h-3 w-3 text-gray-300" />
                            ) : (
                              <CheckCheck className="h-3 w-3 text-gray-300 " />
                            )}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {item.replyTo ? (
                      <div className="mb-2 rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700">
                        <div className="mb-1 text-[11px] font-semibold text-gray-500">
                          Replying to {item.replyTo.author}
                        </div>
                        <div className="line-clamp-2 text-sm text-gray-900">
                          {item.replyTo.text}
                        </div>
                      </div>
                    ) : null}
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {item.text}
                    </p>
                    {canReplySpecificMessage && !item.mine ? (
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          setReplyingTo({
                            id: item.id,
                            author: item.author,
                            text: item.text,
                          })
                        }
                      >
                        Reply
                      </button>
                    ) : null}
                  </div>
                </div>
              ),
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <footer className="border-t border-gray-200 bg-white p-4 sm:p-5">
          <div className="mx-auto max-w-3xl">
            {replyingTo ? (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold">
                      Replying to {replyingTo.author}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-blue-900">
                      {replyingTo.text}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {(user?.role === "manager"
                ? managerQuickReplies
                : quickReplies
              ).map((reply) => (
                <button
                  key={reply}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSend(reply)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {reply}
                </button>
              ))}
            </div>

            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
            >
              {/* share attachment */}
              {/* <button
                type="button"
                className="mb-1 hidden rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 sm:inline-flex"
              >
                <Paperclip className="h-5 w-5" />
              </button> */}
              <textarea
                className="max-h-32 min-h-12 flex-1 resize-none rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-700"
                placeholder="Ask a question or share an update"
                value={message}
                rows={1}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="submit"
                className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-900 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default ChatOption;
