const ROLE_META = {
  HOST: {
    label: "Host",
    icon: "👑",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
  },

  MODERATOR: {
    label: "Moderator",
    icon: "🛡️",
    className:
      "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]",
  },

  PARTICIPANT: {
    label: "Participant",
    icon: "🎧",
    className:
      "border-violet-400/30 bg-violet-400/10 text-violet-300 shadow-[0_0_20px_rgba(167,139,250,0.15)]",
  },

  VIEWER: {
    label: "Viewer",
    icon: "👀",
    className:
      "border-slate-400/30 bg-slate-400/10 text-slate-300 shadow-[0_0_20px_rgba(148,163,184,0.15)]",
  },
};

export default function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.VIEWER;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-xl ${meta.className}`}
    >
      <span className="text-sm">{meta.icon}</span>

      <span className="tracking-wide">
        {meta.label}
      </span>
    </span>
  );
}