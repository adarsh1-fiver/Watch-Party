const ACTION_LABEL = {
  play: "play the video",
  pause: "pause the video",
  seek: "seek to a new time",
  change_video: "change the video",
};

export default function RequestPanel({ requests, onApprove, onReject }) {
  if (requests.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-[#FFD23F] bg-[#FFD23F]/10 p-3">
      <h3 className="text-sm font-bold text-[#FFD23F]">Pending requests</h3>
      <ul className="flex flex-col gap-2">
        {requests.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0E1330] px-3 py-2.5"
          >
            <p className="text-sm text-[#F5F6FF]">
              <span className="font-bold">{r.requesterUsername}</span> wants to{" "}
              {ACTION_LABEL[r.action] || r.action}
              {r.action === "change_video" && r.payload?.videoUrl ? " to a new link" : ""}.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => onApprove(r.id)}
                className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-bold text-[#0E1330] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(r.id)}
                className="rounded-lg border-2 border-white/25 px-3 py-1.5 text-xs font-semibold text-[#F5F6FF] transition hover:border-white/50 hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD23F]/40"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}