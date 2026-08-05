import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { dummyRecentMessagesData } from "../assets/assets";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);

  const fetchRecentMessages = async () => {
    setMessages(dummyRecentMessagesData);
  };

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message) => (
          <Link
            key={message._id}
            to="/message/chats"
            className="flex items-start gap-2 py-2 hover:bg-slate-100 rounded-md px-2 transition"
          >
            <img
              src={message.from_user_id.profile_picture}
              alt={message.from_user_id.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />

            <div className="w-full">
              <div className="flex justify-between items-center">
                <p className="font-medium">{message.from_user_id.full_name}</p>

                <p className="text-[10px] text-slate-400">
                  {moment(message.createdAt).fromNow()}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-slate-500 truncate">
                  {message.text || "Media"}
                </p>

                {!message.seen && (
                  <p className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                    1
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;
