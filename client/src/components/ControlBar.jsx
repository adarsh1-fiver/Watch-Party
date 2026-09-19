import { useState } from "react";

const primaryBtn =
  "flex items-center gap-2 rounded-lg bg-[#FFD23F] px-4 py-2 text-sm font-bold text-[#0E1330] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD23F]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100";
const secondaryBtn =
  "flex items-center gap-2 rounded-lg border-2 border-white/25 px-4 py-2 text-sm font-semibold text-[#F5F6FF] transition hover:border-white/50 hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD23F]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/25 disabled:hover:bg-transparent";

export default function ControlBar({ canControl, playbackState, onPlay, onPause, onChangeVideo, onRequest }) {
  const [videoUrl, setVideoUrl] = useState("");

  function submitVideo(e) {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    if (canControl) {
      onChangeVideo(videoUrl.trim());
    } else {
      onRequest("change_video", { videoUrl: videoUrl.trim() });
    }
    setVideoUrl("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-[#2438F0] bg-[#141A40] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {canControl ? (
          <>
            <button onClick={onPlay} disabled={playbackState === "playing"} className={primaryBtn}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5-9-5.5z" />
              </svg>
              Play
            </button>
            <button onClick={onPause} disabled={playbackState === "paused"} className={secondaryBtn}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M3.5 2h3v12h-3zM9.5 2h3v12h-3z" />
              </svg>
              Pause
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => onRequest("play")} className={secondaryBtn}>
              Request play
            </button>
            <button onClick={() => onRequest("pause")} className={secondaryBtn}>
              Request pause
            </button>
          </div>
        )}
        <span className="hidden max-w-[16rem] text-xs leading-snug text-white/55 xl:inline">
          {canControl ? "You can control playback" : "Only the host and moderators can control playback directly"}
        </span>
      </div>

      <form onSubmit={submitVideo} className="flex flex-1 gap-2 sm:max-w-sm">
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste a YouTube link…"
          className="w-full rounded-lg border-2 border-white/15 bg-[#0E1330] px-3 py-2 text-sm text-[#F5F6FF] placeholder:text-white/40 focus:border-[#FFD23F] focus:outline-none focus:ring-4 focus:ring-[#FFD23F]/20"
        />
        <button type="submit" className={`${secondaryBtn} shrink-0`}>
          {canControl ? "Change video" : "Request"}
        </button>
      </form>
    </div>
  );
}