import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(8,15,30,.80), rgba(8,15,30,.80)), url(${assets.loginBg})`,
      }}
    >
      <div
        className="
        hover-wiggle
        w-full
        max-w-md
        bg-[#101827]/80
        backdrop-blur-xl
        rounded-3xl
        border
        border-blue-500/30
        shadow-[0_0_60px_rgba(37,99,235,.20)]
        p-8
        transition-all
        duration-300
        hover:scale-105
        "
      >
        {/* Profile */}

        <div className="flex flex-col items-center">
          <img
            src={assets.sample_profile}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover shadow-lg shadow-blue-500/40"
          />

          <h1 className="text-4xl font-bold text-white mt-5">Tavishzz</h1>

          <p className="text-slate-400 mt-2 mb-8">Welcome Back 👋</p>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="
            w-full
            p-4
            rounded-xl
            bg-[#1E293B]
            border
            border-slate-700
            text-white
            placeholder:text-slate-400
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="
            w-full
            p-4
            rounded-xl
            bg-[#1E293B]
            border
            border-slate-700
            text-white
            placeholder:text-slate-400
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          // herer buttons login and signup
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button
                className="
      w-full
      py-4
      rounded-xl
      bg-gradient-to-r
      from-blue-600
      to-blue-500
      text-white
      font-semibold
      hover:scale-105
      transition-all
      "
              >
                Login
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                className="
      w-full
      py-4
      rounded-xl
      border
      border-blue-500
      text-blue-400
      font-semibold
      hover:bg-blue-500
      hover:text-white
      transition-all
      "
              >
                Create Account
              </button>
            </SignUpButton>
          </div>
        </form>

        <p className="text-center text-slate-400 mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
