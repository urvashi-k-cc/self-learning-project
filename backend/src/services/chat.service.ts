import { AppDataSource } from "../config/database";
import { ChatMessage } from "../entities/chat.entity";

const chatRepository =
  AppDataSource.getRepository(ChatMessage);
export const createChatMessageService = async (
  taskId: number,
  senderId: number,
  message: string,
  replyToId?: number | null
) => {
  const chat = chatRepository.create({
    taskId,
    senderId,
    message,
    replyToId: replyToId ?? null,
  });

  const savedMessage = await chatRepository.save(chat);

  return await chatRepository.findOne({
    where: { id: savedMessage.id },
    relations: {
      sender: true,
      replyTo: {
        sender: true,
      },
    },
  });
};
export const getTaskMessagesService = async (
  taskId: number
) => {
  return await chatRepository.find({
    where: { taskId },
    relations: {
      sender: true,
      replyTo: {
        sender: true,
      },
    },
    order: {
      createdAt: "ASC",
    },
  });
};