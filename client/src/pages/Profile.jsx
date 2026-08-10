import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Calendar, Users, FileText, Edit, X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import { updateUser } from "../features/user/userSlice";

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { profileId } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    location: "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const isOwnProfile =
    currentUser &&
    user &&
    (currentUser._id === user._id || currentUser.id === user.id);

  const fetchProfile = useCallback(
    async (profileId) => {
      if (!profileId) return;

      const token = await getToken();
      try {
        const { data } = await api.post(
          `/api/user/profiles`,
          { profile_id: profileId },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (data.success) {
          setUser(data.profile);
          setPosts(data.posts);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    } else {
      fetchProfile(currentUser?._id);
    }
  }, [profileId, currentUser?._id, fetchProfile]);

  const openEditProfile = () => {
    setEditForm({
      full_name: user.full_name || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
    });
    setProfileFile(null);
    setCoverFile(null);
    setShowEdit(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((form) => ({ ...form, [name]: value }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("full_name", editForm.full_name);
    formData.append("username", editForm.username);
    formData.append("bio", editForm.bio);
    formData.append("location", editForm.location);

    if (profileFile) formData.append("profile", profileFile);
    if (coverFile) formData.append("cover", coverFile);

    setSavingProfile(true);
    try {
      const token = await getToken();
      const updatedUser = await dispatch(
        updateUser({ userData: formData, token }),
      ).unwrap();
      setUser(updatedUser);
      setShowEdit(false);
    } catch {
      // The Redux thunk already displays the server error.
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-4">
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
                />

                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {user.full_name}
                  </h1>

                  <p className="text-slate-500">@{user.username}</p>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={openEditProfile}
                  className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Bio */}
            <p className="mt-5 text-slate-700">{user.bio}</p>

            {/* Details */}
            <div className="mt-5 flex flex-wrap gap-6 text-slate-600 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {user.location}
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex gap-8">
              <div>
                <h2 className="text-xl font-bold">{posts.length}</h2>
                <p className="text-slate-500 text-sm">Posts</p>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {user.followers?.length || 0}
                </h2>
                <p className="text-slate-500 text-sm">Followers</p>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {user.following?.length || 0}
                </h2>
                <p className="text-slate-500 text-sm">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === "posts"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <div className="flex justify-center items-center gap-2">
                <FileText size={18} />
                Posts
              </div>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === "about"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <div className="flex justify-center items-center gap-2">
                <Users size={18} />
                About
              </div>
            </button>
          </div>

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="p-6 space-y-5">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profile_picture}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>

                        <p className="text-xs text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-slate-700">{post.content}</p>

                    {post.image_urls?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {post.image_urls.map((imageUrl, index) => (
                          <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            className={`rounded-xl w-full object-cover ${
                              post.image_urls.length === 1
                                ? "col-span-2 max-h-[450px]"
                                : "h-48"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No Posts Yet
                </div>
              )}
            </div>
          )}

          {/* About */}
          {activeTab === "about" && (
            <div className="p-6 space-y-5">
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-slate-600">{user.bio}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-slate-600">{user.location}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Username</h3>
                <p className="text-slate-600">@{user.username}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-slate-600">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && isOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="p-2 rounded-full hover:bg-slate-100"
                aria-label="Close edit profile"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full name
            </label>
            <input
              name="full_name"
              value={editForm.full_name}
              onChange={handleEditChange}
              className="w-full border rounded-lg p-3 mb-3"
              required
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              name="username"
              value={editForm.username}
              onChange={handleEditChange}
              className="w-full border rounded-lg p-3 mb-3"
              required
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleEditChange}
              rows={4}
              className="w-full border rounded-lg p-3 mb-3 resize-none"
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <input
              name="location"
              value={editForm.location}
              onChange={handleEditChange}
              className="w-full border rounded-lg p-3 mb-3"
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Profile picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setProfileFile(event.target.files?.[0])}
              className="w-full border rounded-lg p-3 mb-3"
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cover photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCoverFile(event.target.files?.[0])}
              className="w-full border rounded-lg p-3 mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg border disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
