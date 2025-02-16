"use client";

import Image from "next/image";
import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-[#040d17] text-white">
      <nav className="flex justify-between items-center p-4">
        <div className="flex">
          <Image
            src="/logo.png"
            alt="Codebender Logo"
            width={100}
            height={15}
          />
          <h1>ROUTE RUNNER</h1>
        </div>
        <h1 className="text-xl font-semibold">
          Talk to <span className="highlighted-text">The Drone</span>
        </h1>
      </nav>
      <div className="flex-grow overflow-hidden">
        <Chat />
      </div>
    </main>
  );
}
