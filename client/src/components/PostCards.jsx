import React, { useState } from "react";
import moment from "moment";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import { dummyUserData } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post }) => {
  // Highlight hashtags
  const postWithHashtag = post.content?.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600 font-medium">$1</span>',
  );

  const currentUser = dummyUserData;
  const handleLike = async () => {};
  const navigate = useNavigate();

  // likes should be an array of user IDs
  const [likes, setLikes] = useState(post.likes || []);

  const handleLikes = () => {
    if (likes.includes(currentUser._id)) {
      setLikes(likes.filter((id) => id !== currentUser._id));
    } else {
      setLikes([...likes, currentUser._id]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      {/* User Info */}
      <div
        onClick={() => navigate("/profile/") + post.user._id}
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

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtag }}
        />
      )}

      {/* Images */}
      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Post ${index + 1}`}
              className={`w-full rounded-lg object-cover ${
                post.image_urls.length === 1 ? "col-span-2 h-auto" : "h-48"
              }`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 text-gray-600 text-sm pt-2 border-t border-gray-200">
        {/* Like */}
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={handleLikes}
        >
          <Heart
            className={`w-5 h-5 transition ${
              likes.includes(currentUser._id) ? "text-red-500 fill-red-500" : ""
            }`}
          />
          <span>{likes.length}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1 cursor-pointer">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count || post.comments?.length || 0}</span>
        </div>

        {/* Share */}
        <div className="flex items-center gap-1 cursor-pointer">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
