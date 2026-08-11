import React, { useEffect, useMemo } from "react";

import { Eye, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConnections } from "../features/connections/connectionSlice";

const getUserKey = (user) => user?.id || user?._id;

const uniqueUsers = (...groups) => {
  const usersById = new Map();

  groups.flat().forEach((user) => {
    const id = getUserKey(user);
    if (id && !usersById.has(id)) {
      usersById.set(id, user);
    }
  });

  return [...usersById.values()];
};

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
        className="rounded-full size-12 object-cover bg-slate-100"
      />
    );
  }

  return (
    <div className="rounded-full size-12 bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

const Messages = () => {
  const { connections, followers, following, loading, error } = useSelector(
    (state) => state.connections,
  );
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadConnections = async () => {
      const token = await getToken();
      dispatch(fetchConnections(token));
    };

    loadConnections();
  }, [dispatch, getToken]);

  const messageUsers = useMemo(
    () => uniqueUsers(connections, following, followers),
    [connections, following, followers],
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
        <p className="text-slate-600">Talk to your friends and family</p>
      </div>

      {loading ? (
        <div className="max-w-xl flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading conversations
        </div>
      ) : error ? (
        <p className="max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      ) : messageUsers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {messageUsers.map((user) => {
            const userId = getUserKey(user);
            return (
              <div
                key={userId}
                className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-lg border border-slate-100"
              >
                <Avatar user={user} />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate">
                    {user.full_name || "Unnamed user"}
                  </p>

                  <p className="text-slate-500 truncate">
                    @{user.username || "user"}
                  </p>

                  {user.bio ? (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {user.bio}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/message/chats`, { state: { recipient: user } })
                    }
                    className="size-10 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
                    title="Open chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${userId}`)}
                    className="size-10 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
                    title="View profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Follow someone, get a follower, or accept a connection request to start messaging.
        </p>
      )}
    </div>
  );
};

export default Messages;
