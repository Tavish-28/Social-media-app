import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import api from "../api/axios";

function Avatar({ user }) {
  const initials = (user?.full_name || user?.username || "U")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  if (user?.profile_picture) {
    return (
      <img
        src={user.profile_picture}
        alt={user.full_name || user.username}
        className="w-8 h-8 rounded-full object-cover bg-slate-100"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-semibold">
      {initials}
    </div>
  );
}

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  const fetchRecentMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-message", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success) {
        setError(data.message || "Could not load recent messages");
        setMessages([]);
        return;
      }

      setMessages(data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchRecentMessages();
  }, [fetchRecentMessages]);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
          <Loader2 size={14} className="animate-spin" />
          Loading
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : messages.length > 0 ? (
        <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
          {messages.map((message) => (
            <Link
              key={message._id}
              to="/message/chats"
              state={{ recipient: message.user }}
              className="flex items-start gap-2 py-2 hover:bg-slate-100 rounded-md px-2 transition"
            >
              <Avatar user={message.user} />

              <div className="w-full min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <p className="font-medium truncate">
                    {message.user.full_name || "Unnamed user"}
                  </p>

                  <p className="text-[10px] text-slate-400 shrink-0">
                    {moment(message.createdAt).fromNow()}
                  </p>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <p className="text-slate-500 truncate">
                    {message.text || "Media"}
                  </p>

                  {!message.seen &&
                  message.to_user_id !== message.user.id ? (
                    <p className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] shrink-0">
                      1
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">No recent messages yet.</p>
      )}
    </div>
  );
};

export default RecentMessages;
