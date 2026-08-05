// lib/notifications.ts
// Study reminder + browser notification logic.
// NOTE: Uses localStorage for now since Supabase isn't wired yet.
// Once Supabase is ready, replace the localStorage reads/writes below
// with reads/writes to a `user_activity` table (see comments marked TODO-DB).

const LAST_ACTIVE_KEY = "capilot_last_active";
const REMINDER_ENABLED_KEY = "capilot_reminder_enabled";
const REMINDER_HOURS_KEY = "capilot_reminder_hours"; // gap after which we remind
const STREAK_KEY = "capilot_streak_count";
const LAST_STREAK_DATE_KEY = "capilot_last_streak_date";

const DEFAULT_REMINDER_GAP_HOURS = 20; // remind if inactive for 20h+

// Next.js renders components on the server first, where `localStorage`
// doesn't exist — every function below must check this before touching it.
const isBrowser = () => typeof window !== "undefined";

// ---------- Activity tracking ----------

/** Call this whenever the user does something meaningful (asks AI, solves DSA, etc.) */
export function markActive() {
  if (!isBrowser()) return;
  const now = Date.now();
  localStorage.setItem(LAST_ACTIVE_KEY, String(now));
  updateStreak();
  // TODO-DB: also insert a row into `activity_log` in Supabase here.
}

export function getLastActive(): number | null {
  if (!isBrowser()) return null;
  const val = localStorage.getItem(LAST_ACTIVE_KEY);
  return val ? Number(val) : null;
}

export function getHoursSinceLastActive(): number | null {
  const last = getLastActive();
  if (!last) return null;
  return (Date.now() - last) / (1000 * 60 * 60);
}

// ---------- Streak ----------

function updateStreak() {
  if (!isBrowser()) return;
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(LAST_STREAK_DATE_KEY);

  if (lastDate === today) return; // already counted today

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const currentStreak = Number(localStorage.getItem(STREAK_KEY) || "0");

  const newStreak = lastDate === yesterday ? currentStreak + 1 : 1;

  localStorage.setItem(STREAK_KEY, String(newStreak));
  localStorage.setItem(LAST_STREAK_DATE_KEY, today);
}

export function getStreak(): number {
  if (!isBrowser()) return 0;
  return Number(localStorage.getItem(STREAK_KEY) || "0");
}

// ---------- Reminder preferences ----------

export function isReminderEnabled(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(REMINDER_ENABLED_KEY) === "true";
}

export function setReminderEnabled(enabled: boolean) {
  if (!isBrowser()) return;
  localStorage.setItem(REMINDER_ENABLED_KEY, String(enabled));
}

export function getReminderGapHours(): number {
  if (!isBrowser()) return DEFAULT_REMINDER_GAP_HOURS;
  const val = localStorage.getItem(REMINDER_HOURS_KEY);
  return val ? Number(val) : DEFAULT_REMINDER_GAP_HOURS;
}

export function setReminderGapHours(hours: number) {
  if (!isBrowser()) return;
  localStorage.setItem(REMINDER_HOURS_KEY, String(hours));
}

/** True if enough time has passed since last activity that we should nudge the user. */
export function shouldRemind(): boolean {
  if (!isReminderEnabled()) return false;
  const hours = getHoursSinceLastActive();
  if (hours === null) return false; // never active yet, don't nag immediately
  return hours >= getReminderGapHours();
}

// ---------- Browser Notification permission ----------

export type NotificationPermissionState =
  | "unsupported"
  | "granted"
  | "denied"
  | "default";

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const result = await Notification.requestPermission();
  return result as NotificationPermissionState;
}

/** Shows a browser notification via the registered service worker (works even if tab is backgrounded). */
export async function showStudyReminderNotification() {
  if (getNotificationPermission() !== "granted") return;

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification("📚 AI Engineering Copilot", {
      body: "Kaafi der ho gayi — thoda practice kar lo! Streak mat todo 🔥",
      icon: "/next.svg",
      tag: "study-reminder", // prevents duplicate stacked notifications
    });
  } else {
    // fallback for browsers without SW support
    new Notification("📚 AI Engineering Copilot", {
      body: "Kaafi der ho gayi — thoda practice kar lo! Streak mat todo 🔥",
    });
  }
}

/** Registers the service worker. Call once, e.g. in a top-level layout effect. */
export async function registerNotificationServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.error("Service worker registration failed:", err);
  }
}

/** Starts a periodic check (call once on app mount). Checks every 30 min while the app is open. */
export function startReminderPolling() {
  if (typeof window === "undefined") return () => {};

  const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

  const check = () => {
    if (shouldRemind()) {
      showStudyReminderNotification();
    }
  };

  check(); // check immediately on load too
  const interval = setInterval(check, CHECK_INTERVAL_MS);
  return () => clearInterval(interval);
}