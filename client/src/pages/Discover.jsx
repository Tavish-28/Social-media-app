import React, { useState } from "react";
import {
  Search,
  MapPin,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Plus,
} from "lucide-react";
import { dummyConnectionsData, dummyFollowingData } from "../assets/assets";

export default function Discover() {
  const [query, setQuery] = useState("");
  const [followingIds, setFollowingIds] = useState(
    dummyFollowingData.map((user) => user._id),
  );

  const toggleFollow = (id) => {
    setFollowingIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const q = query.trim().toLowerCase();
  const filteredUsers = dummyConnectionsData.filter((user) => {
    if (!q) return true;
    return (
      user.full_name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      user.bio.toLowerCase().includes(q) ||
      user.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Discover People
          </h1>
          <p className="text-sm text-slate-400">
            Connect with amazing people and grow your network
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people by name, username, bio, or location..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* People grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isFollowing = followingIds.includes(user._id);
              return (
                <div
                  key={user._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center gap-3 text-center"
                >
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="w-16 h-16 rounded-full object-cover bg-slate-100"
                  />

                  <div>
                    <p className="font-semibold text-slate-800">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-slate-400">@{user.username}</p>
                  </div>

                  <p className="text-xs text-slate-400">{user.bio}</p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {user.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      <Users size={12} />
                      {user.followers.length} Followers
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full mt-2">
                    <button
                      type="button"
                      onClick={() => toggleFollow(user._id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      {isFollowing ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      {isFollowing ? (
                        <MessageCircle size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center mt-10">
            No people match your search.
          </p>
        )}
      </main>
    </div>
  );
}
