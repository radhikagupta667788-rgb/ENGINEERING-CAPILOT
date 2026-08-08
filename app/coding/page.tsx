"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CodingPage() {
  const [code, setCode] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("Review");

  const modes = [
    "Review",
    "Debug",
    "Explain",
    "Optimize",
  ];

  async function analyzeCode() {
    if (!code.trim()) {
      setAnswer("Please paste some code first.");
      return;
    }

    try {
      setLoading(true);
      setAnswer("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAnswer("Please login first.");
        setLoading(false);
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
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Code analysis failed"
        );
      }

      setAnswer(
        data.answer ||
          "No response received."
      );
    } catch (error: any) {
      setAnswer(
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="signal-panel relative overflow-hidden rounded-[30px] p-7 md:p-9">

        <div className="relative z-10 max-w-3xl">

          <div className="system-label">
            <span className="signal-dot"></span>
            Code Lab Ready
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            Code Lab
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#5cf2d6]/60">
            AI Coding Assistant
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50">
            Review, debug, explain and optimize
            your source code using the AI
            engineering analysis engine.
          </p>

        </div>

        <div className="absolute right-8 top-8 hidden xl:block">

          <div className="rounded-2xl border border-emerald-300/10 bg-black/10 p-5 font-mono text-[10px] text-emerald-100/35">

            <p>
              MODULE: CODE_LAB
            </p>

            <p className="mt-2">
              ENGINE: AI_REVIEW
            </p>

            <p className="mt-2">
              INPUT: SOURCE_CODE
            </p>

            <p className="mt-2 text-lime-300">
              STATUS: READY
            </p>

          </div>

        </div>

      </section>

      {/* MODE SELECTOR */}
      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
            Analysis Mode
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Choose operation
          </h2>

        </div>

        <div className="flex flex-wrap gap-3">

          {modes.map((item) => (
            <button
              key={item}
              onClick={() =>
                setMode(item)
              }
              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                mode === item
                  ? "signal-button"
                  : "ghost-button"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

      </section>

      {/* WORKSPACE */}
      <section className="grid gap-5 xl:grid-cols-2">

        {/* SOURCE CODE */}
        <div className="command-panel overflow-hidden rounded-3xl">

          <div className="flex items-center justify-between border-b border-emerald-300/10 px-5 py-4">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                Input Console
              </p>

              <h2 className="mt-1 text-sm font-semibold text-white">
                Source Code
              </h2>

            </div>

            <div className="flex items-center gap-2">

              <span className="signal-dot"></span>

              <span className="font-mono text-[9px] text-lime-200">
                EDIT MODE
              </span>

            </div>

          </div>

          <textarea
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            placeholder="// Paste your code here..."
            spellCheck={false}
            className="min-h-[420px] w-full resize-none bg-[#06100d] p-6 font-mono text-sm leading-7 text-emerald-50 outline-none placeholder:text-emerald-100/20"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-300/10 bg-[#08130f] px-5 py-4">

            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-100/25">
              MODE // {mode}
            </div>

            <button
              onClick={analyzeCode}
              disabled={loading}
              className="signal-button rounded-xl px-6 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "ANALYZING..."
                : `RUN ${mode.toUpperCase()} →`}
            </button>

          </div>

        </div>

        {/* AI OUTPUT */}
        <div className="command-panel overflow-hidden rounded-3xl">

          <div className="flex items-center justify-between border-b border-emerald-300/10 px-5 py-4">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                Output Console
              </p>

              <h2 className="mt-1 text-sm font-semibold text-white">
                AI Analysis
              </h2>

            </div>

            <div className="flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full ${
                  loading
                    ? "animate-pulse bg-yellow-300"
                    : "bg-lime-300"
                }`}
              ></span>

              <span className="font-mono text-[9px] text-emerald-100/35">
                {loading
                  ? "PROCESSING"
                  : "STANDBY"}
              </span>

            </div>

          </div>

          <div className="min-h-[420px] bg-[#091512] p-6">

            {loading ? (

              <div className="flex min-h-[350px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">

                    <div className="flex gap-1">

                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6]"></span>

                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6] [animation-delay:150ms]"></span>

                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#c8ff5c] [animation-delay:300ms]"></span>

                    </div>

                  </div>

                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/35">
                    AI inspecting source code...
                  </p>

                </div>

              </div>

            ) : answer ? (

              <div>

                <div className="mb-5 flex items-center justify-between">

                  <div className="system-label">
                    <span className="signal-dot"></span>
                    Analysis Complete
                  </div>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        answer
                      )
                    }
                    className="ghost-button rounded-lg px-3 py-1.5 font-mono text-[9px]"
                  >
                    COPY
                  </button>

                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-emerald-50/65">
                  {answer}
                </p>

              </div>

            ) : (

              <div className="flex min-h-[350px] items-center justify-center">

                <div className="max-w-sm text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 font-mono text-sm font-bold text-[#5cf2d6]">
                    {"</>"}
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-white">
                    Awaiting code analysis
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-emerald-50/35">
                    Paste your code, choose an
                    operation and run the AI
                    analysis.
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>

    </div>
  );
}