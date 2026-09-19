// Single source of truth for what each role is allowed to do.
// Both the REST API and the WebSocket layer call into these helpers so that
// permission logic can never drift between the two transports, and so that
// nothing is ever trusted from the client about its own role.

const PLAYBACK_ROLES = new Set(["HOST", "MODERATOR"]);
const MANAGEMENT_ROLES = new Set(["HOST"]);

function findParticipant(room, userId) {
  const id = userId.toString();
  return room.participants.find((p) => p.userId.toString() === id) || null;
}

function canControlPlayback(room, userId) {
  const participant = findParticipant(room, userId);
  if (!participant) return false;
  return PLAYBACK_ROLES.has(participant.role);
}

function canManageParticipants(room, userId) {
  const participant = findParticipant(room, userId);
  if (!participant) return false;
  return MANAGEMENT_ROLES.has(participant.role);
}

function isHost(room, userId) {
  return room.hostId.toString() === userId.toString();
}

module.exports = {
  findParticipant,
  canControlPlayback,
  canManageParticipants,
  isHost,
};
