import { createChatMessageService } from "../services/chat.service";
import { Server, Socket } from "socket.io";

type ChatMessagePayload = {
  taskId: number | string;
  senderId: number | string;
  message: string;
  replyToId?: number | string;
  clientMessageId?: string;
};

export const registerChatSocketEvents = (
  io: Server,
  socket: Socket
) => {
  socket.on("join-task", (taskId: number | string) => {
    const taskRoomId = Number(taskId);
    console.log(`join-task received - taskId: ${taskId}, socket: ${socket.id}`);
    
    if (!Number.isInteger(taskRoomId)) {
      console.error(" Invalid taskId for join-task", taskId);
      return;
    }
    socket.join(`task-${taskRoomId}`);
    console.log(`Socket ${socket.id} joined room task-${taskRoomId}`);
    console.log(`Room members:`, io.sockets.adapter.rooms.get(`task-${taskRoomId}`));
  });

  socket.on("send-message", async (data: ChatMessagePayload) => {
    try {
      console.log(`send-message received:`, data);
      
      const { taskId, senderId, message } = data || {};
      const taskIdNumber = Number(taskId);
      const senderIdNumber = Number(senderId);
      const trimmedMessage = String(message || "").trim();

      if (
        !Number.isInteger(taskIdNumber) ||
        !Number.isInteger(senderIdNumber) ||
        !trimmedMessage
      ) {
        console.error(" Invalid chat payload", data);
        return;
      }

      console.log(`Saving message - taskId: ${taskIdNumber}, senderId: ${senderIdNumber}`);
      
      const savedMessage = await createChatMessageService(
        taskIdNumber,
        senderIdNumber,
        trimmedMessage,
        data.replyToId ? Number(data.replyToId) : null
      );

      console.log(` Message saved:`, savedMessage);

      if (savedMessage) {
        const roomName = `task-${taskIdNumber}`;
        console.log(`Broadcasting to room ${roomName}...`);
        console.log(`Room members count:`, io.sockets.adapter.rooms.get(roomName)?.size || 0);
        
        // Transform saved message for client
        const messagePayload = {
          id: savedMessage.id,
          senderId: savedMessage.senderId,
          senderName: savedMessage.sender?.first_name ? `${savedMessage.sender.first_name} ${savedMessage.sender.last_name}` : 'Unknown',
          sender: savedMessage.sender,
          message: savedMessage.message,
          taskId: savedMessage.taskId,
          createdAt: savedMessage.createdAt,
          replyTo: savedMessage.replyTo ? {
            id: savedMessage.replyTo.id,
            message: savedMessage.replyTo.message,
            sender: savedMessage.replyTo.sender,
            senderName: savedMessage.replyTo.sender?.first_name ? `${savedMessage.replyTo.sender.first_name} ${savedMessage.replyTo.sender.last_name}` : 'Unknown',
          } : null,
          clientMessageId: data.clientMessageId,
        };
        
        // Broadcast to all clients in the room (including sender)
        io.to(roomName).emit("receive-message", messagePayload);
        
        console.log(`Message broadcasted to room ${roomName}`);
      }
    } catch (error) {
      console.error("Chat socket error:", error);
    }
  });
};