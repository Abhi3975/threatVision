// Small holder for the Socket.IO instance so any module can broadcast alerts.
let io = null;

export function setIO(instance) {
  io = instance;
}

export function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}
