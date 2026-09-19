import { useState } from "react";
import { Link } from "react-router-dom";

export default function RoomTopBar({ roomId, onLeave }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/room/${roomId}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090F]/80 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500 text-lg shadow-lg">
            🎬
          </div>

          <div>
            <h1 className="text-lg font-black tracking-wide text-white">
              Watch<span className="text-fuchsia-400">Party</span>
            </h1>

            <p className="text-[10px] uppercase tracking-[3px] text-white/40">
              Real Time Streaming
            </p>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Room ID */}
          <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2">
            <p className="text-[10px] uppercase tracking-[2px] text-fuchsia-300/60">
              Room
            </p>

            <p className="font-mono text-sm font-semibold text-fuchsia-300">
              {roomId}
            </p>
          </div>

          {/* Copy Link */}
          <button
            onClick={copyLink}
            className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/10"
          >
            {copied ? (
              <span className="text-cyan-300">
                ✓ Link Copied
              </span>
            ) : (
              "Share Room"
            )}
          </button>

          {/* Leave Room */}
          <button
            onClick={onLeave}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-300 hover:bg-red-500/20"
          >
            Leave Room
          </button>
        </div>
      </div>
    </header>
  );
}