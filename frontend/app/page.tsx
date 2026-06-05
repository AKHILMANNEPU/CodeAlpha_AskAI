"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, BrainCircuit, Zap, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { SplineScene } from "@/components/ui/spline";
import { ElegantShape } from "@/components/ui/elegant-shape";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Delay logo appearance to wait for 3D file load and zoom-out animation
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 3500);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/chat");
      } else {
        setIsAuthenticated(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/chat");
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      clearTimeout(logoTimer);
      subscription.unsubscribe();
    };
  }, [router]);
  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
          <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
          <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
          <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
          <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none z-0" />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-between w-full h-full min-h-screen px-6 md:px-24 relative z-10 py-20 md:py-0">
        
        {/* Left Side: Typography Section */}
        <div className="flex-1 max-w-2xl text-center md:text-left space-y-6 z-10 pt-10 md:pt-0 pointer-events-none mt-10 md:mt-0">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF5B00] to-[#FF9500] drop-shadow-sm">
              The Ultimate
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-[85px] font-bold tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 drop-shadow-sm pb-2">
              FAQ & AI Assistant
            </h1>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-[16px] md:text-[19px] leading-relaxed text-zinc-300 font-normal">
              Enterprise-grade chatbot platform powered by advanced AI models. Seamless, accurate, and insanely fast.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-6 pointer-events-auto">
            <Link 
              href={isAuthenticated ? "/chat" : "/login"}
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all duration-300 w-full sm:w-auto"
            >
              Start Chatting 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isAuthenticated && (
              <Link 
                href="/login"
                className="px-8 py-3.5 bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium rounded-full border border-zinc-700 transition-colors w-full sm:w-auto text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Right Side: Spline 3D Scene */}
        <div className="w-full h-[45vh] md:h-screen relative pointer-events-auto md:-mr-10 z-0 flex-shrink-0 mt-8 md:mt-0 md:flex-1">
          <div className="absolute inset-0 w-full h-full flex items-center justify-center -translate-y-4 md:-translate-y-16 lg:-translate-y-20">
            <SplineScene 
              scene="https://prod.spline.design/PAx4b6MPSxF2ME2f/scene.splinecode"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Static Locked Logo on Chest */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 -translate-y-4 md:-translate-y-16 lg:-translate-y-20 transition-opacity duration-1000 ease-in-out ${showLogo ? 'opacity-100' : 'opacity-0'}`}>
            <img 
              src="/askai-logo.svg" 
              alt="AskAI Logo" 
              className="w-10 md:w-16 lg:w-20 -mt-10 md:-mt-20 lg:-mt-24 opacity-90 drop-shadow-[0_0_15px_rgba(239,121,0,0.6)]" 
            />
          </div>

          {/* Inner glow to blend edges if needed */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none"></div>
        </div>

      </main>

      {/* Feature Cards below the main hero section */}
      <div className="w-full px-6 md:px-24 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto pointer-events-auto">
          {/* Card 1 */}
          <SpotlightCard className="p-6" spotlightColor="rgba(59, 130, 246, 0.15)">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <BrainCircuit className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Smart AI Models</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Seamlessly switch between top-tier models like LLaMA, Gemini, and Claude for the smartest possible responses.
            </p>
          </SpotlightCard>

          {/* Card 2 */}
          <SpotlightCard className="p-6" spotlightColor="rgba(234, 179, 8, 0.15)">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 border border-yellow-500/20">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Experience real-time streaming text generation. Get your answers the absolute moment you hit send.
            </p>
          </SpotlightCard>

          {/* Card 3 */}
          <SpotlightCard className="p-6" spotlightColor="rgba(16, 185, 129, 0.15)">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Enterprise Security</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your data, documents, and chat history are strictly protected with enterprise-grade encryption.
            </p>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
