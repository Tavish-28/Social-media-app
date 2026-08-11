import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock,
  Loader2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptConnectionRequest,
  fetchConnections,
  followUser,
  unfollowUser,
} from "../features/connections/connectionSlice";

const TABS = [
  { key: "followers", label: "Followers", icon: Users },
  { key: "following", label: "Following", icon: UserCheck },
  { key: "pendingConnections", label: "Pending", icon: Clock },
  { key: "connections", label: "Connections", icon: UsersRound },
];

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
        className="w-12 h-12 rounded-full object-cover shrink-0 bg-slate-100"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full shrink-0 bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

function PersonCard({ user, tab, followingIds, onAccept, onFollow, onUnfollow }) {
  const navigate = useNavigate();
  const userId = getUserKey(user);
  const isFollowing = followingIds.has(userId);

  const renderAction = () => {
    if (tab === "pendingConnections") {
      return (
        <button
          onClick={() => onAccept(userId)}
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Check size={16} />
          Accept
        </button>
      );
    }

    if (tab === "following") {
      return (
        <button
          onClick={() => onUnfollow(userId)}
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <UserMinus size={16} />
          Unfollow
        </button>
      );
    }

    if (!isFollowing && tab === "followers") {
      return (
        <button
          onClick={() => onFollow(userId)}
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          <UserPlus size={16} />
          Follow
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(`/profile/${userId}`)}
        type="button"
        className="flex-1 rounded-xl bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
      >
        View Profile
      </button>
    );
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {user.full_name || "Unnamed user"}
          </p>
          <p className="text-sm text-slate-400 truncate">
            @{user.username || "user"}
          </p>
          {user.bio ? (
            <p className="text-xs text-slate-400 truncate">{user.bio}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {renderAction()}
        {tab !== "connections" ? (
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            type="button"
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Profile
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("followers");
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { connections, pendingConnections, followers, following, loading, error } =
    useSelector((state) => state.connections);

  useEffect(() => {
    const loadConnections = async () => {
      const token = await getToken();
      dispatch(fetchConnections(token));
    };

    loadConnections();
  }, [dispatch, getToken]);

  const followingIds = useMemo(
    () => new Set(following.map((user) => getUserKey(user))),
    [following],
  );

  const peopleByTab = {
    followers,
    following,
    pendingConnections,
    connections,
  };
  const people = peopleByTab[activeTab] || [];

  const stats = TABS.map((tab) => ({
    ...tab,
    value: (peopleByTab[tab.key] || []).length,
  }));

  const runConnectionAction = async (action, id) => {
    if (!id) return;
    const token = await getToken();
    dispatch(action({ id, token }));
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Connections</h1>
          <p className="text-sm text-slate-400">
            Manage your followers, following, requests, and connections
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setActiveTab(stat.key)}
              className={`rounded-lg border bg-white py-4 text-center transition-colors ${
                activeTab === stat.key
                  ? "border-violet-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading connections
          </div>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        ) : people.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((user) => (
              <PersonCard
                key={getUserKey(user)}
                user={user}
                tab={activeTab}
                followingIds={followingIds}
                onAccept={(id) =>
                  runConnectionAction(acceptConnectionRequest, id)
                }
                onFollow={(id) => runConnectionAction(followUser, id)}
                onUnfollow={(id) => runConnectionAction(unfollowUser, id)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-400">
            Nothing here yet.
          </p>
        )}
      </main>
    </div>
  );
}
