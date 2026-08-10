import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";

const LayOut = () => {
  const user = useSelector((state) => state.user.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return user ? (
    <div className="w-full flex h-screen">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>
      {sidebarOpen ? (
        <X
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-500  sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : (
        <Menu
          className="absolute top-3 right-3 p-2 z-100 bg-amber-200 rounded-md shadow w-10 h-10 text-gray-100 border-b-cyan-800 sm:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default LayOut;
