import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useYouTubeApi } from "../hooks/useYouTubeApi";

function extractYouTubeVideoId(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const input = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      const id = url.searchParams.get("v");

      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }

      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/embed/")[1]?.split("/")[0];

        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/shorts/")[1]?.split("/")[0];

        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }
    }

    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];

      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

const YouTubePlayer = forwardRef(function YouTubePlayer(
  { videoId, canControl, onLocalPlay, onLocalPause, onLocalSeek },
  ref
) {
  const YT = useYouTubeApi();

  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const lastKnownTime = useRef(0);
  const readyRef = useRef(false);
  const lastLoadedVideoId = useRef(null);

  const normalizedVideoId = extractYouTubeVideoId(videoId);

  useImperativeHandle(ref, () => ({
    playVideo() {
      const player = playerRef.current;

      if (!player || !readyRef.current) return;

      player.playVideo();
    },

    pauseVideo() {
      const player = playerRef.current;

      if (!player || !readyRef.current) return;

      player.pauseVideo();
    },

    applyRemotePlay(currentTime) {
      const player = playerRef.current;

      if (!player || !readyRef.current) return;

      isRemoteUpdate.current = true;

      if (typeof currentTime === "number") {
        player.seekTo(currentTime, true);
      }

      player.playVideo();
    },

    applyRemotePause(currentTime) {
      const player = playerRef.current;

      if (!player || !readyRef.current) return;

      isRemoteUpdate.current = true;

      if (typeof currentTime === "number") {
        player.seekTo(currentTime, true);
      }

      player.pauseVideo();
    },

    applyRemoteSeek(time) {
      const player = playerRef.current;

      if (!player || !readyRef.current) return;

      isRemoteUpdate.current = true;

      player.seekTo(time, true);
    },

    applyRemoteChangeVideo(newVideoId) {
      const player = playerRef.current;

      if (!player || !readyRef.current) return;

      const validVideoId = extractYouTubeVideoId(newVideoId);

      if (!validVideoId) {
        console.warn("Invalid remote YouTube video:", newVideoId);
        return;
      }

      isRemoteUpdate.current = true;
      lastLoadedVideoId.current = validVideoId;

      player.loadVideoById(validVideoId);
    },

    getCurrentTime() {
      return (
        playerRef.current?.getCurrentTime?.() ??
        lastKnownTime.current
      );
    },
  }));

  useEffect(() => {
    if (!YT || playerRef.current) return;

    if (!normalizedVideoId) return;

    playerRef.current = new YT.Player(containerRef.current, {
      videoId: normalizedVideoId,

      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },

      events: {
        onReady: () => {
          readyRef.current = true;
          lastLoadedVideoId.current = normalizedVideoId;
        },

        onStateChange: (event) => {
          const player = playerRef.current;

          if (!player) return;

          const time = player.getCurrentTime?.() ?? 0;

          lastKnownTime.current = time;

          if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
          }

          if (!canControl) return;

          if (event.data === window.YT.PlayerState.PLAYING) {
            onLocalPlay?.(time);
          } else if (
            event.data === window.YT.PlayerState.PAUSED
          ) {
            onLocalPause?.(time);
          }
        },
      },
    });

    return () => {
      readyRef.current = false;

      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }

      playerRef.current = null;
    };
  }, [YT]);

  useEffect(() => {
    const player = playerRef.current;

    if (!player || !readyRef.current) return;

    if (!normalizedVideoId) return;

    if (lastLoadedVideoId.current === normalizedVideoId) {
      return;
    }

    lastLoadedVideoId.current = normalizedVideoId;

    isRemoteUpdate.current = true;

    player.cueVideoById(normalizedVideoId);
  }, [normalizedVideoId]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#08080C] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/30 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-600 text-lg">
            🎬
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Watch Party Player
            </h3>

            <p className="text-xs text-white/40">
              Synchronized YouTube Streaming
            </p>
          </div>
        </div>

        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          LIVE
        </div>
      </div>

      <div className="relative aspect-video w-full bg-black">
        <div
          ref={containerRef}
          className="h-full w-full"
        />

        {!normalizedVideoId && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0F]">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600/20 to-cyan-500/20 text-5xl backdrop-blur-xl">
              ▶️
            </div>

            <h2 className="text-2xl font-bold text-white">
              No Video Selected
            </h2>

            <p className="mt-3 max-w-md text-center text-sm text-white/50">
              Paste a YouTube video link to start watching together with everyone in the room.
            </p>

            <div className="mt-6 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">
              Waiting for video...
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-5 py-3">
        <span className="text-xs uppercase tracking-[3px] text-white/40">
          Real-Time Sync
        </span>

        <span className="text-xs text-white/40">
          Powered by YouTube API
        </span>
      </div>
    </div>
  );
});

export default YouTubePlayer;