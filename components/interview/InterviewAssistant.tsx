"use client";

import { useState } from "react";
import { markActive } from "@/lib/notifications";

type InterviewFeedback = {
  score: number;
  feedback: string;
  strongPoints: string[];
  missingPoints: string[];
  betterAnswer: string;
  nextQuestion: string;
};

export default function InterviewAssistant() {
  const [role, setRole] = useState("Software Engineer");
  const [interviewType, setInterviewType] =
    useState("Technical");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] =
    useState<InterviewFeedback | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setAnswer("");
    setFeedback(null);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          interviewType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Question generate nahi hua."
        );
      }

      setQuestion(data.question);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!question) {
      setError("Pehle interview start karo.");
      return;
    }

    if (!answer.trim()) {
      setError("Apna answer likho.");
      return;
    }

    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          interviewType,
          question,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Feedback generate nahi hua."
        );
      }

      setFeedback(data.feedback);
      markActive();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const openNextQuestion = () => {
    if (!feedback?.nextQuestion) return;

    setQuestion(feedback.nextQuestion);
    setAnswer("");
    setFeedback(null);
    setError("");
  };

  const score = Math.min(
    10,
    Math.max(0, feedback?.score ?? 0)
  );

  return (
    <div className="mx-auto max-w-6xl">
      {/* Interview Setup */}
      <section className="theme-card rounded-3xl p-8 shadow-lg">
        <p className="theme-muted text-sm font-semibold uppercase tracking-widest">
          Interview Practice
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          🎤 AI Mock Interview
        </h1>

        <p className="theme-muted mt-2">
          Practice questions and receive structured AI feedback.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Target Role
            </label>

            <input
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              placeholder="Example: Java Developer"
              className="theme-card w-full rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Interview Type
            </label>

            <select
              value={interviewType}
              onChange={(event) =>
                setInterviewType(event.target.value)
              }
              className="theme-card w-full rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Behavioral">
                Behavioral
              </option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={startInterview}
          disabled={loading}
          className="theme-primary mt-6 rounded-xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && !question
            ? "Generating..."
            : question
              ? "🔄 Generate New Question"
              : "▶ Start Interview"}
        </button>
      </section>

      {/* Question and Answer */}
      {question && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="theme-card rounded-3xl p-7 shadow-sm">
            <p className="theme-muted text-sm font-semibold uppercase tracking-wider">
              Interview Question
            </p>

            <h2 className="mt-4 text-xl font-bold leading-8">
              {question}
            </h2>

            <div className="mt-6 rounded-2xl border p-4">
              <p className="font-semibold">
                💡 Answer Tips
              </p>

              <ul className="theme-muted mt-3 space-y-2 text-sm">
                <li>• Explain your approach clearly.</li>
                <li>• Add an example where possible.</li>
                <li>
                  • Mention complexity for coding questions.
                </li>
              </ul>
            </div>
          </section>

          <section className="theme-card rounded-3xl p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Write Your Answer
              </h2>

              <span className="theme-muted text-sm">
                {answer.length} characters
              </span>
            </div>

            <textarea
              value={answer}
              onChange={(event) =>
                setAnswer(event.target.value)
              }
              placeholder="Explain your approach step by step..."
              className="theme-card mt-5 h-64 w-full resize-y rounded-2xl p-5 leading-7 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={submitAnswer}
                disabled={loading}
                className="theme-primary rounded-xl px-6 py-3 font-semibold disabled:opacity-50"
              >
                {loading
                  ? "Checking Answer..."
                  : "Submit Answer"}
              </button>

              <button
                type="button"
                onClick={() => setAnswer("")}
                className="rounded-xl border px-5 py-3 font-semibold"
              >
                Clear
              </button>
            </div>
          </section>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Structured Feedback */}
      {feedback && (
        <section className="mt-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Score */}
            <div className="theme-card rounded-3xl p-7 text-center shadow-sm">
              <p className="theme-muted font-semibold">
                Interview Score
              </p>

              <div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full border-8 border-blue-500">
                <div>
                  <p className="text-4xl font-bold">
                    {score}
                  </p>
                  <p className="theme-muted">out of 10</p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600"
                  style={{
                    width: `${score * 10}%`,
                  }}
                />
              </div>
            </div>

            {/* Feedback */}
            <div className="theme-card rounded-3xl p-7 shadow-sm lg:col-span-2">
              <h2 className="text-xl font-bold">
                💬 Overall Feedback
              </h2>

              <p className="mt-4 leading-8">
                {feedback.feedback}
              </p>
            </div>

            {/* Strong Points */}
            <div className="rounded-3xl border border-green-200 bg-green-50 p-7 text-green-950 shadow-sm">
              <h2 className="text-xl font-bold">
                ✅ Strong Points
              </h2>

              <ul className="mt-4 space-y-3">
                {feedback.strongPoints.map(
                  (point, index) => (
                    <li key={index}>• {point}</li>
                  )
                )}
              </ul>
            </div>

            {/* Missing Points */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7 text-amber-950 shadow-sm">
              <h2 className="text-xl font-bold">
                ⚠️ Missing Points
              </h2>

              <ul className="mt-4 space-y-3">
                {feedback.missingPoints.map(
                  (point, index) => (
                    <li key={index}>• {point}</li>
                  )
                )}
              </ul>
            </div>

            {/* Next Question */}
            <div className="rounded-3xl border border-purple-200 bg-purple-50 p-7 text-purple-950 shadow-sm">
              <h2 className="text-xl font-bold">
                ➡️ Next Question
              </h2>

              <p className="mt-4 leading-7">
                {feedback.nextQuestion}
              </p>

              <button
                type="button"
                onClick={openNextQuestion}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Answer Next Question
              </button>
            </div>
          </div>

          {/* Better Answer */}
          <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-8 text-blue-950 shadow-sm">
            <h2 className="text-2xl font-bold">
              💡 Better Interview Answer
            </h2>

            <p className="mt-5 whitespace-pre-wrap leading-8">
              {feedback.betterAnswer}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}