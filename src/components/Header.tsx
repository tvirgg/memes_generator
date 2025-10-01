"use client";

import { Copy, X, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export function Header({
  isMuted,
  onToggleMute,
}: {
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0x1234...5678"; // Замените на ваш адрес

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between p-4 text-white">
        {/* Left: Coin Name */}
        <div className="text-2xl font-bold tracking-wider">
          RYOK?
        </div>

        {/* Center: Contract Address */}
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-full text-sm">
          <span className="hidden sm:inline">Contract:</span>
          <span className="font-mono">{contractAddress}</span>
          <button onClick={copyToClipboard} className="transition-transform hover:scale-110 active:scale-95">
            {copied ? <span className="text-green-400 text-xs">Copied!</span> : <Copy size={16} />}
          </button>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-6">
          <button onClick={onToggleMute} className="transition-transform hover:scale-110">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
            <X size={24} />
          </a>
        </div>
      </div>
    </header>
  );
}
