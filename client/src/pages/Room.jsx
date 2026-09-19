import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getSocket } from "../services/socket";
import { roomApi, extractErrorMessage } from "../services/api";
import YouTubePlayer from "../components/YouTubePlayer";
import ControlBar from "../components/ControlBar";
import ParticipantList from "../components/ParticipantList";
import ChatPanel from "../components/ChatPanel";
import RequestPanel from "../components/RequestPanel";
import RoomTopBar from "../components/RoomTopBar";
import UsernameModal from "../components/UsernameModal";

const TABS = ["participants", "chat"];

// UI only: shared font for the new theme (loaded here so /room/:id works on direct visit)
const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap');
  .wp-root { font-family: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif; }
`;

export default function Room() {
  const { roomId } = useParams();
  const { user, loginAsGuest, loading: authLoading } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null); // { roomId, hostId, currentVideoId, playbackState, currentTime, participants }
  const [messages, setMessages] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connecting, setConnecting] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [mobileTab, setMobileTab] = useState("participants");

  const playerRef = useRef(null);
  const socketRef = useRef(null);

  const myParticipant = room?.participants.find((p) => p.userId === user?.id);
  const canControl = myParticipant && ["HOST", "MODERATOR"].includes(myParticipant.role);
  const isHost = room && user && room.hostId === user.id;

  const connectAndJoin = useCallback(async () => {
    try {
      await roomApi.join(roomId);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
      navigate("/");
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    // socket.off(); // clear any stale listeners from a previous connection

    socket.on("connect_error", (err) => {
      pushToast(err.message || "Could not connect to the room", "error");
    });

    socket.on("sync_state", (state) => {
      setRoom(state);
      setConnecting(false);
    });

    socket.on("user_joined", ({ participants }) => {
      setRoom((prev) => (prev ? { ...prev, participants } : prev));
    });

    socket.on("user_left", ({ participants }) => {
      setRoom((prev) => (prev ? { ...prev, participants } : prev));
    });

    socket.on("role_assigned", ({ participants }) => {
      setRoom((prev) => (prev ? { ...prev, participants } : prev));
      pushToast("A participant's role changed", "info");
    });

    socket.on("participant_removed", ({ participants }) => {
      setRoom((prev) => (prev ? { ...prev, participants } : prev));
    });

    socket.on("host_transferred", ({ newHostId, participants }) => {
      setRoom((prev) => (prev ? { ...prev, hostId: newHostId, participants } : prev));
      pushToast("Host has been transferred", "info");
    });

    socket.on("you_were_removed", () => {
      pushToast("You were removed from this room by the host", "error");
      navigate("/");
    });

    socket.on("room_closed", () => {
      pushToast("The host closed this room", "info");
      navigate("/");
    });

    socket.on("play", ({ currentTime }) => {
      setRoom((prev) => (prev ? { ...prev, playbackState: "playing", currentTime } : prev));
      playerRef.current?.applyRemotePlay(currentTime);
    });

    socket.on("pause", ({ currentTime }) => {
      setRoom((prev) => (prev ? { ...prev, playbackState: "paused", currentTime } : prev));
      playerRef.current?.applyRemotePause(currentTime);
    });

    socket.on("seek", ({ time }) => {
      setRoom((prev) => (prev ? { ...prev, currentTime: time } : prev));
      playerRef.current?.applyRemoteSeek(time);
    });

    socket.on("change_video", ({ videoId }) => {
      setRoom((prev) => (prev ? { ...prev, currentVideoId: videoId, playbackState: "paused", currentTime: 0 } : prev));
      playerRef.current?.applyRemoteChangeVideo(videoId);
      pushToast("The video changed", "info");
    });

    socket.on("incoming_request", (request) => {
      setPendingRequests((prev) => [...prev, request]);
      pushToast(`${request.requesterUsername} sent a request`, "info");
    });

    socket.on("request_resolved", (request) => {
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      if (request.status === "rejected") {
        pushToast(`Your request was rejected`, "error");
      }
    });

    socket.on("chat_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error_message", ({ error }) => {
      pushToast(error, "error");
    });

    // socket.connect();
    // socket.emit("join_room", { roomId }, (ack) => {
    //   if (!ack?.ok) {
    //     pushToast(ack?.error || "Failed to join room", "error");
    //   }
    // });

    if (!socket.connected) {
      socket.connect();
    }
    
    const joinRoom = () => {
      socket.emit("join_room", { roomId }, (ack) => {
        if (!ack?.ok) {
          pushToast(ack?.error || "Failed to join room", "error");
        }
      });
    };
    
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

  }, [roomId, navigate, pushToast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNeedsUsername(true);
      setConnecting(false);
      return;
    }
    connectAndJoin();



    // return () => {
    //   socketRef.current?.emit("leave_room");
    //   socketRef.current?.off();
    // };


    return () => {
      // cleanup
    };


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, connectAndJoin]);

  async function handleGuestJoin(username) {
    const res = await loginAsGuest(username);
    if (!res.ok) {
      pushToast(res.error, "error");
      return;
    }
    setNeedsUsername(false);
    setConnecting(true);
  }

  function leaveRoom() {
    socketRef.current?.emit("leave_room");
    navigate("/");
  }



  // function handleLocalPlay(currentTime) {
  //   socketRef.current?.emit("play", { currentTime });
  // }
  // function handleLocalPause(currentTime) {
  //   socketRef.current?.emit("pause", { currentTime });
  // }



  // function handleLocalPlay(currentTime) {
  //   // Play the local YouTube player immediately
  //   playerRef.current?.playVideo?.();
  
  //   // Synchronize other users
  //   socketRef.current?.emit("play", { currentTime });
  // }
  
  // function handleLocalPause(currentTime) {
  //   // Pause the local YouTube player immediately
  //   playerRef.current?.pauseVideo?.();
  
  //   // Synchronize other users
  //   socketRef.current?.emit("pause", { currentTime });
  // }


  function handleLocalPlay(currentTime) {
    socketRef.current?.emit("play", { currentTime });
  }
  
  function handleLocalPause(currentTime) {
    socketRef.current?.emit("pause", { currentTime });
  }

  
  function handleChangeVideo(videoUrl) {
    socketRef.current?.emit("change_video", { videoUrl });
  }
  function handleRequest(action, payload) {
    socketRef.current?.emit("request_action", { action, payload });
    pushToast("Request sent to the host", "success");
  }
  function handleApprove(requestId) {
    socketRef.current?.emit("approve_request", { requestId });
  }
  function handleReject(requestId) {
    socketRef.current?.emit("reject_request", { requestId });
  }
  function handleChangeRole(userId, role) {
    socketRef.current?.emit("assign_role", { userId, role });
  }
  function handleRemove(userId) {
    socketRef.current?.emit("remove_participant", { userId });
  }
  function handleTransferHost(userId) {
    socketRef.current?.emit("transfer_host", { newHostId: userId });
  }
  function handleSendMessage(text) {
    socketRef.current?.emit("chat_message", { text });
  }

  /* ------------------------------------------------------------------ */
  /* UI only below this line. Palette: cobalt / ink / chalk / sun        */
  /* ------------------------------------------------------------------ */

  if (needsUsername) {
    return (
      <UsernameModal
        title="Enter a display name to join this room"
        confirmLabel="Join room"
        onConfirm={handleGuestJoin}
        onClose={() => navigate("/")}
      />
    );
  }

  if (connecting || !room) {
    return (
      <div className="wp-root flex min-h-screen items-center justify-center bg-[#0E1330] px-6 text-[#F5F6FF]">
        <style>{THEME_CSS}</style>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/15 border-t-[#FFD23F]" />
          <p className="text-white/75">
            Connecting to room{" "}
            <span className="font-mono font-semibold tracking-widest text-[#FFD23F]">{roomId}</span>…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-root flex min-h-screen flex-col bg-[#0E1330] text-[#F5F6FF]">
      <style>{THEME_CSS}</style>

      <RoomTopBar roomId={room.roomId} onLeave={leaveRoom} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 lg:flex-row lg:p-6">
        {/* Player column */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <YouTubePlayer
            ref={playerRef}
            videoId={room.currentVideoId}
            canControl={canControl}
            onLocalPlay={handleLocalPlay}
            onLocalPause={handleLocalPause}
          />
          <ControlBar
            canControl={canControl}
            playbackState={room.playbackState}
            onPlay={() => handleLocalPlay(playerRef.current?.getCurrentTime() ?? room.currentTime)}
            onPause={() => handleLocalPause(playerRef.current?.getCurrentTime() ?? room.currentTime)}
            onChangeVideo={handleChangeVideo}
            onRequest={handleRequest}
          />
          {canControl && <RequestPanel requests={pendingRequests} onApprove={handleApprove} onReject={handleReject} />}
        </div>

        {/* Desktop side panels */}
        <div className="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
          <div className="rounded-xl border-2 border-[#2438F0] bg-[#141A40] p-3">
            <ParticipantList
              participants={room.participants}
              currentUserId={user.id}
              isHost={isHost}
              hostId={room.hostId}
              onChangeRole={handleChangeRole}
              onRemove={handleRemove}
              onTransferHost={handleTransferHost}
            />
          </div>
          <div className="h-96">
            <ChatPanel messages={messages} currentUserId={user.id} onSend={handleSendMessage} />
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex gap-1 rounded-lg border-2 border-[#2438F0] bg-[#141A40] p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 rounded-md py-2 text-sm capitalize transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD23F]/60 ${
                  mobileTab === tab
                    ? "bg-[#FFD23F] font-bold text-[#0E1330]"
                    : "text-white/75 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {mobileTab === "participants" ? (
            <div className="rounded-xl border-2 border-[#2438F0] bg-[#141A40] p-3">
              <ParticipantList
                participants={room.participants}
                currentUserId={user.id}
                isHost={isHost}
                hostId={room.hostId}
                onChangeRole={handleChangeRole}
                onRemove={handleRemove}
                onTransferHost={handleTransferHost}
              />
            </div>
          ) : (
            <div className="h-96">
              <ChatPanel messages={messages} currentUserId={user.id} onSend={handleSendMessage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}