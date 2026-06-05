"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Mic, ArrowUp, Loader2, Globe, FileText, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface MessageInputProps {
  onSend?: (message: string, isVoice?: boolean) => void;
  isLoading?: boolean;
  selectedVoiceLang?: string;
  onVoiceLangChange?: (lang: string) => void;
  activeDocument?: { id: string; name: string } | null;
  onFileUpload?: (file: File) => void;
  isUploading?: boolean;
  onRemoveDocument?: () => void;
  onStop?: () => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' }
];

export function MessageInput({ 
  onSend, 
  isLoading, 
  selectedVoiceLang = 'en-US', 
  onVoiceLangChange,
  activeDocument,
  onFileUpload,
  isUploading,
  onRemoveDocument,
  onStop
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (onSend) {
            onSend(transcript, true);
          }
          setMessage("");
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [onSend]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedVoiceLang;
    }
  }, [selectedVoiceLang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMessage(""); // Clear text when starting voice
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !activeDocument) || isLoading) return;
    if (onSend) {
      onSend(message, false);
    }
    setMessage("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center relative">
      <form 
        onSubmit={handleSubmit}
        className="w-full relative group bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded-3xl p-3 transition-all focus-within:border-[#FFB81C]/40 hover:border-[#FFB81C]/40 focus-within:ring-4 focus-within:ring-[#FFB81C]/10"
      >
        <div className="absolute inset-0 holographic-input rounded-3xl pointer-events-none"></div>
        <div className="relative z-10 w-full flex flex-col">
          {activeDocument && (
            <div className="flex items-center gap-2 px-3 pt-2 pb-1">
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">{activeDocument.name}</span>
                <button 
                  type="button" 
                  onClick={onRemoveDocument}
                  className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask anything..."}
            className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-3 text-[16px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 min-h-[56px] max-h-48 outline-none"
            rows={1}
            disabled={isLoading || isListening}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onFileUpload?.(e.target.files[0]);
                  }
                }} 
                className="hidden" 
                accept=".pdf,.docx,.txt"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-600 dark:text-zinc-400 disabled:opacity-50"
                title="Add/Upload Files"
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm py-1.5 px-3 rounded-full cursor-pointer outline-none transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700" title="Voice Language">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>{LANGUAGES.find(l => l.code === selectedVoiceLang)?.label || 'Language'}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1">
                  {LANGUAGES.map(lang => (
                    <DropdownMenuItem 
                      key={lang.code}
                      onClick={() => onVoiceLangChange?.(lang.code)}
                      className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors mb-0.5 last:mb-0 ${
                        selectedVoiceLang === lang.code 
                          ? 'bg-[#1a73e8] text-white hover:bg-[#1a73e8] hover:text-white focus:bg-[#1a73e8] focus:text-white' 
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800'
                      }`}
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button 
                type="button" 
                onClick={toggleListening}
                disabled={isLoading} 
                className={`p-2 rounded-full transition-all disabled:opacity-50 ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                title="Speak your question"
              >
                <Mic className="h-5 w-5" />
              </button>
              
              {isLoading ? (
                <button type="button" onClick={onStop} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-zinc-800 dark:text-zinc-200 ml-1 relative transition-colors" title="Stop generating">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-red-500 rounded-[2px]" />
                  </div>
                </button>
              ) : (message.trim().length > 0 || !!activeDocument) ? (
                <button type="submit" className="p-2 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full transition-colors text-white dark:text-black ml-1">
                  <ArrowUp className="h-5 w-5" />
                </button>
              ) : (
                <button type="button" disabled className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors text-zinc-400 dark:text-zinc-600 ml-1">
                  <ArrowUp className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
