import React, { useEffect, useState } from "react";
import { X, BadgeCheck } from "lucide-react";

const StoryViewer = ({ viewStory, setViewStory }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    let progressInterval;

    const duration = 10000; // 10 seconds

    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);

      const intervalTime = 100;
      let elapsed = 20;

      progressInterval = setInterval(() => {
        elapsed += intervalTime;
        setProgress((elapsed / duration) * 300);
      }, intervalTime);

      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [viewStory, setViewStory]);

  const handleClose = () => {
    setViewStory(null);
  };

  return (
    <div
      className="fixed inset-0 h-screen bg-black/90 z-[110] flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* User Info */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50">
        <img
          src={viewStory.user?.profile_picture}
          alt={viewStory.user?.full_name}
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />

        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white"
      >
        <X size={32} className="hover:scale-110 transition cursor-pointer" />
      </button>

      {/* Story Content */}
      <div className="flex items-center justify-center w-full h-full p-6">
        {viewStory.media_type === "text" ? (
          <p className="text-white text-3xl font-semibold px-8 text-center break-words">
            {viewStory.content}
          </p>
        ) : viewStory.media_type === "image" ? (
          <img
            src={viewStory.media_url}
            alt="Story"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
          />
        ) : (
          <video
            src={viewStory.media_url}
            controls
            autoPlay
            className="max-h-[80vh] max-w-[90vw] rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
