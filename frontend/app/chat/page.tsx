"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MessageInput } from "@/components/input/MessageInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, PanelLeft, FileText, Code, PenTool, Lightbulb } from "lucide-react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
  document?: { id: string; name: string };
}

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);
  const lang = match ? match[1] : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 bg-[#FAFAFA] shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-[#FAFAFA]">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-zinc-500 font-mono">{'</>'}</span> {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </span>
          <button onClick={handleCopy} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-[13px] bg-white dark:bg-zinc-950">
          <SyntaxHighlighter
            style={coy}
            language={lang}
            PreTag="div"
            customStyle={{ margin: 0, padding: 0, background: "transparent", border: "none", boxShadow: "none" }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
  return (
    <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
      {children}
    </code>
  );
};

const MessageActionRow = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 mt-2 -ml-2">
      <button onClick={handleCopy} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Copy response">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

const ThinkingTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-[13px] text-zinc-400 font-medium animate-pulse ml-1.5 mt-1 select-none flex items-center gap-2">
      Thinking for {seconds}s...
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState("en-US");
  const router = useRouter();

  const [activeDocument, setActiveDocument] = useState<{ id: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email ?? null);
        setUserFirstName(session.user.user_metadata?.first_name ?? null);
        setUserId(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email ?? null);
        setUserFirstName(session.user.user_metadata?.first_name ?? null);
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setActiveDocument(null);
  };

  const handleSelectChat = (id: string) => {
    if (id === currentChatId) return;
    setCurrentChatId(id);
    setActiveDocument(null);
    fetch(`https://codealphaaskai-production.up.railway.app/chats/${id}`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://codealphaaskai-production.up.railway.app/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setActiveDocument({ id: data.document_id, name: data.filename });
      } else {
        console.error("Upload failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (content: string, isVoice: boolean = false) => {
    if (content.trim() === "" && !activeDocument) return;

    const currentDoc = activeDocument;
    setActiveDocument(null);

    const userMessage: Message = { role: "user", content, document: currentDoc || undefined };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    let fullAssistantMessage = "";

    try {
      let activeChatId = currentChatId;
      
      if (!activeChatId) {
        let title = "New Chat";
        if (content.trim()) {
          title = content.length > 40 ? content.substring(0, 40) + "..." : content;
        } else if (currentDoc) {
          title = "Document: " + currentDoc.name;
        }
        const insertData: any = { title, user_id: userId };
        if (activeProjectId) {
          insertData.project_id = activeProjectId;
        }
        
        const { data, error } = await supabase.from('chats').insert([insertData]).select();
        if (error) {
          console.error("Failed to create chat in DB:", error);
          setIsLoading(false);
          return;
        }
        activeChatId = data[0].id;
        setCurrentChatId(activeChatId);
        setSidebarRefresh(prev => prev + 1);
      }

      const response = await fetch("https://codealphaaskai-production.up.railway.app/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage], 
          model: selectedModel,
          chat_id: activeChatId,
          language: selectedVoiceLang,
          input_type: isVoice ? "voice" : "text",
          document_id: currentDoc?.id || null
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the backend API.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      let newChatId = currentChatId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") break;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.chat_id && !newChatId) {
                newChatId = data.chat_id;
                setCurrentChatId(newChatId);
                setSidebarRefresh(prev => prev + 1);
              }

              if (data.content) {
                fullAssistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: newMessages[lastIndex].content + data.content
                  };
                  return newMessages;
                });
              } else if (data.error) {
                console.error("Backend Error:", data.error);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: newMessages[lastIndex].content + "\n[Error: " + data.error + "]"
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors on incomplete data
            }
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Request aborted");
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex]?.role === 'assistant') {
            if (newMessages[lastIndex].content === "") {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: "_Request cancelled. I'm ready for your next task!_"
              };
            } else {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + "\n\n_Request cancelled. I'm ready for your next task!_"
              };
            }
          }
          return newMessages;
        });
      } else {
        console.error(error);
        setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI backend. Make sure your API key is in backend/.env" }]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
      if (isVoice && typeof window !== "undefined" && fullAssistantMessage.trim().length > 0) {
        const speech = new SpeechSynthesisUtterance(fullAssistantMessage.trim());
        speech.lang = selectedVoiceLang;
        window.speechSynthesis.speak(speech);
      }
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-zinc-900 dark:text-[var(--foreground)] overflow-hidden font-sans selection:bg-orange-100 dark:selection:bg-orange-900/30 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container with Animation */}
      <div className={`absolute md:relative z-40 h-full flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-[260px]' : 'w-0'}`}>
        <div className="w-[260px]">
          <Sidebar 
            onSelectChat={handleSelectChat} 
            onNewChat={handleNewChat} 
            refreshTrigger={sidebarRefresh} 
            userEmail={userEmail}
            userFirstName={userFirstName}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            onToggleSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>
      
      {/* Floating Open Sidebar Button */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 p-2.5 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border-color)] hover:opacity-80 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 shadow-sm"
          title="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {messages.length === 0 ? (
          /* Empty State Centered Area */
          <div className="flex-1 flex flex-col items-center justify-end md:justify-center px-4 w-full h-full pb-[5vh] md:pb-[10vh]">
            <h1 className="text-[32px] md:text-[40px] text-zinc-800 dark:text-zinc-100 mb-2 flex items-center gap-3 font-serif">
              <svg className="w-9 h-auto md:w-11" viewBox="0 0 550.59 428.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-gradient" y1="214.02" x2="550.59" y2="214.02" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ef7900" />
                    <stop offset="1" stopColor="#fbc200" />
                  </linearGradient>
                </defs>
                <path fill="url(#logo-gradient)" d="M275.29 0l137.65 214.01 137.65 214.02H320.65l75.1-116.76-120.46-187.29L79.74 428.03H0l137.65-214.02L275.29 0z" />
                <path className="fill-zinc-800 dark:fill-zinc-100" fillRule="evenodd" d="M291.52 428h-76.61l28.79-44.69 84.65-131.63 38.3 59.56-46.39 72.07-28.79 44.79zm-104.59 0l28.79-44.69L314.39 230l-39.1-60.77-137.64 214.11L108.86 428z" />
              </svg>
              <span className="text-[#CB6015] dark:text-[#E87A2D]">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good morning";
                  if (hour < 17) return "Good afternoon";
                  return "Good evening";
                })()}
              </span>
              , {(() => {
                if (userFirstName) return userFirstName;
                if (!userEmail) return 'User';
                const username = userEmail.split('@')[0];
                const firstName = username.split(/[^a-zA-Z]/)[0] || username;
                return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
              })()}
            </h1>
            <p className="text-zinc-500/80 dark:text-zinc-400/80 text-[15px] md:text-[17px] mb-10 font-medium tracking-wide text-center">
              What would you like to work on?
            </p>
            <MessageInput 
              onSend={handleSendMessage} 
              isLoading={isLoading} 
              selectedVoiceLang={selectedVoiceLang}
              onVoiceLangChange={setSelectedVoiceLang}
              activeDocument={activeDocument}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              onRemoveDocument={() => setActiveDocument(null)}
              onStop={handleStop}
            />
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl">
              <button onClick={() => handleSendMessage("How do I reset my password?")} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-[var(--sidebar-border-color)] bg-white dark:bg-[var(--sidebar-bg)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-[14px] text-zinc-600 dark:text-zinc-300 shadow-sm">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Reset Password
              </button>
              <button onClick={() => handleSendMessage("What are your pricing plans?")} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-[var(--sidebar-border-color)] bg-white dark:bg-[var(--sidebar-bg)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-[14px] text-zinc-600 dark:text-zinc-300 shadow-sm">
                <FileText className="h-4 w-4 text-green-500" />
                Pricing Plans
              </button>
              <button onClick={() => handleSendMessage("Write a Python script to automate file organization")} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-[var(--sidebar-border-color)] bg-white dark:bg-[var(--sidebar-bg)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-[14px] text-zinc-600 dark:text-zinc-300 shadow-sm">
                <Code className="h-4 w-4 text-[#CB6015] dark:text-[#E87A2D]" />
                Write code
              </button>
              <button onClick={() => handleSendMessage("Summarize the key points of the uploaded document")} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-[var(--sidebar-border-color)] bg-white dark:bg-[var(--sidebar-bg)] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-[14px] text-zinc-600 dark:text-zinc-300 shadow-sm">
                <PenTool className="h-4 w-4 text-blue-500" />
                Summarize a doc
              </button>
            </div>
          </div>
        ) : (
          /* Active Chat Area */
          <div className="flex-1 flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto px-2 md:px-4 pt-16 md:pt-10 pb-32">
              <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-[#F4F4F4] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tr-sm' : 'bg-transparent text-zinc-800 dark:text-zinc-100 px-0 w-full'}`}>
                      {msg.role === 'assistant' && msg.content === "" ? (
                        <div className="flex flex-col items-start">
                          <div className="flex h-6 items-center">
                            <div className="h-3.5 w-3.5 bg-black dark:bg-zinc-300 rounded-full animate-pulse mt-1 ml-1" />
                          </div>
                          <ThinkingTimer />
                        </div>
                      ) : msg.role === 'assistant' ? (
                        <div className="prose prose-zinc dark:prose-invert max-w-none text-[15.5px] leading-relaxed prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-strong:font-bold prose-strong:text-black dark:prose-strong:text-white prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-[19px] prose-headings:mt-6 prose-headings:mb-3 prose-ul:pl-5 prose-ol:pl-5 prose-li:my-1.5 prose-li:marker:text-black dark:prose-li:marker:text-white prose-li:marker:font-bold">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: CodeBlock
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {!isLoading && idx === messages.length - 1 && (
                            <MessageActionRow content={msg.content} />
                          )}
                          {idx !== messages.length - 1 && (
                            <MessageActionRow content={msg.content} />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-end">
                          {msg.document && (
                            <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 rounded-lg border border-black/5 dark:border-white/5 w-fit shadow-sm">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">{msg.document.name}</span>
                            </div>
                          )}
                          {msg.content && <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent pb-6 pt-10 pointer-events-none">
              <div className="pointer-events-auto">
                <MessageInput 
                onSend={handleSendMessage} 
                isLoading={isLoading} 
                selectedVoiceLang={selectedVoiceLang}
                onVoiceLangChange={setSelectedVoiceLang}
                activeDocument={activeDocument}
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
                onRemoveDocument={() => setActiveDocument(null)}
                onStop={handleStop}
              />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
