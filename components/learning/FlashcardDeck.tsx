"use client";

import { useState } from "react";

export type Flashcard = {
  front: string;
  back: string;
};

type FlashcardDeckProps = {
  cards: Flashcard[];
};

export default function FlashcardDeck({
  cards,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [flipped, setFlipped] =
    useState(false);

  if (!cards.length) {
    return null;
  }

  const currentCard =
    cards[currentIndex];

  function nextCard() {
    if (
      currentIndex <
      cards.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );

      setFlipped(false);
    }
  }

  function previousCard() {
    if (currentIndex > 0) {
      setCurrentIndex(
        (prev) => prev - 1
      );

      setFlipped(false);
    }
  }

  function restartCards() {
    setCurrentIndex(0);
    setFlipped(false);
  }

  const progress =
    ((currentIndex + 1) /
      cards.length) *
    100;

  return (
    <div className="rounded-3xl border border-emerald-300/10 bg-[#071512] p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
            Memory Protocol
          </p>

          <h3 className="mt-2 text-lg font-semibold text-white">
            AI Flashcards
          </h3>
        </div>

        <span className="font-mono text-[10px] text-[#5cf2d6]">
          {currentIndex + 1}/{cards.length}
        </span>

      </div>

      {/* PROGRESS */}
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-300/10">

        <div
          className="h-full rounded-full bg-gradient-to-r from-[#5cf2d6] to-[#c8ff5c] transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* CARD */}
      <button
        type="button"
        onClick={() =>
          setFlipped(
            (prev) => !prev
          )
        }
        className="mt-6 flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/[0.025] p-8 text-center transition hover:border-[#5cf2d6]/30 hover:bg-[#5cf2d6]/[0.04]"
      >

        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5cf2d6]/45">
          {flipped
            ? "Answer"
            : "Question / Concept"}
        </p>

        <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/85">
          {flipped
            ? currentCard.back
            : currentCard.front}
        </p>

        <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-100/25">
          Click card to{" "}
          {flipped
            ? "view question"
            : "reveal answer"}
        </p>

      </button>

      {/* CONTROLS */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">

        <button
          type="button"
          onClick={previousCard}
          disabled={
            currentIndex === 0
          }
          className="ghost-button rounded-xl px-5 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← PREVIOUS
        </button>

        <button
          type="button"
          onClick={() =>
            setFlipped(
              (prev) => !prev
            )
          }
          className="ghost-button rounded-xl px-5 py-3 text-xs font-semibold"
        >
          {flipped
            ? "SHOW QUESTION"
            : "REVEAL ANSWER"}
        </button>

        {currentIndex <
        cards.length - 1 ? (
          <button
            type="button"
            onClick={nextCard}
            className="signal-button rounded-xl px-5 py-3 text-xs font-bold"
          >
            NEXT →
          </button>
        ) : (
          <button
            type="button"
            onClick={restartCards}
            className="signal-button rounded-xl px-5 py-3 text-xs font-bold"
          >
            RESTART ↻
          </button>
        )}

      </div>

    </div>
  );
}