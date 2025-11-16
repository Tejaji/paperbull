"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Directly redirect to trading page (no login required)
    router.push("/trading");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
