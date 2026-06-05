"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, User as UserIcon, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      setUser(user);
      setEmail(user.email || "");
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName
        }
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete account');
      }

      await supabase.auth.signOut();
      router.push("/login");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account. Please try again.' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#CB6015]" />
      </div>
    );
  }

  const initial = firstName ? firstName.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F4F4F4] dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 sticky top-0 z-10">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>
          <h1 className="font-semibold text-zinc-800 dark:text-zinc-100">Profile Settings</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-xl mx-auto w-full space-y-6">
          
          {/* Badge & Email Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#CB6015] to-[#FFB81C] flex items-center justify-center text-3xl font-bold text-white shadow-inner mb-4">
              {initial}
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {firstName} {lastName}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{email}</p>
            <div className="mt-3 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
              <UserIcon className="h-3 w-3" />
              Standard User
            </div>
          </div>

          {/* Form Alerts */}
          {message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Edit Details Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Personal Details</h3>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 ml-1">Email address cannot be changed currently.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#2D230F] hover:bg-[#1a1409] text-white font-medium transition-colors disabled:opacity-70 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-6 md:p-8 border border-red-100 dark:border-red-900/30">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
              Once you delete your account, there is no going back. Please be certain. All your chats, projects, and data will be permanently wiped.
            </p>
            
            {showDeleteConfirm ? (
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Are you absolutely sure?</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-70"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete My Account"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
