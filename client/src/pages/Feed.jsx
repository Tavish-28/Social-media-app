import React, { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCards";
import { assets } from "../assets/assets";
import RecentMessages from "../components/RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Feed = () => {
  const [feeds, setfeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchFeeds = useCallback(async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/post/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setfeeds(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/** Stories and Post list */}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
      {/**Right Sidebar */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h1 className="text-slate-800 font-semibold">Sponsered</h1>
          <img
            src={assets.sponsored_img}
            className="w-75 h-50 rounded-md "
            alt=""
          />
          <p className="text-slate-600 ">Email marketing</p>
          <p className="text-slate-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis
            quidem quis in.
          </p>
        </div>
        <RecentMessages />
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
