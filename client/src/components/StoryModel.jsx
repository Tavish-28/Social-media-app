import { Sparkle, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
// import { File, Video } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { TextIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

const StoryModel = ({ setShowModel, onStoryCreated }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { getToken } = useAuth();

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCreateStory = async () => {
    const trimmedText = text.trim();
    const mediaType = media?.type.startsWith("image")
      ? "image"
      : media?.type.startsWith("video")
        ? "video"
        : "text";

    if (mode === "text" && !trimmedText) {
      throw new Error("Add text before creating a story");
    }

    if (mode === "media" && !media) {
      throw new Error("Choose an image or video before creating a story");
    }

    if (mode === "media" && mediaType === "text") {
      throw new Error("Only image and video files are supported");
    }

    const formData = new FormData();
    formData.append("content", trimmedText);
    formData.append("media_type", mode === "media" ? mediaType : "text");
    formData.append("background_color", background);

    if (media) {
      formData.append("media", media);
    }

    const token = await getToken();
    const { data } = await api.post("/api/story/create", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data.success) {
      throw new Error(data.message || "Story not added");
    }

    await onStoryCreated?.(data.story);
    setShowModel(false);
    return data;
  };

  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between ">
          <button
            onClick={() => {
              setShowModel(false);
            }}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story </h2>
          <span className="w-10"></span>
        </div>
        <div
          className="rounded-lg h-96 flex items-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="object-contain max-h-full"
              ></video>
            ))}
        </div>
        {mode === "media" && (
          <textarea
            className="mt-3 w-full rounded bg-white/10 p-3 text-sm text-white resize-none focus:outline-none placeholder-white/60"
            rows={3}
            placeholder="Add text to your story"
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
        )}
        <div className="flex mt-4 gap-2">
          {bgColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            ></button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === "text" ? "bg-white text-black " : "bg-red-800"}`}
          >
            <TextIcon size={18} />
            Text
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input
              onChange={(e) => {
                handleMediaUpload(e);
                setMode("media");
              }}
              type="file"
              accept="image/*, video/*"
              className="hidden"
            />
            <Upload size={18} /> Photo/Video
          </label>
        </div>
        <button
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving.....",
              success: <p>Story Added</p>,
              error: (e) => <p>{e.message}</p>,
            })
          }
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer"
        >
          <Sparkle size={18} /> Create Story
        </button>
      </div>
    </div>
  );
};

export default StoryModel;
