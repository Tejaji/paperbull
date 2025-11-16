"use client";

import { useState, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 5 * 60 * 1000); // Every 5 min
    return () => clearInterval(interval);
  }, []);

  async function loadAnnouncements() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = user.role || "free";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/public/announcements?role=${role}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  }

  function handleDismiss(id: string) {
    setDismissed(new Set(dismissed).add(id));
  }

  // Only show non-dismissed announcements, as popups in bottom-right corner
  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div
      className="fixed z-50 right-6 bottom-6 space-y-4"
      style={{ maxWidth: 350, minWidth: 300 }}
    >
      {visible.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative shadow-lg px-5 py-4 rounded-lg border transition-all duration-500 animate-fade-in-down
            ${
              announcement.type === "info"
                ? "bg-blue-100 text-blue-900 border-blue-200"
                : announcement.type === "warning"
                ? "bg-yellow-100 text-yellow-900 border-yellow-300"
                : "bg-green-100 text-green-900 border-green-200"
            }
          `}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{announcement.title}</span>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="text-lg font-bold opacity-60 hover:opacity-100 pb-1 px-2"
            >
              ×
            </button>
          </div>
          <div>{announcement.message}</div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s;
        }
      `}</style>
    </div>
  );
}
