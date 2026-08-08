"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AIMentor() {
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim() && !image) {
      setAnswer("Please ask a question or upload an image.");
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
        return;
      }

      const formData = new FormData();

      formData.append("question", question);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/mentor", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI Mentor failed"
        );
      }

      setAnswer(
        data.result ||
          data.answer ||
          "No response received."
      );
    } catch (error: any) {
      setAnswer(
        error?.message ||
          "AI connection failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setQuestion("");
    setImage(null);
    setAnswer("");
  };

  return (
    <div className="flex min-h-[620px] flex-col bg-[#091512]">

      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b border-emerald-300/10 px-5 py-4 md:px-6">

        <div className="flex items-center gap-3">

          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#5cf2d6]/20 bg-[#5cf2d6]/5">

            <span className="font-mono text-sm font-bold text-[#5cf2d6]">
              AI
            </span>

            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#c8ff5c] shadow-[0_0_12px_rgba(200,255,92,0.9)]"></span>

          </div>

          <div>

            <p className="text-sm font-semibold text-white">
              Neural Guide Core
            </p>

            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-100/30">
              Session // Active
            </p>

          </div>

        </div>

        <button
          onClick={newChat}
          className="ghost-button rounded-xl px-4 py-2 text-xs font-semibold"
        >
          + New Session
        </button>

      </div>

      {/* CHAT AREA */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5 md:p-7">

        {!answer && !loading && (
          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">
              <span className="font-mono text-[10px] font-bold text-[#5cf2d6]">
                AI
              </span>
            </div>

            <div className="max-w-2xl rounded-2xl rounded-tl-md border border-emerald-300/10 bg-emerald-300/[0.025] p-4">

              <div className="mb-2 flex items-center gap-2">

                <span className="signal-dot"></span>

                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-lime-200">
                  Neural Guide
                </span>

              </div>

              <p className="text-sm leading-7 text-emerald-50/60">
                Neural Guide initialized. Send a coding problem, concept,
                engineering doubt, placement question or upload a screenshot
                for analysis.
              </p>

            </div>

          </div>
        )}

        {(question || image) && (answer || loading) && (
          <div className="flex justify-end">

            <div className="max-w-2xl rounded-2xl rounded-tr-md border border-[#5cf2d6]/20 bg-[#5cf2d6]/10 p-4">

              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#5cf2d6]/60">
                Operator Input
              </div>

              {question && (
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
                  {question}
                </p>
              )}

              {image && (
                <div className="mt-3 rounded-xl border border-emerald-300/10 bg-black/10 px-3 py-2 font-mono text-[10px] text-emerald-100/45">
                  ATTACHMENT // {image.name}
                </div>
              )}

            </div>

          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">
              <span className="font-mono text-[10px] font-bold text-[#5cf2d6]">
                AI
              </span>
            </div>

            <div className="rounded-2xl rounded-tl-md border border-emerald-300/10 bg-emerald-300/[0.025] px-5 py-4">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6]"></span>

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6] [animation-delay:150ms]"></span>

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#c8ff5c] [animation-delay:300ms]"></span>

                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-100/35">
                  Processing request...
                </span>

              </div>

            </div>

          </div>
        )}

        {answer && !loading && (
          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">
              <span className="font-mono text-[10px] font-bold text-[#5cf2d6]">
                AI
              </span>
            </div>

            <div className="max-w-3xl rounded-2xl rounded-tl-md border border-emerald-300/10 bg-emerald-300/[0.025] p-5">

              <div className="mb-4 flex items-center justify-between gap-5">

                <div className="flex items-center gap-2">

                  <span className="signal-dot"></span>

                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-lime-200">
                    Solution Generated
                  </p>

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

          </div>
        )}

      </div>

      {/* INPUT CONSOLE */}
      <div className="border-t border-emerald-300/10 bg-[#08120f] p-4 md:p-5">

        {image && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-[#c8ff5c]/15 bg-[#c8ff5c]/5 px-4 py-3">

            <div className="min-w-0">

              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-lime-200/60">
                Image Attached
              </p>

              <p className="mt-1 truncate text-xs text-emerald-50/55">
                {image.name}
              </p>

            </div>

            <button
              onClick={() =>
                setImage(null)
              }
              className="ml-3 text-xs text-lime-200"
            >
              REMOVE
            </button>

          </div>
        )}

        <div className="command-input rounded-2xl p-3">

          <div className="flex items-center gap-2 border-b border-emerald-300/10 px-2 pb-2">

            <span className="signal-dot"></span>

            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-100/30">
              Input Console
            </span>

          </div>

          <textarea
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                askAI();
              }
            }}
            placeholder="Enter engineering query..."
            className="min-h-28 w-full resize-none bg-transparent px-2 py-4 text-sm leading-6 text-white outline-none placeholder:text-emerald-100/20"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-300/10 pt-3">

            <label className="ghost-button cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold">

              + Attach Screenshot

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setImage(
                    e.target.files?.[0] ||
                      null
                  )
                }
              />

            </label>

            <button
              onClick={askAI}
              disabled={loading}
              className="signal-button rounded-xl px-6 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "PROCESSING..."
                : "SEND TO NEURAL GUIDE →"}
            </button>

          </div>

        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-emerald-100/20">

          <span>
            ENTER // SEND
          </span>

          <span>
            SHIFT + ENTER // NEW LINE
          </span>

        </div>

      </div>

    </div>
  );
}