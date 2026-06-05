"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, MailCheck, Sparkles, Eye, EyeOff, Home } from "lucide-react";

type ViewState = "login" | "signup" | "forgot_password" | "check_email";

export default function LoginPage() {
  const [view, setView] = useState<ViewState>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/chat");
      } else if (view === "signup") {
        // Industry-standard password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName || null,
            }
          }
        });
        if (error) throw error;
        router.push("/chat");
      } else if (view === "forgot_password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        setView("check_email");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "check_email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans selection:bg-orange-100 p-4 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Check your inbox</h1>
          <p className="text-sm text-zinc-500 mb-8">
            We've sent a password reset link to <br />
            <span className="font-medium text-zinc-900">{email}</span>
          </p>
          <button
            onClick={() => setView("login")}
            className="w-full py-3.5 rounded-2xl bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans selection:bg-orange-100 p-4 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
        {view === "forgot_password" && (
          <button 
            onClick={() => {
              setView("login");
              setError(null);
            }} 
            className="absolute top-8 left-8 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="mb-8 text-center mt-2">
          {view !== "forgot_password" && (
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
          )}
          
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            {view === "login" && "Welcome back"}
            {view === "signup" && "Create your account"}
            {view === "forgot_password" && "Reset your password"}
          </h1>
          <p className="text-sm text-zinc-500">
            {view === "login" && "Enter your details to access your chats"}
            {view === "signup" && "Sign up to start chatting with AI"}
            {view === "forgot_password" && "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {view === "signup" && (
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-sm font-medium text-zinc-700 ml-1">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-sm font-medium text-zinc-700 ml-1">Last name <span className="text-zinc-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 ml-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          {view !== "forgot_password" && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                {view === "login" && (
                  <button 
                    type="button"
                    onClick={() => {
                      setView("forgot_password");
                      setError(null);
                    }}
                    className="text-xs font-medium text-[#FFB81C] hover:text-[#e0a016] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FFB81C] focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {view === "signup" && (
                <p className="text-[11px] text-zinc-500 ml-1 mt-1">
                  Must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              view === "login" ? "Sign In" : 
              view === "signup" ? "Continue" : 
              "Send Reset Link"
            )}
          </button>
        </form>

        {view !== "forgot_password" && (
          <div className="mt-8 text-center text-sm text-zinc-500">
            {view === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setView(view === "login" ? "signup" : "login");
                setError(null);
              }}
              className="font-semibold text-black hover:text-[#FFB81C] transition-colors"
            >
              {view === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
