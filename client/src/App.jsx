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
import { useUser } from "@clerk/clerk-react";
// import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

function App() {
  const { user } = useUser();
  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <LayOut />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/app" element={<LayOut />}>
        <Route index element={<Feed />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/chats" element={<ChatBot />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile" element={<Profile />} />
        <Route path="connections" element={<Connections />} />
        <Route path="create-post" element={<CreatePost />} />
      </Route>
    </Routes>
  );
}

export default App;
