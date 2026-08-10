import React, { useState } from "react";
import moment from "moment";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const currentUser = useSelector((state) => state.user.value);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [likes, setLikes] = useState(post.likes || post.likes_count || []);

  const handleLikes = async () => {
    if (!currentUser) return;

    const currentUserId = currentUser.id || currentUser._id;
    const previousLikes = likes;
    const nextLikes = likes.includes(currentUserId)
      ? likes.filter((id) => id !== currentUserId)
      : [...likes, currentUserId];

    setLikes(nextLikes);

    try {
      const token = await getToken();
      const { data } = await api.post(
        `/api/post/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!data.success) {
        throw new Error(data.message || "Could not update like");
      }

      if (typeof data.liked === "boolean") {
        setLikes((currentLikes) => {
          const hasLike = currentLikes.includes(currentUserId);
          if (data.liked && !hasLike) return [...currentLikes, currentUserId];
          if (!data.liked && hasLike) {
            return currentLikes.filter((id) => id !== currentUserId);
          }
          return currentLikes;
        });
      }
    } catch (error) {
      setLikes(previousLikes);
      toast.error(error.message);
    }
  };

  if (!post.user) {
    return null;
  }

  const profileId = post.user.id || post.user._id;
  const currentUserId = currentUser?.id || currentUser?._id;

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      <div
        onClick={() => profileId && navigate(`/profile/${profileId}`)}
        className="flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user.profile_picture}
          alt={post.user.full_name}
          className="w-10 h-10 rounded-full shadow"
        />

        <div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">{post.user.full_name}</span>

            {post.user.is_verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
            )}
          </div>

          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {post.content && (
        <div className="text-gray-800 text-sm whitespace-pre-line">
          {post.content.split(/(#\w+)/g).map((part, index) =>
            /^#\w+$/.test(part) ? (
              <span key={index} className="text-indigo-600 font-medium">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </div>
      )}

      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, index) => (
            <img
              key={img}
              src={img}
              alt={`Post ${index + 1}`}
              className={`w-full rounded-lg object-cover ${
                post.image_urls.length === 1 ? "col-span-2 h-auto" : "h-48"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 text-gray-600 text-sm pt-2 border-t border-gray-200">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={handleLikes}
        >
          <Heart
            className={`w-5 h-5 transition ${
              currentUserId && likes.includes(currentUserId)
                ? "text-red-500 fill-red-500"
                : ""
            }`}
          />
          <span>{likes.length}</span>
        </div>

        <div className="flex items-center gap-1 cursor-pointer">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count || post.comments?.length || 0}</span>
        </div>

        <div className="flex items-center gap-1 cursor-pointer">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
