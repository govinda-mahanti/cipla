import { useState, useRef, useEffect } from "react";
import { FaUserMd, FaUsers, FaPlus, FaList } from "react-icons/fa";
import { FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { BiSolidDashboard } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../redux/authSlice";
import { useLocation } from "react-router-dom";

import AddDoctorCard from "./AddDoctorCard";
import UploadVideoCard from "./UploadVideoCard";

const Navbar = () => {
  const [dropdown, setDropdown] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [doctorId, setDoctoeId] = useState(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const toggleDropdown = (key) => setDropdown(dropdown === key ? "" : key);
  const toggleMobileSub = (key) => setMobileSub(mobileSub === key ? "" : key);

  const navItemStyle = "relative flex items-center space-x-1 cursor-pointer";

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.showAddDoctor) {
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <nav className="bg-[#6A1916] text-white shadow">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Left: Logo */}
          {/* <div
            className="flex items-center space-x-2 font-bold text-lg cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <FaUserMd className="text-xl" />
            <span>CIPLA</span>
          </div> */}

          {/* Right: Menu Items */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <div
                className={navItemStyle}
                onClick={() => navigate("/dashboard")}
              >
                <BiSolidDashboard />
                <span>Dashboard</span>
              </div>

              {/* Doctors Dropdown */}
              <div className={navItemStyle} ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown("doctors")}
                  className="flex items-center space-x-1"
                >
                  <FaUsers />
                  <span>Doctors</span>
                  <IoIosArrowDown
                    className={`transition-transform ${
                      dropdown === "doctors" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {dropdown === "doctors" && (
                  <div className="absolute top-full left-0 bg-white text-black mt-2 rounded shadow p-2 z-50 w-40">
                    <div
                      className="hover:bg-gray-100 p-2 rounded flex items-center space-x-2 cursor-pointer"
                      onClick={() => {
                        setShowForm(true);
                        setDropdown("");
                      }}
                    >
                      <FaPlus />
                      <span>Add Doctor</span>
                    </div>
                    <div
                      className="hover:bg-gray-100 p-2 rounded flex items-center space-x-2 cursor-pointer"
                      onClick={() => {
                        navigate("/all-doctors");
                        setDropdown("");
                      }}
                    >
                      <FaList />
                      <span>View All</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded flex items-center justify-center gap-1 cursor-pointer"
              >
                <FiLogOut />
                Logout
              </button>
            </div>

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2 text-white font-bold text-xl">
              <FiUser />
              <span>{user?.full_name || "User"}</span>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <FiMenu className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#6A1916] text-white rounded-lg p-4 space-y-4">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <BiSolidDashboard />
              <span>Dashboard</span>
            </div>

            {/* Doctors */}
            <div>
              <div
                onClick={() => toggleMobileSub("doctors")}
                className="flex justify-between items-center cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <FaUsers />
                  <span>Doctors</span>
                </div>
                <IoIosArrowDown
                  className={`transition-transform ${
                    mobileSub === "doctors" ? "rotate-180" : ""
                  }`}
                />
              </div>
              {mobileSub === "doctors" && (
                <div className="ml-6 mt-2 space-y-2">
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => {
                      setShowForm(true);
                      setMobileSub("");
                    }}
                  >
                    <FaPlus />
                    <span>Add Doctor</span>
                  </div>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => {
                      navigate("/all-doctors");
                      setMobileSub("");
                    }}
                  >
                    <FaList />
                    <span>View All</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <FiUser />
                <span>{user?.full_name || "User"}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="py-1 rounded flex items-center justify-center gap-1 cursor-pointer"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <AddDoctorCard
          setShowForm={setShowForm}
          setShowVideoForm={setShowVideoForm}
          setDoctorName={setDoctorName}
          setDoctoeId={setDoctoeId}
        />
      )}
      {showVideoForm && (
        <UploadVideoCard
          doctorName={doctorName}
          setShowVideoForm={setShowVideoForm}
          doctorId={doctorId}
        />
      )}
    </nav>
  );
};

export default Navbar;
