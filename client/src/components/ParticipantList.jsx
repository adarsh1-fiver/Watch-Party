import { useState } from "react";
import RoleBadge from "./RoleBadge";

const ASSIGNABLE_ROLES = ["MODERATOR", "PARTICIPANT", "VIEWER"];

export default function ParticipantList({ participants, currentUserId, isHost, hostId, onChangeRole, onRemove, onTransferHost }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const sorted = [...participants].sort((a, b) => {
    const order = { HOST: 0, MODERATOR: 1, PARTICIPANT: 2, VIEWER: 3 };
    return order[a.role] - order[b.role];
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-[#F5F6FF]">Participants</h3>
        <span className="rounded-full bg-[#2438F0] px-2 py-0.5 text-xs font-semibold text-white">
          {participants.length}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {sorted.map((p) => {
          const isSelf = p.userId === currentUserId;
          const canManage = isHost && p.userId !== hostId;

          return (
            <li
              key={p.userId}
              className="group relative flex items-center justify-between rounded-lg bg-[#0E1330] px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.online ? "bg-emerald-400" : "bg-white/30"}`}
                  title={p.online ? "Online" : "Offline"}
                />
                <span className="truncate text-sm font-semibold text-[#F5F6FF]">
                  {p.username}
                  {isSelf && <span className="font-normal text-white/55"> (you)</span>}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RoleBadge role={p.role} />
                {canManage && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === p.userId ? null : p.userId)}
                      className="rounded-md px-2 py-0.5 text-lg leading-none text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F]"
                      aria-label={`Manage ${p.username}`}
                    >
                      ⋯
                    </button>
                    {openMenuId === p.userId && (
                      <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-lg border-2 border-[#2438F0] bg-[#0E1330] shadow-[4px_4px_0_0_#FFD23F]">
                        <div className="border-b border-white/10 px-3 py-2 text-xs text-white/55">
                          Set role
                        </div>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              onChangeRole(p.userId, role);
                              setOpenMenuId(null);
                            }}
                            disabled={role === p.role}
                            className="block w-full px-3 py-2 text-left text-sm text-[#F5F6FF] transition hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </button>
                        ))}
                        <div className="border-t border-white/10">
                          <button
                            onClick={() => {
                              onTransferHost(p.userId);
                              setOpenMenuId(null);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm font-semibold text-[#FFD23F] transition hover:bg-white/10"
                          >
                            Make host
                          </button>
                          <button
                            onClick={() => {
                              onRemove(p.userId);
                              setOpenMenuId(null);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-rose-400 transition hover:bg-white/10"
                          >
                            Remove from room
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}