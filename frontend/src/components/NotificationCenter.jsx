import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import api from "../lib/api";

export default function NotificationCenter({ role, userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [role, userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(`/notifications?role=${role}&userId=${userId}`);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "banner":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "popup":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                      !notif.isRead ? "bg-slate-800/20" : ""
                    }`}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                  >
                    <div className="mt-1 flex-shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? "text-white font-medium" : "text-slate-300"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
