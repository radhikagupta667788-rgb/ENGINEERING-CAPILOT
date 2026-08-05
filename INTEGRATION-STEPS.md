# Study Reminder + Notification — Integration Steps

## 1. Naye files copy karo repo mein (same path pe)
- `lib/notifications.ts`
- `public/sw.js`
- `components/notifications/ReminderBanner.tsx`
- `components/notifications/NotificationSettings.tsx`

Koi existing file overwrite nahi hogi — sab naye files hain.

## 2. Dashboard (`app/page.tsx`) mein banner add karo
Top pe import add karo:
```tsx
import ReminderBanner from "@/components/notifications/ReminderBanner";
```
Aur welcome section ke turant baad (ya jahan bhi upar dikhana ho):
```tsx
<ReminderBanner />
```

## 3. Ek Settings jagah NotificationSettings component daalo
Agar `/settings` page nahi hai to dashboard ke niche hi add kar sakte ho:
```tsx
import NotificationSettings from "@/components/notifications/NotificationSettings";
...
<NotificationSettings />
```
(Ye component hi service worker register karta hai aur background polling start karta hai — isliye ye kam se kam ek baar mount hona chahiye, layout.tsx mein bhi daal sakte ho taaki har page pe active rahe.)

## 4. Activity track karne ke liye `markActive()` call karo
Jab bhi user koi meaningful action kare (AI se chat, DSA solve, resume check, etc.), us API route/handler ke success callback mein:
```tsx
import { markActive } from "@/lib/notifications";
markActive();
```
Ye streak aur "last active" time update karega jisse reminder logic kaam kare.

Suggested jagah:
- `components/chat/*` — jab AI response aa jaye
- `components/coding/*` — jab code check ho
- `components/resume/*` — jab resume analyze ho

## 5. Test kaise karo
- Notification permission enable karo (NotificationSettings se).
- `lib/notifications.ts` mein `DEFAULT_REMINDER_GAP_HOURS` ko temporarily `0.01` (36 sec) kar do testing ke liye.
- Tab minimize karo, ~1 min wait karo — notification aani chahiye.
- Testing ke baad value wapas 20 kar dena.

## Phase 2 (jab Supabase wire ho jaye)
- `lib/notifications.ts` ke TODO-DB comments follow karo — localStorage ki jagah Supabase `activity_log` table use karo.
- Real "browser fully band" push notifications ke liye `web-push` npm package + VAPID keys + ek scheduled Supabase Edge Function chahiye hogi (cron based) — ye backend infra ke baad ka kaam hai.
