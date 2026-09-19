import { useState } from "react";

export default function UsernameModal({
  title,
  confirmLabel,
  onConfirm,
  onClose,
  loading,
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();

    const trimmed = username.trim();

    if (trimmed.length < 2) {
      setError("Enter at least 2 characters");
      return;
    }

    setError("");
    onConfirm(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0F]/90 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl">

        {/* Top Glow */}
        <div className="h-1 w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500" />

        <div className="p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 text-5xl">🎬</div>

            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm text-white/50">
              Choose a display name and join the watch party
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">

            <div>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={24}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/20"
              />

              {error && (
                <p className="mt-2 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Joining..." : confirmLabel}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}