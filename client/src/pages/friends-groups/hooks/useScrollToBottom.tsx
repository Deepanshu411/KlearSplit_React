import { useRef } from "react";

const useScrollToBottom = () => {
    const messageContainerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    return { messageContainerRef, scrollToBottom };
};

export default useScrollToBottom;
