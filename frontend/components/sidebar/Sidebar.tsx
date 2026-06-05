"use client";

import React, { useEffect, useState, useRef } from "react";
import { Plus, PanelLeft, MessageSquare, Briefcase, FileText, Settings, LogOut, Activity, MoreHorizontal, Edit2, Trash2, Pin, Share, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectsModal } from "@/components/projects/ProjectsModal";

interface SidebarProps {
  onSelectChat?: (id: string) => void;
  onNewChat?: () => void;
  refreshTrigger?: number;
  userEmail?: string | null;
  userFirstName?: string | null;
  activeProjectId?: string | null;
  setActiveProjectId?: (id: string | null) => void;
  onToggleSidebar?: () => void;
}

export function Sidebar({ onSelectChat, onNewChat, refreshTrigger = 0, userEmail, userFirstName, activeProjectId, setActiveProjectId, onToggleSidebar }: SidebarProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingChatId]);

  const fetchChats = async () => {
    let query = supabase.from("chats").select("*").order("is_pinned", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
    
    if (activeProjectId) {
      query = query.eq("project_id", activeProjectId);
    } else {
      query = query.is("project_id", null);
    }

    const { data, error } = await query;
    if (!error && data) {
      setChats(data);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [refreshTrigger, activeProjectId]);

  const handleUpdateChat = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from("chats").update(updates).eq("id", id);
      if (error) {
        console.error("Failed to update chat in Supabase:", error);
      }
      fetchChats();
    } catch (error) {
      console.error("Failed to update chat:", error);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const { error } = await supabase.from("chats").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete chat in Supabase:", error);
      }
      fetchChats();
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (editingTitle.trim()) {
      handleUpdateChat(id, { title: editingTitle.trim() });
    }
    setEditingChatId(null);
  };

  const handleShare = async (id: string) => {
    const url = `${window.location.origin}/share/${id}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  };

  const pinnedChats = chats.filter(c => c.is_pinned);
  const recentChats = chats.filter(c => !c.is_pinned);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const username = userFirstName || (userEmail ? userEmail.split('@')[0].toUpperCase() : 'USER');
  const initial = username.charAt(0).toUpperCase();

  return (
    <>
      <div className="group relative w-[260px] h-screen flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border-color)] transition-all hover:border-[#FFB81C]/40">
        {/* Top Section */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onNewChat} className="flex flex-col text-left hover:opacity-80 transition-opacity">
              <h1 className="font-sans font-bold text-xl tracking-tight text-[#CB6015] dark:text-[#E87A2D]">
                AskAI
              </h1>
              <span className="font-sans text-[9px] font-semibold text-zinc-500 tracking-[2px] uppercase mt-0.5">
                FAQ · AI CHAT
              </span>
            </button>
            <button onClick={onToggleSidebar} className="p-1.5 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400">
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full">
            <button onClick={onNewChat} className="flex items-center justify-center gap-2 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity px-3 py-2 rounded-xl text-sm font-medium w-full shadow-sm">
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>
        </div>

        <div className="px-3 pb-4 space-y-0.5 border-b border-[var(--sidebar-border-color)]">
          <button 
            onClick={() => setIsProjectsModalOpen(true)}
            className="flex items-center gap-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors px-3 py-1.5 rounded-lg text-sm text-zinc-700 dark:text-[var(--sidebar-foreground)] w-full"
          >
            <Briefcase className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            Projects
          </button>
          <Link 
            href="/dashboard"
            className="flex items-center gap-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors px-3 py-1.5 rounded-lg text-sm text-zinc-700 dark:text-[var(--sidebar-foreground)] w-full"
          >
            <Activity className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            Analytics
          </Link>
        </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-2">
        {chats.length > 0 ? (
          <div className="space-y-4">
            {pinnedChats.length > 0 && (
              <div className="space-y-0.5">
                <h3 className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1">Pinned</h3>
                {pinnedChats.map((chat) => (
                  <ChatItem 
                    key={chat.id} 
                    chat={chat} 
                    onSelectChat={onSelectChat} 
                    editingChatId={editingChatId}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    setEditingChatId={setEditingChatId}
                    handleRenameSubmit={handleRenameSubmit}
                    handleUpdateChat={handleUpdateChat}
                    handleShare={handleShare}
                    handleDeleteChat={handleDeleteChat}
                    inputRef={inputRef}
                  />
                ))}
              </div>
            )}
            
            {recentChats.length > 0 && (
              <div className="space-y-0.5">
                <h3 className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1">Recents</h3>
                {recentChats.map((chat) => (
                  <ChatItem 
                    key={chat.id} 
                    chat={chat} 
                    onSelectChat={onSelectChat} 
                    editingChatId={editingChatId}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    setEditingChatId={setEditingChatId}
                    handleRenameSubmit={handleRenameSubmit}
                    handleUpdateChat={handleUpdateChat}
                    handleShare={handleShare}
                    handleDeleteChat={handleDeleteChat}
                    inputRef={inputRef}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 text-xs text-zinc-400 dark:text-zinc-500 mt-4">No chats yet</div>
        )}
      </ScrollArea>

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-[var(--sidebar-border-color)] bg-[var(--sidebar-bg)]">
        <div className="flex flex-col gap-2">
          <Link href="/profile" className="flex items-center justify-between px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer w-full">
            <div className="flex items-center gap-2 truncate max-w-[190px]">
              <div className="h-5 w-5 rounded-sm bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:text-zinc-300 shrink-0">{initial}</div>
              <span className="text-sm text-zinc-700 dark:text-[var(--sidebar-foreground)] font-medium truncate">{username} <span className="text-zinc-400 dark:text-zinc-500 font-normal">· Free</span></span>
            </div>
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-xs font-medium">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
      </div>
    <ProjectsModal 
      isOpen={isProjectsModalOpen} 
      onClose={() => setIsProjectsModalOpen(false)} 
      onSelectProject={(id) => {
        if (setActiveProjectId) setActiveProjectId(id);
      }}
      activeProjectId={activeProjectId}
    />
    </>
  );
}

function ChatItem({ chat, onSelectChat, editingChatId, editingTitle, setEditingTitle, setEditingChatId, handleRenameSubmit, handleUpdateChat, handleShare, handleDeleteChat, inputRef }: any) {
  const isEditing = editingChatId === chat.id;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-[#FFB81C]/40">
        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#FFB81C]" />
        <input 
          ref={inputRef}
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit(chat.id);
            if (e.key === 'Escape') setEditingChatId(null);
          }}
          className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none w-full min-w-0"
        />
        <button onClick={() => handleRenameSubmit(chat.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => setEditingChatId(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center w-full relative">
      <button 
        onClick={() => onSelectChat && onSelectChat(chat.id)}
        className="flex items-center gap-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors px-3 py-1.5 rounded-lg text-sm text-zinc-700 dark:text-[var(--sidebar-foreground)] w-full text-left truncate pr-8"
      >
        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
        <span className="truncate">{chat.title}</span>
      </button>

      <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 transition-colors">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <DropdownMenuItem onClick={() => {
              setEditingChatId(chat.id);
              setEditingTitle(chat.title);
            }} className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800">
              <Edit2 className="h-3.5 w-3.5 mr-2" />
              <span>Rename</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleUpdateChat(chat.id, { is_pinned: !chat.is_pinned })} className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800">
              <Pin className="h-3.5 w-3.5 mr-2" />
              <span>{chat.is_pinned ? "Unpin" : "Pin"}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleShare(chat.id)} className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800">
              <Share className="h-3.5 w-3.5 mr-2" />
              <span>Share</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => {
              if (confirm("Are you sure you want to delete this chat?")) {
                handleDeleteChat(chat.id);
              }
            }} className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20">
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
