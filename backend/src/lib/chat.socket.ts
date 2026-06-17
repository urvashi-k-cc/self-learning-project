import { Server, Socket } from "socket.io";
import { createChatMessageService } from "../services/chat.service";

type ChatMessagePayload = {
  taskId: number | string;
  senderId: number | string;
  message: string;
  replyToId?: number | string;
  clientMessageId?: string;
};

type SocketAck = (response: { success: boolean; error?: string }) => void;

export const registerChatSocketEvents = (io: Server, socket: Socket) => {
  console.log("Socket connected:", socket.id);

  // ---------------------------
  // JOIN TASK ROOM
  // ---------------------------
  socket.on("join-task", (taskId, ack?: SocketAck) => {
    const taskIdNumber = Number(taskId);

    if (!Number.isInteger(taskIdNumber) || taskIdNumber <= 0) {
      ack?.({ success: false, error: "Invalid task id" });
      return;
    }

    const room = `task-${taskIdNumber}`;

    socket.join(room);

    console.log(`JOINED: ${socket.id} -> ${room}`);
    console.log("ROOM SIZE:", io.sockets.adapter.rooms.get(room)?.size);
    ack?.({ success: true });
  });

  socket.on("leave-task", (taskId) => {
    const taskIdNumber = Number(taskId);

    if (!Number.isInteger(taskIdNumber) || taskIdNumber <= 0) return;

    socket.leave(`task-${taskIdNumber}`);
  });
  
  // ---------------------------
  // SEND MESSAGE
  // ---------------------------
  socket.on("send-message", async (data: ChatMessagePayload, ack?: SocketAck) => {
    try {
      const taskId = Number(data.taskId);
      const senderId = Number(data.senderId);
      const message = String(data.message || "").trim();

      if (
        !Number.isInteger(taskId) ||
        !Number.isInteger(senderId) ||
        taskId <= 0 ||
        senderId <= 0 ||
        !message
      ) {
        ack?.({ success: false, error: "Invalid message payload" });
        return;
      }

      const savedMessage = await createChatMessageService(
        taskId,
        senderId,
        message,
        data.replyToId ? Number(data.replyToId) : null
      );

      if (!savedMessage) {
        console.error("Failed to save chat message");
        ack?.({ success: false, error: "Failed to save chat message" });
        return;
      }

      const room = `task-${taskId}`;
      socket.join(room);

      const payload = {
        id: savedMessage.id,
        taskId,
        senderId,
        sender: savedMessage.sender,
        senderName:
          [savedMessage.sender?.first_name, savedMessage.sender?.last_name]
            .filter(Boolean)
            .join(" ") || "Unknown",
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
        replyTo: savedMessage.replyTo
          ? {
              id: savedMessage.replyTo.id,
              message: savedMessage.replyTo.message,
              sender: savedMessage.replyTo.sender,
              senderName:
                [
                  savedMessage.replyTo.sender?.first_name,
                  savedMessage.replyTo.sender?.last_name,
                ]
                  .filter(Boolean)
                  .join(" ") || "Unknown",
            }
          : null,
        clientMessageId: data.clientMessageId,
      };

      // Broadcast to everyone currently viewing this task chat.
      io.to(room).emit("receive-message", payload);

      console.log("MESSAGE SENT TO ROOM:", room);
      ack?.({ success: true });
    } catch (err) {
      console.error("Socket error:", err);
      ack?.({ success: false, error: "Socket error" });
    }
  });
};
