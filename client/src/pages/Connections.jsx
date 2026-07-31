import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Clock, UsersRound } from "lucide-react";
import {
  dummyFollowersData,
  dummyFollowingData,
  dummyConnectionsData,
  dummyPendingConnectionsData,
} from "../assets/assets";

const TABS = [
  { key: "followers", label: "Followers", icon: Users },
  { key: "following", label: "Following", icon: UserCheck },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "connections", label: "Connections", icon: UsersRound },
];

const PEOPLE = {
  followers: dummyFollowersData,
  following: dummyFollowingData,
  pending: dummyPendingConnectionsData,
  connections: dummyConnectionsData,
};

const STATS = [
  { label: "Followers", value: dummyFollowersData.length },
  { label: "Following", value: dummyFollowingData.length },
  { label: "Pending", value: dummyPendingConnectionsData.length },
  { label: "Connections", value: dummyConnectionsData.length },
];

function PersonCard({ user }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-12 h-12 rounded-full object-cover shrink-0 bg-slate-100"
        />
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {user.full_name}
          </p>
          <p className="text-sm text-slate-400 truncate">@{user.username}</p>
          <p className="text-xs text-slate-400 truncate">{user.bio}</p>
        </div>
      </div>
      <button
        onClick={() => navigate(`/profile/${user._id}`)}
        type="button"
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        View Profile
      </button>
    </div>
  );
}

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("followers");
  const people = PEOPLE[activeTab];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Connections</h1>
          <p className="text-sm text-slate-400">
            Manage your network and discover new connections
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white py-4 text-center"
            >
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
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

        {/* People grid */}
        {people.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((user) => (
              <PersonCard key={user._id} user={user} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Nothing here yet.</p>
        )}
      </main>
    </div>
  );
}
