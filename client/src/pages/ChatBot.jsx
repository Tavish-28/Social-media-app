import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Loader2, Send, X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";

const getUserKey = (user) => user?.id || user?._id;

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
        className="size-9 rounded-full object-cover bg-slate-100"
      />
    );
  }

  return (
    <div className="size-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  );
}

const ChatBot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recipient = location.state?.recipient;
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const recipientId = getUserKey(recipient);
  const currentUserId = currentUser?.id;

  const imagePreview = useMemo(
    () => (image ? URL.createObjectURL(image) : ""),
    [image],
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipientId) return;

      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await api.post(
          "/api/message/get",
          { to_user_id: recipientId },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!data.success) {
          toast.error(data.message);
          setMessages([]);
          return;
        }

        setMessages(data.messages || []);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [recipientId, getToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!recipientId || sending || (!text.trim() && !image)) return;

    try {
      setSending(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", recipientId);
      formData.append("text", text.trim());
      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      setText("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSending(false);
    }
  };

  if (!recipientId) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-800">
            Select a conversation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Open a user from Messages or Recent Messages to start chatting.
          </p>
          <button
            type="button"
            onClick={() => navigate("/messages")}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Go to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 p-3 md:px-10 bg-white border-b border-gray-200">
        <Avatar user={recipient} />

        <div className="min-w-0">
          <p className="font-medium truncate">
            {recipient.full_name || "Unnamed user"}
          </p>
          <p className="text-sm text-gray-500 -mt-1 truncate">
            @{recipient.username || "user"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:px-10">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading messages
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message) => {
                const isMine = message.from_user_id === currentUserId;

                return (
                  <div
                    key={message._id}
                    className={`flex flex-col ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-2 text-sm max-w-sm rounded-lg shadow ${
                        isMine
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-white text-slate-700 rounded-bl-none"
                      }`}
                    >
                      {message.message_type === "image" && message.media_url ? (
                        <img
                          src={message.media_url}
                          alt=""
                          className="w-full max-w-sm rounded-lg mb-1"
                        />
                      ) : null}

                      {message.text ? <p>{message.text}</p> : null}
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef}></div>
          </div>
        )}
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            id="message-image"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <label
            htmlFor="message-image"
            className="size-10 shrink-0 cursor-pointer inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Attach image"
          >
            <Image size={18} />
          </label>

          <button
            type="button"
            onClick={sendMessage}
            disabled={sending || (!text.trim() && !image)}
            className="size-10 shrink-0 inline-flex items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send message"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        {imagePreview ? (
          <div className="max-w-4xl mx-auto mt-3 flex items-start gap-2">
            <img
              src={imagePreview}
              alt=""
              className="w-24 h-24 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="size-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatBot;
