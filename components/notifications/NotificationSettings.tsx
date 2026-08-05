"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  getReminderGapHours,
  isReminderEnabled,
  NotificationPermissionState,
  registerNotificationServiceWorker,
  requestNotificationPermission,
  setReminderEnabled,
  setReminderGapHours,
  startReminderPolling,
} from "@/lib/notifications";

export default function NotificationSettings() {
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default");
  const [enabled, setEnabled] = useState(false);
  const [gapHours, setGapHours] = useState(20);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setEnabled(isReminderEnabled());
    setGapHours(getReminderGapHours());
    registerNotificationServiceWorker();

    // Start the background polling loop while the app is mounted.
    const stop = startReminderPolling();
    return stop;
  }, []);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      setReminderEnabled(true);
      setEnabled(true);
    }
  };

  const handleToggle = () => {
    const next = !enabled;
    setReminderEnabled(next);
    setEnabled(next);
  };

  const handleGapChange = (hours: number) => {
    setGapHours(hours);
    setReminderGapHours(hours);
  };

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold">🔔 Study Reminders</h2>
      <p className="theme-muted mt-1 text-sm">
        Browser notification bhejenge jab kaafi der se practice nahi kiya.
      </p>

      <div className="mt-5 space-y-4">
        {permission === "unsupported" && (
          <p className="text-sm text-red-500">
            Ye browser notifications support nahi karta.
          </p>
        )}

        {permission === "denied" && (
          <p className="text-sm text-red-500">
            Notifications block hain — browser settings se allow karo.
          </p>
        )}

        {permission === "default" && (
          <button
            onClick={handleEnable}
            className="theme-primary rounded-xl px-4 py-2 font-semibold"
          >
            Enable Notifications
          </button>
        )}

        {permission === "granted" && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Reminders on/off</span>
              <button
                onClick={handleToggle}
                className={`h-7 w-12 rounded-full transition ${
                  enabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-y-1 rounded-full bg-white transition ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Kitni der inactive rehne pe remind karein?
              </label>
              <select
                value={gapHours}
                onChange={(e) => handleGapChange(Number(e.target.value))}
                className="theme-card w-full rounded-xl border p-2"
              >
                <option value={4}>4 ghante</option>
                <option value={12}>12 ghante</option>
                <option value={20}>20 ghante (default)</option>
                <option value={24}>24 ghante</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
