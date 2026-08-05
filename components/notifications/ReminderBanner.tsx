"use client";

import { useEffect, useState } from "react";
import {
  getHoursSinceLastActive,
  getStreak,
  isReminderEnabled,
} from "@/lib/notifications";

export default function ReminderBanner() {
  const [hoursSince, setHoursSince] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHoursSince(getHoursSinceLastActive());
    setStreak(getStreak());
    setRemindersOn(isReminderEnabled());
    setMounted(true);
  }, []);

  // Nothing runs on the server — only decide what to show once
  // we're actually in the browser and state has been read.
  if (
    !mounted ||
    dismissed ||
    !remindersOn ||
    hoursSince === null ||
    hoursSince < 12
  ) {
    return null;
  }

  const hoursRounded = Math.floor(hoursSince);

  return (
    <div className="theme-card mb-6 flex items-center justify-between rounded-2xl border border-orange-300/40 bg-orange-500/10 p-5">
      <div>
        <p className="font-semibold text-orange-600">
          ⏰ {hoursRounded}h ho gaye practice kiye —{" "}
          {streak > 0
            ? `${streak} din ki streak mat todo!`
            : "aaj start kar lo!"}
        </p>
        <p className="theme-muted mt-1 text-sm">
          Ek chhota sa DSA question ya AI Mentor se ek doubt clear kar lo.
        </p>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="theme-muted rounded-full px-3 py-1 text-sm hover:bg-black/5"
        aria-label="Dismiss reminder"
      >
        ✕
      </button>
    </div>
  );
}