import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarMenu = [
    { text: "Dashboard", url: "/admin-dashboard", icon: <DashboardIcon /> },
    { text: "All Doctors", url: "/all-doctors-list", icon: <LocalHospitalIcon /> },
    { text: "All Managers", url: "/all-managers", icon: <PeopleIcon /> },
  ];

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;
    return `${formattedDate} | ${now.toLocaleTimeString()}`;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getFullYear()}`;
      setCurrentTime(`${formattedDate} | ${now.toLocaleTimeString()}`);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      {/* Mobile Header */}
      <div className="sm:hidden bg-[#6A1916] text-white px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        <div className="text-sm text-right mt-1">
          {currentTime}
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-[#6A1916] text-white w-full sm:w-64 sm:flex flex-col justify-between transition-all duration-300 ${
          isSidebarOpen ? "flex flex-col" : "hidden sm:flex"
        }`}
      >
        <div>
          <h1 className="text-center py-6 text-2xl font-bold hidden sm:block">Admin Panel</h1>
          <ul className="mt-4 space-y-2 px-4 font-sans font-medium">
            {sidebarMenu.map((item, index) => (
              <li
                key={index}
                className={`p-2 flex items-center space-x-3 rounded-lg hover:bg-[#d46b67] ${
                  location.pathname === item.url ? "bg-[#864242]" : ""
                }`}
              >
                <span>{item.icon}</span>
                <Link to={item.url}>{item.text}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 my-4">
          <button
            onClick={handleLogout}
            className="p-2 flex items-center space-x-3 rounded-lg hover:bg-[#d46b67] bg-[#864242] w-full"
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden sm:block bg-[#6A1916] text-white px-6 py-4 text-right text-sm">
          {currentTime}
        </header>

        {/* Page Content */}
        <section className="p-4 sm:p-8 bg-gray-100 flex-1 overflow-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
