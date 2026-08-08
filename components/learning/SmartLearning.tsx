"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QuizEngine from "./QuizEngine";
import FlashcardDeck, {
  type Flashcard,
} from "./FlashcardDeck";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type Props = {
  externalMode?: string;
};

export default function SmartLearning({
  externalMode,
}: Props) {
  const [pdf, setPdf] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState(
    externalMode || "Quick Revision"
  );
  const [result, setResult] = useState("");
  const [quizQuestions, setQuizQuestions] =
    useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] =
    useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const modes = [
    "Quick Revision",
    "Exam Answer",
    "Interview Preparation",
    "Generate Quiz",
    "Generate Flashcards",
  ];

  useEffect(() => {
    if (externalMode) {
      setMode(externalMode);
      setResult("");
      setQuizQuestions([]);
      setFlashcards([]);
    }
  }, [externalMode]);

  async function askAI() {
    if (!pdf) {
      setResult("Please upload PDF first.");
      return;
    }

    try {
      setLoading(true);
      setResult("");
      setQuizQuestions([]);
      setFlashcards([]);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setResult("Please login first.");
        return;
      }

      const formData = new FormData();

      formData.append("pdf", pdf);
      formData.append("question", question);
      formData.append("mode", mode);

      const response = await fetch("/api/learning", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          responseText || "Invalid server response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Learning AI failed."
        );
      }

      if (mode === "Generate Quiz") {
        if (
          Array.isArray(data.quizQuestions) &&
          data.quizQuestions.length > 0
        ) {
          setQuizQuestions(data.quizQuestions);
        } else {
          setResult("Quiz could not be generated.");
        }

        return;
      }

      if (mode === "Generate Flashcards") {
        if (
          Array.isArray(data.flashcards) &&
          data.flashcards.length > 0
        ) {
          setFlashcards(data.flashcards);
        } else {
          setResult("Flashcards could not be generated.");
        }

        return;
      }

      setResult(
        data.result || "No response generated."
      );
    } catch (error) {
      console.log("SMART LEARNING ERROR:", error);

      setResult(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function changeMode(selectedMode: string) {
    setMode(selectedMode);
    setResult("");
    setQuizQuestions([]);
    setFlashcards([]);
  }

  function removePDF() {
    setPdf(null);
    setResult("");
    setQuizQuestions([]);
    setFlashcards([]);
  }

  return (
    <div className="bg-[#091512] p-5 md:p-7">

      {/* TOP STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-300/10 pb-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Knowledge Console
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            AI Study Intelligence Engine
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="signal-dot" />
          <span className="font-mono text-[9px] text-lime-200">
            READY FOR MATERIAL
          </span>
        </div>
      </div>

      {/* PDF UPLOAD */}
      <div className="mt-6 rounded-3xl border border-dashed border-[#5cf2d6]/20 bg-[#5cf2d6]/[0.025] p-8 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">
          <span className="font-mono text-base font-bold text-[#5cf2d6]">
            PDF
          </span>
        </div>

        <h3 className="mt-5 text-base font-semibold text-white">
          Load Study Material
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-emerald-50/35">
          Upload lecture notes, books or study material and convert them
          into notes, quizzes and flashcards.
        </p>

        <label className="ghost-button mt-5 inline-flex cursor-pointer rounded-xl px-5 py-3 text-xs font-semibold">
          Select Study PDF

          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const selected =
                e.target.files?.[0] || null;

              setPdf(selected);
              setResult("");
              setQuizQuestions([]);
              setFlashcards([]);
            }}
          />
        </label>

        {pdf && (
          <div className="mx-auto mt-5 flex max-w-lg items-center justify-between gap-4 rounded-2xl border border-lime-300/10 bg-lime-300/[0.04] px-4 py-3 text-left">

            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-lime-200/60">
                Material Loaded
              </p>

              <p className="mt-1 truncate text-xs text-emerald-50/60">
                {pdf.name}
              </p>
            </div>

            <button
              type="button"
              onClick={removePDF}
              className="text-xs font-semibold text-lime-200"
            >
              REMOVE
            </button>

          </div>
        )}

      </div>

      {/* MODES */}
      <div className="mt-7">

        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
          Learning Protocol
        </p>

        <div className="mt-3 flex flex-wrap gap-3">

          {modes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeMode(item)}
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

      </div>

      {/* QUERY */}
      <div className="mt-7">

        <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
          Learning Query
        </label>

        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder={
            mode === "Generate Quiz"
              ? "Example: Generate important MCQs from chapter 3..."
              : mode === "Generate Flashcards"
              ? "Example: Create revision flashcards for important concepts..."
              : "Example: Explain chapter 3 simply or create revision notes..."
          }
          className="command-input mt-3 min-h-36 w-full resize-none rounded-2xl p-5 text-sm leading-7 text-white"
        />

      </div>

      {/* ACTION */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-100/25">
          MODE // {mode}
        </div>

        <button
          type="button"
          onClick={askAI}
          disabled={loading}
          className="cursor-pointer rounded-xl bg-gradient-to-r from-[#5cf2d6] to-[#c8ff5c] px-7 py-3 text-xs font-bold text-[#07110f] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? mode === "Generate Quiz"
              ? "BUILDING QUIZ..."
              : mode === "Generate Flashcards"
              ? "BUILDING FLASHCARDS..."
              : "PROCESSING MATERIAL..."
            : mode === "Generate Quiz"
            ? "GENERATE INTERACTIVE QUIZ →"
            : mode === "Generate Flashcards"
            ? "GENERATE FLASHCARDS →"
            : "RUN LEARNING ENGINE →"}
        </button>

      </div>

      {!pdf && (
        <p className="mt-3 text-right text-[10px] text-emerald-100/25">
          Upload a PDF before running the learning engine.
        </p>
      )}

      {/* LOADING */}
      {loading && (
        <div className="command-panel mt-7 rounded-3xl p-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5">

            <div className="flex gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cf2d6] [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#c8ff5c] [animation-delay:300ms]" />
            </div>

          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100/35">
            {mode === "Generate Quiz"
              ? "Generating interactive quiz..."
              : mode === "Generate Flashcards"
              ? "Building revision flashcards..."
              : "Analyzing knowledge material..."}
          </p>

        </div>
      )}

      {/* NORMAL RESULT */}
      {result && !loading && (
        <div className="command-panel mt-7 rounded-3xl p-6">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300/10 pb-4">

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                Generated Output
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                Knowledge Response
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(result)
              }
              className="ghost-button rounded-lg px-3 py-1.5 font-mono text-[9px]"
            >
              COPY
            </button>

          </div>

          <div className="mt-5 whitespace-pre-wrap text-sm leading-8 text-emerald-50/65">
            {result}
          </div>

        </div>
      )}

      {/* QUIZ */}
      {quizQuestions.length > 0 && !loading && (
        <div className="mt-7">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                Quiz Protocol
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                Interactive Practice Session
              </h3>
            </div>

            <span className="rounded-full border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 px-3 py-2 font-mono text-[9px] text-[#5cf2d6]">
              {quizQuestions.length} QUESTIONS
            </span>

          </div>

          <QuizEngine questions={quizQuestions} />

        </div>
      )}

      {/* FLASHCARDS */}
      {flashcards.length > 0 && !loading && (
        <div className="mt-7">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                Memory Protocol
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                AI Revision Deck
              </h3>
            </div>

            <span className="rounded-full border border-lime-300/15 bg-lime-300/[0.04] px-3 py-2 font-mono text-[9px] text-lime-200">
              {flashcards.length} CARDS
            </span>

          </div>

          <FlashcardDeck cards={flashcards} />

        </div>
      )}

    </div>
  );
}