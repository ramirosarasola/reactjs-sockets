import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { SocketEvents } from "../types";

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = (url: string = "http://localhost:5001") => {
    if (socketRef.current?.connected) {
      console.log("🔗 Socket ya conectado, reutilizando conexión");
      return socketRef.current;
    }

    console.log("🔌 Conectando socket a:", url);
    setIsConnecting(true);

    const socket = io(url, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket conectado exitosamente");
      console.log("🆔 Socket ID:", socket.id);
      setIsConnected(true);
      setIsConnecting(false);
      options.onConnect?.();
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket desconectado");
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socket.on("error", (error) => {
      console.error("❌ Error de socket:", error);
      setIsConnecting(false);
      options.onError?.(error.message || "Error de conexión");
    });

    socketRef.current = socket;
    return socket;
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const emit = <K extends keyof SocketEvents>(
    event: K,
    data: SocketEvents[K]
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket no conectado");
    }
  };

  const on = <K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) => {
    if (socketRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current.on(event, callback as any);
    }
  };

  const off = <K extends keyof SocketEvents>(
    event: K,
    callback?: (data: SocketEvents[K]) => void
  ) => {
    if (socketRef.current) {
      if (callback) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketRef.current.off(event, callback as any);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  // Conectar automáticamente cuando se inicializa el hook
  useEffect(() => {
    console.log("🔌 useSocket: Inicializando hook...");
    if (!socketRef.current) {
      console.log("🔌 useSocket: Conectando automáticamente...");
      connect();
    } else {
      console.log("🔌 useSocket: Socket ya existe");
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
