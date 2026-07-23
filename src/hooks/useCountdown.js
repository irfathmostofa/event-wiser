import { useEffect, useState } from "react";

function getRemaining(targetDate) {
  // Get current time in Asia/Dhaka timezone
  const now = new Date();
  const dhakaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );

  // Parse target date - ensure it's treated as Asia/Dhaka time
  const target = new Date(targetDate);
  const dhakaTarget = new Date(
    target.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );

  const total = dhakaTarget.getTime() - dhakaTime.getTime();
  const clamped = Math.max(total, 0);

  return {
    total: clamped,
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export default function useCountdown(targetDate) {
  const [time, setTime] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { ...time, arrived: time.total <= 0 };
}
