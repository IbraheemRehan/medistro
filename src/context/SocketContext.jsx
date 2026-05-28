import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import AuthContext from "./AuthContext";
import toast from "react-hot-toast";
import API from "../config/api.config";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      const res = await API.get("/api/v1/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    newSocket.on("notification", (notification) => {
      // Add notification to state
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger hot toast
      toast(notification.message, {
        icon: "🔔",
        duration: 5000,
        style: {
          background: "#1E293B",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px 18px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/api/v1/notifications/mark-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllRead
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
