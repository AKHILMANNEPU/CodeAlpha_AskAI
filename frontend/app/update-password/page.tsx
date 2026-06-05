"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Sparkles } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      // Industry-standard password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).");
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      // Sign out to force the user to log in with the new password
      await supabase.auth.signOut();
      
      // Redirect to login page
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans selection:bg-orange-100 p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="mb-8 text-center mt-2">
          <svg className="w-12 h-auto mx-auto mb-6" viewBox="0 0 550.59 428.1" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-gradient" y1="214.02" x2="550.59" y2="214.02" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ef7900" />
                <stop offset="1" stopColor="#fbc200" />
              </linearGradient>
            </defs>
            <path fill="url(#logo-gradient)" d="M275.29 0l137.65 214.01 137.65 214.02H320.65l75.1-116.76-120.46-187.29L79.74 428.03H0l137.65-214.02L275.29 0z" />
            <path className="fill-zinc-800 dark:fill-zinc-100" fillRule="evenodd" d="M291.52 428h-76.61l28.79-44.69 84.65-131.63 38.3 59.56-46.39 72.07-28.79 44.79zm-104.59 0l28.79-44.69L314.39 230l-39.1-60.77-137.64 214.11L108.86 428z" />
          </svg>
          
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Create new password
          </h1>
          <p className="text-sm text-zinc-500">
            Your new password must be strong and secure.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 ml-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <p className="text-[11px] text-zinc-500 ml-1 mt-1">
              Must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 ml-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
          </button>
        </form>

      </div>
    </div>
  );
}
