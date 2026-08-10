import { Routes, Route } from "react-router-dom";
// import HomePage from "./pages/HomePage";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import Connections from "./pages/Connections";
import ChatBot from "./pages/ChatBot";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import LayOut from "./pages/LayOut";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import Loading from "./components/Loading";
// import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

function App() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <LayOut />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="message/chats" element={<ChatBot />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="connections" element={<Connections />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
      </Routes>
    </>
  );
}

export default App;
