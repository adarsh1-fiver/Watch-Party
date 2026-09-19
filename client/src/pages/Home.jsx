import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { roomApi, extractErrorMessage } from "../services/api";
import UsernameModal from "../components/UsernameModal";

export default function Home() {
  const { user, loginAsGuest } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [modal, setModal] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function ensureIdentity(username) {
    if (user) return { ok: true };
    return loginAsGuest(username);
  }

  async function handleCreate(username) {
    setBusy(true);

    const auth = await ensureIdentity(username);

    if (!auth.ok) {
      setBusy(false);
      pushToast(auth.error, "error");
      return;
    }

    try {
      const res = await roomApi.create();
      navigate(`/room/${res.data.room.roomId}`);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setBusy(false);
      setModal(null);
    }
  }

  async function handleJoin(username) {
    if (!joinCode.trim()) {
      pushToast("Enter a room code first", "error");
      return;
    }

    setBusy(true);

    const auth = await ensureIdentity(username);

    if (!auth.ok) {
      setBusy(false);
      pushToast(auth.error, "error");
      return;
    }

    try {
      const roomId = joinCode.trim().toUpperCase();

      await roomApi.join(roomId);

      navigate(`/room/${roomId}`);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setBusy(false);
      setModal(null);
    }
  }

  function openCreate() {
    if (user) {
      handleCreate();
    } else {
      setModal("create");
    }
  }

  function openJoin() {
    if (!joinCode.trim()) {
      pushToast("Enter a room code first", "error");
      return;
    }

    if (user) {
      handleJoin();
    } else {
      setModal("join");
    }
  }

  const videoCards = [
    {
      name: "You",
      image: "/images/image.png",
      progress: "68%",
    },
    {
      name: "Your friend",
      image: "/images/image1.png",
      progress: "68%",
    },
  ];

  return (
    <div className="wp-root relative flex min-h-screen flex-col bg-[#2438F0] text-[#F5F6FF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');

        .wp-root {
          font-family: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif;
        }

        @keyframes wp-scrub {
          from {
            width: 35%;
          }

          to {
            width: 68%;
          }
        }

        @keyframes wp-pulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

        .wp-scrub {
          animation: wp-scrub 4s ease-in-out infinite alternate;
        }

        .wp-play {
          animation: wp-pulse 2.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .wp-scrub {
            animation: none;
            width: 55%;
          }

          .wp-play {
            animation: none;
          }
        }
      `}</style>

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a
          href="/"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD23F]"
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="7"
              width="20"
              height="16"
              rx="3"
              fill="#FFD23F"
            />

            <rect
              x="13"
              y="11"
              width="20"
              height="16"
              rx="3"
              fill="#F5F6FF"
            />

            <path
              d="M20 16.5v6l5-3-5-3z"
              fill="#2438F0"
            />
          </svg>

          <span className="text-xl font-bold tracking-tight">
            WatchParty
          </span>
        </a>

        {user && (
          <span className="rounded-full border border-white/30 px-4 py-1.5 text-sm text-white/85">
            Signed in as {user.username}
          </span>
        )}
      </nav>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-16 pt-4 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <section className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <h1 className="max-w-2xl text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Everyone hits play at the same second.
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/80">
              Make a room, send the code, and your friends' YouTube
              players stay in step. Play, pause, seek and change
              videos together from anywhere.
            </p>
          </div>

          <div
            className="flex flex-col gap-3"
            aria-hidden="true"
          >
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {videoCards.map((video) => (
                <div
                  key={video.name}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-white/20 bg-[#0E1330] shadow-lg"
                >
                  <img
                    src={video.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1330]/80 via-black/20 to-black/10" />

                  <span className="absolute left-3 top-3 z-10 rounded-md bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {video.name}
                  </span>

                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <span className="wp-play flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD23F] shadow-xl transition group-hover:scale-110">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 16 16"
                        fill="#0E1330"
                      >
                        <path d="M4 2.5v11l9-5.5-9-5.5z" />
                      </svg>
                    </span>
                  </div>

                  <div className="absolute inset-x-3 bottom-3 z-10">
                    <div className="flex items-center justify-between text-[10px] text-white/70">
                      <span>Watching together</span>
                      <span>Sync</span>
                    </div>

                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25">
                      <div
                        className="wp-scrub h-full rounded-full bg-[#FFD23F]"
                        style={{
                          width: video.progress,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-white/65">
              Both players, same moment. No countdown needed.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-[#F5F6FF] p-6 text-[#0E1330] shadow-[8px_8px_0_0_#FFD23F] sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Start watching
          </h2>

          <p className="mt-1 text-sm text-[#0E1330]/70">
            No sign-up. We'll just ask for a name.
          </p>

          <div className="mt-7 flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Host a new room
            </p>

            <button
              onClick={openCreate}
              disabled={busy}
              className="rounded-lg border-2 border-[#0E1330] bg-[#FFD23F] px-6 py-3.5 text-base font-bold text-[#0E1330] transition hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#0E1330] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2438F0]/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Create a room
            </button>

            <p className="text-xs text-[#0E1330]/60">
              You'll get a code to share with friends.
            </p>
          </div>

          <div className="my-7 flex items-center gap-3 text-sm text-[#0E1330]/60">
            <div className="h-px flex-1 bg-[#0E1330]/15" />

            <span>or</span>

            <div className="h-px flex-1 bg-[#0E1330]/15" />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="room-code"
              className="text-sm font-semibold"
            >
              Have a code already?
            </label>

            <input
              id="room-code"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.toUpperCase())
              }
              placeholder="Room code, e.g. AB3XQ9"
              maxLength={6}
              className="w-full rounded-lg border-2 border-[#0E1330]/20 bg-white px-4 py-3.5 text-center font-mono text-lg font-semibold tracking-[0.35em] text-[#0E1330] placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-[#0E1330]/40 focus:border-[#2438F0] focus:outline-none focus:ring-4 focus:ring-[#2438F0]/20"
            />

            <button
              onClick={openJoin}
              disabled={busy}
              className="mt-1 rounded-lg border-2 border-[#0E1330] bg-[#0E1330] px-6 py-3.5 text-base font-bold text-[#F5F6FF] transition hover:border-[#2438F0] hover:bg-[#2438F0] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2438F0]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Join room
            </button>
          </div>
        </section>
      </main>

      {modal === "create" && (
        <UsernameModal
          title="What should we call you?"
          confirmLabel="Create room"
          loading={busy}
          onConfirm={handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "join" && (
        <UsernameModal
          title="What should we call you?"
          confirmLabel="Join room"
          loading={busy}
          onConfirm={handleJoin}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}