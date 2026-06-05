"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MessageSquare, Mic, Type, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ChatLog {
  id: number;
  question: string;
  answer: string;
  language: string;
  input_type: string;
  created_at: string;
}

export default function Dashboard() {
  const [data, setData] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("https://codealphaaskai-production.up.railway.app/analytics")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching analytics:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CB6015]"></div>
      </div>
    );
  }

  // --- Process Data for Charts ---
  
  // Total Queries
  const totalQueries = data.length;

  // Input Type (Voice vs Text)
  const voiceCount = data.filter((item) => item.input_type === "voice").length;
  const textCount = data.filter((item) => item.input_type !== "voice").length;

  // Language Distribution
  const langCountMap: Record<string, number> = {};
  data.forEach((item) => {
    const lang = item.language || "en-US";
    langCountMap[lang] = (langCountMap[lang] || 0) + 1;
  });

  const langNames: Record<string, string> = {
    "en-US": "English",
    "te-IN": "Telugu",
    "hi-IN": "Hindi",
    "ta-IN": "Tamil",
    "kn-IN": "Kannada",
  };

  const languageData = Object.keys(langCountMap).map((key) => ({
    name: langNames[key] || key,
    value: langCountMap[key],
  }));

  const COLORS = ["#CB6015", "#E87C2E", "#F4A261", "#E9C46A", "#2A9D8F"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-800 transition-all mb-3 -translate-x-4 px-2 py-1 rounded-md hover:bg-zinc-100">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Chat
            </Link>
            <h1 className="text-3xl font-bold font-serif text-zinc-800">
              Analytics Dashboard
            </h1>
            <p className="text-zinc-500 mt-1">Real-time insights and monitoring for your AI Chatbot.</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Total Queries</p>
                <h3 className="text-3xl font-bold">{totalQueries}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Voice Queries</p>
                <h3 className="text-3xl font-bold">{voiceCount}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Type className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Text Queries</p>
                <h3 className="text-3xl font-bold">{textCount}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Language Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-800">
              <Activity className="h-5 w-5 text-[#CB6015]" />
              Language Usage
            </h2>
            {languageData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-400">
                No data available
              </div>
            )}
            {/* Legend */}
            <div className="flex justify-center gap-4 flex-wrap mt-2">
              {languageData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-sm text-zinc-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>

          {/* Input Type Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-800">
              <Activity className="h-5 w-5 text-[#CB6015]" />
              Voice vs Text Usage
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Voice', count: voiceCount },
                    { name: 'Text', count: textCount }
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f9f9f9'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#CB6015" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Conversations Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
          <h2 className="text-lg font-bold mb-4 text-zinc-800">Recent Conversations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="py-3 px-4 text-sm font-semibold text-zinc-500 w-[30%]">Question</th>
                  <th className="py-3 px-4 text-sm font-semibold text-zinc-500 w-[40%]">Response</th>
                  <th className="py-3 px-4 text-sm font-semibold text-zinc-500">Language</th>
                  <th className="py-3 px-4 text-sm font-semibold text-zinc-500">Type</th>
                  <th className="py-3 px-4 text-sm font-semibold text-zinc-500">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.slice(0, 10).map((item, index) => (
                  <tr key={item.id || index} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-4 align-top">
                      <div className="line-clamp-2 text-zinc-800">{item.question}</div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="line-clamp-2 text-zinc-600">{item.answer}</div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-xs font-medium">
                        {langNames[item.language] || item.language || "English"}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top text-zinc-600 capitalize">{item.input_type || "text"}</td>
                    <td className="py-3 px-4 align-top text-zinc-500">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No conversation logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
