"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CodingAssistant() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Java");
  const [mode, setMode] = useState("Debug");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    if (!code.trim()) {
      setResult("Please paste your code first.");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setResult("Please login first.");
        return;
      }

      const res = await fetch("/api/coding", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          code,
          language,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "AI analysis failed"
        );
      }

      setResult(
        data.answer ||
        "No AI response received."
      );
    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "AI connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="command-panel overflow-hidden rounded-3xl">

      {/* TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-300/10 px-6 py-5">

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Code Intelligence Console
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            AI Coding Assistant
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="signal-dot"></span>

          <span className="font-mono text-[9px] text-lime-200">
            ENGINE ONLINE
          </span>
        </div>

      </div>

      <div className="p-6">

        {/* CONFIGURATION */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* LANGUAGE */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-100/35">
              Programming Language
            </label>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
              className="command-input mt-3 w-full rounded-xl p-3 text-sm text-white"
            >
              <option className="bg-[#091512]">
                Java
              </option>

              <option className="bg-[#091512]">
                Python
              </option>

              <option className="bg-[#091512]">
                C++
              </option>

              <option className="bg-[#091512]">
                JavaScript
              </option>

              <option className="bg-[#091512]">
                SQL
              </option>
            </select>
          </div>

          {/* MODE */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-100/35">
              AI Operation
            </label>

            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value)
              }
              className="command-input mt-3 w-full rounded-xl p-3 text-sm text-white"
            >
              <option
                value="Review"
                className="bg-[#091512]"
              >
                Review Code
              </option>

              <option
                value="Debug"
                className="bg-[#091512]"
              >
                Debug Code
              </option>

              <option
                value="Explain"
                className="bg-[#091512]"
              >
                Explain Code
              </option>

              <option
                value="Optimize"
                className="bg-[#091512]"
              >
                Optimize Code
              </option>
            </select>
          </div>

        </div>

        {/* CODE INPUT */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-300/10">

          <div className="flex items-center justify-between border-b border-emerald-300/10 bg-[#08130f] px-4 py-3">

            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-100/30">
              Source Input
            </span>

            <span className="font-mono text-[9px] text-[#5cf2d6]/60">
              {language}
            </span>

          </div>

          <textarea
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            spellCheck={false}
            placeholder="// Paste your code here..."
            className="h-72 w-full resize-none bg-[#06100d] p-5 font-mono text-sm leading-7 text-emerald-50 outline-none placeholder:text-emerald-100/20"
          />

        </div>

        {/* ACTION */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-100/25">
            {language} // {mode}
          </p>

          <button
            onClick={runAI}
            disabled={loading}
            className="signal-button rounded-xl px-7 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "PROCESSING..."
              : `RUN ${mode.toUpperCase()} →`}
          </button>

        </div>

        {/* AI RESPONSE */}
        {result && (
          <div className="mt-7 rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.025] p-6">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300/10 pb-4">

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                  Generated Analysis
                </p>

                <h3 className="mt-1 text-lg font-semibold text-white">
                  AI Response
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    result
                  )
                }
                className="ghost-button rounded-lg px-3 py-1.5 font-mono text-[9px]"
              >
                COPY
              </button>

            </div>

            <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-8 text-emerald-50/65">
              {result}
            </pre>

          </div>
        )}

      </div>

    </div>
  );
}