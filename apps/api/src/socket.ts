import { Server } from "socket.io";
import http from "http";

export function setupSocketIO(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Track joined rooms
  const clientRooms = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle client joining a room
    socket.on("join", (room) => {
      if (!room) {
        console.error("Client tried to join a room with no/invalid room ID");
        return;
      }

      console.log(`Client ${socket.id} joining room: ${room}`);
      socket.join(room);

      // Track which rooms this client has joined
      if (!clientRooms.has(socket.id)) {
        clientRooms.set(socket.id, new Set());
      }
      clientRooms.get(socket.id).add(room);

      // Confirm to client that they joined the room
      socket.emit("room_joined", room);
    });

    // Handle client leaving a room
    socket.on("leave", (room) => {
      console.log(`Client ${socket.id} leaving room: ${room}`);
      socket.leave(room);

      if (clientRooms.has(socket.id)) {
        clientRooms.get(socket.id).delete(room);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      clientRooms.delete(socket.id);
    });
  });

  // Function to emit webhook events
  const emitWebhookEvent = (room: string, event: string, data: any) => {
    console.log(`Emitting event ${event} to room ${room}:`, data);

    // Check if any clients are in this room
    const roomClients = io.sockets.adapter.rooms.get(room);
    console.log(
      `Room ${room} has ${roomClients ? roomClients.size : 0} clients`,
    );

    io.to(room).emit(event, data);
  };

  return { io, emitWebhookEvent };
}
