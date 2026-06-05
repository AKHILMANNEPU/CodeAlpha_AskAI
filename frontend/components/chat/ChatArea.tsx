"use client";

import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I am your AI assistant. How can I help you today?",
  },
  {
    id: "2",
    role: "user",
    content: "Can you help me design an AI chatbot platform interface?",
  },
  {
    id: "3",
    role: "assistant",
    content: "I'd love to help with that! A modern AI chatbot platform usually needs a sidebar for history, a top nav for model selection, and a beautiful chat area with glassmorphism message bubbles. I recommend using an Orange and Pastel color palette for a unique, vibrant, yet clean aesthetic.",
  },
];

export function ChatArea() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        {MOCK_MESSAGES.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar className="h-8 w-8 mt-1 shrink-0">
              {msg.role === "assistant" ? (
                <>
                  <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                </>
              ) : (
                <>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </>
              )}
            </Avatar>

            <div
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              } max-w-[85%]`}
            >
              <div
                className={`px-5 py-3.5 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-secondary text-foreground rounded-tr-sm"
                    : "bg-card border border-border shadow-sm backdrop-blur-md rounded-tl-sm"
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-[15px]">
                  {msg.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
