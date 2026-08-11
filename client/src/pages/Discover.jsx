import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  fetchConnections,
  followUser,
  sendConnectionRequest,
  unfollowUser,
} from "../features/connections/connectionSlice";

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
        className="w-16 h-16 rounded-full object-cover bg-slate-100"
      />
    );
  }

  return (
    <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-lg font-semibold">
      {initials}
    </div>
  );
}

export default function Discover() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const following = useSelector((state) => state.connections.following);

  const followingIds = useMemo(
    () => new Set(following.map((user) => getUserKey(user))),
    [following],
  );

  useEffect(() => {
    const loadConnections = async () => {
      const token = await getToken();
      dispatch(fetchConnections(token));
    };

    loadConnections();
  }, [dispatch, getToken]);

  useEffect(() => {
    const searchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const token = await getToken();
        const { data } = await api.get("/api/user/discover", {
          params: { input: query.trim() },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!data.success) {
          setUsers([]);
          setError(data.message || "Could not search users");
          return;
        }

        setUsers(data.users || []);
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setUsers([]);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, getToken]);

  const runUserAction = async (action, id) => {
    if (!id) return;
    const token = await getToken();
    dispatch(action({ id, token }));
  };

  const openProfile = (id) => {
    if (!id) {
      toast.error("Profile is missing");
      return;
    }

    navigate(`/profile/${id}`);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Discover People
          </h1>
          <p className="text-sm text-slate-400">
            Search people by name, username, email, or location
          </p>
        </header>

        <div className="relative mb-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Searching people
          </div>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => {
              const userId = getUserKey(user);
              const isFollowing = followingIds.has(userId);
              return (
                <div
                  key={userId}
                  className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col items-center gap-3 text-center"
                >
                  <button type="button" onClick={() => openProfile(userId)}>
                    <Avatar user={user} />
                  </button>

                  <div className="min-w-0 max-w-full">
                    <p className="font-semibold text-slate-800 truncate">
                      {user.full_name || "Unnamed user"}
                    </p>
                    <p className="text-sm text-slate-400 truncate">
                      @{user.username || "user"}
                    </p>
                  </div>

                  {user.bio ? (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {user.bio}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {user.location ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                        <MapPin size={12} />
                        {user.location}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      <Users size={12} />
                      {(user.followers || []).length} Followers
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(
                          isFollowing ? unfollowUser : followUser,
                          userId,
                        )
                      }
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-colors ${
                        isFollowing
                          ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                      }`}
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
                      onClick={() => runUserAction(sendConnectionRequest, userId)}
                      className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                      title="Send connection request"
                    >
                      <Plus size={16} />
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
