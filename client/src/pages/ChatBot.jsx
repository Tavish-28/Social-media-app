import React, { useEffect, useRef, useState } from "react";
import { dummyUserData, dummyMessagesData } from "../assets/assets";

const ChatBot = () => {
  const [messages, setMessages] = useState(dummyMessagesData);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user] = useState(dummyUserData);

  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!text.trim() && !image) return;

    const newMessage = {
      _id: Date.now(),
      text,
      media_url: image ? URL.createObjectURL(image) : "",
      message_type: image ? "image" : "text",
      from_user_id: user._id,
      to_user_id: user._id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");
    setImage(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    user && (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
          <img
            src={user.profile_picture}
            alt=""
            className="size-8 rounded-full"
          />

          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 md:px-10">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.to_user_id !== user._id
                      ? "items-start"
                      : "items-end"
                  }`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                      message.to_user_id !== user._id
                        ? "rounded-bl-none"
                        : "rounded-br-none"
                    }`}
                  >
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        alt=""
                        className="w-full max-w-sm rounded-lg mb-1"
                      />
                    )}

                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              ))}

            {/* Scroll Target */}
            <div ref={messagesEndRef}></div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto  items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <input
              type="file"
              accept="image/*"
              id="image"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />

            <label
              htmlFor="image"
              className="cursor-pointer px-3 py-2 rounded-lg border hover:bg-gray-100"
            >
              📷
            </label>

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>

          {image && (
            <div className="max-w-4xl mx-auto mt-2">
              <img
                src={URL.createObjectURL(image)}
                alt=""
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default ChatBot;
