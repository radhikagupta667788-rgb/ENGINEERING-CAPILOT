"use client";

import { useRef, useState } from "react";
import SmartLearning from "./SmartLearning";

type LearningMode =
  | "Quick Revision"
  | "Generate Quiz"
  | "Generate Flashcards"
  | "Interview Preparation";

export default function LearningWorkspace() {
  const [selectedMode, setSelectedMode] =
    useState<LearningMode>("Quick Revision");

  const workspaceRef =
    useRef<HTMLDivElement | null>(null);

  const cards = [
    {
      code: "KD-01",
      title: "Smart Summary",
      text: "Convert material into concise notes",
      mode: "Quick Revision" as LearningMode,
    },
    {
      code: "KD-02",
      title: "Quiz Engine",
      text: "Generate practice questions",
      mode: "Generate Quiz" as LearningMode,
    },
    {
      code: "KD-03",
      title: "Flashcards",
      text: "Create rapid revision cards",
      mode: "Generate Flashcards" as LearningMode,
    },
    {
      code: "KD-04",
      title: "Concept Guide",
      text: "Understand difficult topics",
      mode: "Interview Preparation" as LearningMode,
    },
  ];

  function handleCardClick(
    mode: LearningMode
  ) {
    setSelectedMode(mode);

    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  return (
    <div className="space-y-7">

      {/* LEARNING MODES */}
      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
            Learning Protocols
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Choose your study mode
          </h2>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {cards.map((card) => {
            const active =
              selectedMode === card.mode;

            return (
              <button
                key={card.code}
                type="button"
                onClick={() =>
                  handleCardClick(
                    card.mode
                  )
                }
                className={`rounded-3xl border p-5 text-left transition ${
                  active
                    ? "border-[#5cf2d6]/35 bg-[#5cf2d6]/10 shadow-[0_0_25px_rgba(92,242,214,0.08)]"
                    : "border-emerald-300/10 bg-[#0b1823] hover:border-[#5cf2d6]/25 hover:bg-[#5cf2d6]/[0.04]"
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="font-mono text-[9px] text-emerald-200/30">
                    {card.code}
                  </span>

                  <span
                    className={`h-2 w-2 rounded-full ${
                      active
                        ? "bg-[#c8ff5c] shadow-[0_0_12px_rgba(200,255,92,0.8)]"
                        : "bg-[#5cf2d6] shadow-[0_0_10px_rgba(92,242,214,0.7)]"
                    }`}
                  />

                </div>

                <h3 className="mt-4 text-sm font-semibold text-white">
                  {card.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-emerald-50/35">
                  {card.text}
                </p>

                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-[#5cf2d6]/45">
                  {active
                    ? "Selected"
                    : "Open Protocol →"}
                </p>

              </button>
            );
          })}

        </div>

      </section>

      {/* MAIN WORKSPACE */}
      <section
        ref={workspaceRef}
        className="scroll-mt-28"
      >

        <div className="mb-4 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
              Learning Workspace
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              AI Study Console
            </h2>

          </div>

          <div className="hidden items-center gap-2 sm:flex">

            <span className="signal-dot" />

            <span className="font-mono text-[10px] text-lime-200">
              LEARNING CORE READY
            </span>

          </div>

        </div>

        <div className="command-panel overflow-hidden rounded-[28px]">

          <SmartLearning
            externalMode={selectedMode}
          />

        </div>

      </section>

    </div>
  );
}