"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, FileText } from "lucide-react"

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
      <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-900">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-zinc-500 font-mono">{'</>'}</span> {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </span>
          <button onClick={handleCopy} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md">
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

export default function SharePage() {
  const params = useParams()
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.chatId) {
      fetch(`http://localhost:8000/chats/${params.chatId}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }, [params.chatId])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-[var(--background)] text-zinc-500">Loading conversation...</div>
  }

  if (!messages || messages.length === 0) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-[var(--background)] text-zinc-500">Conversation not found.</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)] text-zinc-900 dark:text-[var(--foreground)] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-serif font-bold text-center mb-12 text-zinc-800 dark:text-zinc-100">Shared Conversation</h1>
        <div className="space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-[#F4F4F4] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tr-sm' : 'bg-transparent text-zinc-800 dark:text-zinc-100 px-0 w-full'}`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-zinc dark:prose-invert max-w-none text-[15.5px] leading-relaxed prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-strong:font-bold prose-strong:text-black dark:prose-strong:text-white prose-headings:font-bold prose-headings:text-black dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-[19px] prose-headings:mt-6 prose-headings:mb-3 prose-ul:pl-5 prose-ol:pl-5 prose-li:my-1.5 prose-li:marker:text-black dark:prose-li:marker:text-white prose-li:marker:font-bold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 items-end">
                    {msg.document && (
                      <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 rounded-lg border border-black/5 dark:border-white/5 w-fit shadow-sm">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">{msg.document.name}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
