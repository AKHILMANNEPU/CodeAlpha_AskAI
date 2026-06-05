"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Folder, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  title: string;
  created_at: string;
}

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (id: string | null) => void;
  activeProjectId?: string | null;
}

export function ProjectsModal({ isOpen, onClose, onSelectProject, activeProjectId }: ProjectsModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      setIsCreating(false);
      setNewTitle("");
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error Details:", JSON.stringify(error, null, 2));
        throw error;
      }
      setProjects(data || []);
    } catch (err: any) {
      console.error("Error fetching projects:", err.message || JSON.stringify(err));
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .insert([{ title: newTitle.trim(), user_id: session.user.id }])
        .select();

      if (error) {
        console.error("Supabase Create Error Details:", JSON.stringify(error, null, 2));
        throw error;
      }
      
      if (data && data.length > 0) {
        setProjects([data[0], ...projects]);
      }
      setIsCreating(false);
      setNewTitle("");
    } catch (err: any) {
      console.error("Error creating project:", err.message || JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-100 rounded-xl">
              <Folder className="h-5 w-5 text-zinc-700" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">Your Projects</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-4 mb-6">
              <label className="text-sm font-medium text-zinc-700">Project Name</label>
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newTitle.trim()}
                  className="flex-1 flex justify-center py-3 px-4 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Project"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition-colors mb-6 font-medium"
            >
              <Plus className="h-5 w-5" />
              Create New Project
            </button>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">All Projects</h3>
            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">No projects found. Create one to get started!</p>
            ) : (
              <div className="space-y-2">
                {projects.map(project => {
                  const isActive = project.id === activeProjectId;
                  return (
                    <button 
                      key={project.id}
                      onClick={() => {
                        if (onSelectProject) onSelectProject(project.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${isActive ? 'bg-orange-50/50 border-orange-100' : 'hover:bg-zinc-50 border-transparent hover:border-zinc-100'}`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-[#CB6015] text-white' : 'bg-orange-50 text-[#CB6015]'}`}>
                        <Folder className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-[#CB6015]' : 'text-zinc-900'}`}>{project.title}</h4>
                        <p className={`text-[11px] mt-0.5 truncate ${isActive ? 'text-[#CB6015]/70' : 'text-zinc-400'}`}>
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {isActive && (
                        <div className="shrink-0 px-2.5 py-1 rounded-full bg-[#CB6015]/10 text-[#CB6015] text-[10px] font-bold uppercase tracking-wide">
                          Active
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {!isFetching && projects.length > 0 && activeProjectId && (
              <button 
                onClick={() => {
                  if (onSelectProject) onSelectProject(null);
                  onClose();
                }}
                className="w-full mt-4 py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Clear selection (Return to main workspace)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
