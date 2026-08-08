"use client";

import { useState } from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type QuizEngineProps = {
  questions: QuizQuestion[];
};

export default function QuizEngine({
  questions,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [score, setScore] =
    useState(0);

  const [submitted, setSubmitted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  if (!questions.length) {
    return null;
  }

  const currentQuestion =
    questions[currentIndex];

  function submitAnswer() {
    if (selectedAnswer === null) {
      return;
    }

    if (submitted) {
      return;
    }

    if (
      selectedAnswer ===
      currentQuestion.correctAnswer
    ) {
      setScore((prev) => prev + 1);
    }

    setSubmitted(true);
  }

  function nextQuestion() {
    if (
      currentIndex ===
      questions.length - 1
    ) {
      setFinished(true);
      return;
    }

    setCurrentIndex(
      (prev) => prev + 1
    );

    setSelectedAnswer(null);
    setSubmitted(false);
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setSubmitted(false);
    setFinished(false);
  }

  if (finished) {
    const percentage =
      Math.round(
        (score / questions.length) *
          100
      );

    return (
      <div className="rounded-3xl border border-[#5cf2d6]/15 bg-[#071512] p-7 text-center">

        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
          Quiz Complete
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          Final Score
        </h2>

        <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full border border-[#5cf2d6]/20 bg-[#5cf2d6]/5">

          <div>
            <p className="font-mono text-4xl font-bold text-[#5cf2d6]">
              {percentage}%
            </p>

            <p className="mt-1 text-xs text-emerald-50/40">
              {score}/{questions.length}
            </p>
          </div>

        </div>

        <p className="mt-6 text-sm text-emerald-50/55">
          {percentage >= 80
            ? "Excellent performance."
            : percentage >= 60
            ? "Good attempt. Revise weak areas."
            : "Review the material and try again."}
        </p>

        <button
          type="button"
          onClick={restartQuiz}
          className="signal-button mt-6 rounded-xl px-6 py-3 text-xs font-bold"
        >
          RESTART QUIZ →
        </button>

      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-300/10 bg-[#071512] p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Interactive Quiz
          </p>

          <h3 className="mt-2 text-lg font-semibold text-white">
            Question {currentIndex + 1}
          </h3>

        </div>

        <span className="font-mono text-[10px] text-[#5cf2d6]">
          {currentIndex + 1}/{questions.length}
        </span>

      </div>

      <div className="mt-5 rounded-2xl border border-[#5cf2d6]/10 bg-[#5cf2d6]/[0.025] p-5">

        <p className="text-sm leading-7 text-white/80">
          {currentQuestion.question}
        </p>

      </div>

      <div className="mt-5 space-y-3">

        {currentQuestion.options.map(
          (option, index) => {
            const selected =
              selectedAnswer === index;

            const correct =
              submitted &&
              index ===
                currentQuestion.correctAnswer;

            const wrong =
              submitted &&
              selected &&
              index !==
                currentQuestion.correctAnswer;

            return (
              <button
                key={index}
                type="button"
                disabled={submitted}
                onClick={() =>
                  setSelectedAnswer(index)
                }
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  correct
                    ? "border-lime-300/40 bg-lime-300/10 text-lime-200"
                    : wrong
                    ? "border-red-400/40 bg-red-400/10 text-red-300"
                    : selected
                    ? "border-[#5cf2d6]/40 bg-[#5cf2d6]/10 text-white"
                    : "border-emerald-300/10 bg-emerald-300/[0.02] text-emerald-50/60 hover:border-[#5cf2d6]/20"
                }`}
              >
                <span className="mr-3 font-mono text-[10px] text-emerald-100/35">
                  {String.fromCharCode(
                    65 + index
                  )}
                </span>

                {option}
              </button>
            );
          }
        )}

      </div>

      {submitted && (
        <div className="mt-5 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.025] p-4">

          <p className="text-sm font-semibold text-white">
            {selectedAnswer ===
            currentQuestion.correctAnswer
              ? "Correct ✓"
              : "Incorrect"}
          </p>

          {currentQuestion.explanation && (
            <p className="mt-2 text-xs leading-6 text-emerald-50/50">
              {currentQuestion.explanation}
            </p>
          )}

        </div>
      )}

      <div className="mt-6 flex justify-end">

        {!submitted ? (
          <button
            type="button"
            onClick={submitAnswer}
            disabled={
              selectedAnswer === null
            }
            className="signal-button rounded-xl px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            CHECK ANSWER →
          </button>
        ) : (
          <button
            type="button"
            onClick={nextQuestion}
            className="signal-button rounded-xl px-6 py-3 text-xs font-bold"
          >
            {currentIndex ===
            questions.length - 1
              ? "VIEW RESULT →"
              : "NEXT QUESTION →"}
          </button>
        )}

      </div>

    </div>
  );
}