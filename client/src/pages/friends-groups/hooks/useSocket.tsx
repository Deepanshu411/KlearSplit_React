import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../../../constants/apis/urls';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(BASE_URL);
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('joinRoom', conversationId);
    }
  }, [socket]);

  const sendConversationMessage = useCallback((messageData: Partial<MessageData>) => {
    if (socket) {
      socket.emit('sendConversationMessage', messageData);
    }
  }, [socket]);

  const sendGroupMessage = useCallback((messageData: Partial<GroupMessageData>) => {
    if (socket) {
      socket.emit('sendGroupMessage', messageData);
    }
  }, [socket]);

  const onNewConversationMessage = useCallback((callback: (message: MessageData) => void) => {
    if (socket) {
      socket.on('newMessage', callback);
    }
  }, [socket]);

  const onNewGroupMessage = useCallback((callback: (message: GroupMessageData) => void) => {
    if (socket) {
      socket.on('newMessage', callback);
    }
  }, [socket]);

  const removeNewMessageListener = useCallback(() => {
    if (socket) {
      socket.off('newMessage');
    }
  }, [socket]);

  const leaveRoom = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('leaveRoom', conversationId);
    }
  }, [socket]);

  return {
    joinRoom,
    sendConversationMessage,
    sendGroupMessage,
    onNewConversationMessage,
    onNewGroupMessage,
    removeNewMessageListener,
    leaveRoom,
  };
};