import { useState, useEffect } from "react";

import {
  FaUserMd,
  FaVideo,
  FaUsers,
  FaDownload,
  FaArrowUp,
  FaUserCheck,
} from "react-icons/fa";
import { FaUserPlus, FaUpload } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import AddDoctorCard from "../Components/AddDoctorCard";
import UploadVideoCard from "../Components/UploadVideoCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const token = useSelector((state) => state.auth.token);
  const [doctorId, setDoctoeId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const doctorRes = await fetch(
          "https://cipla-backend.virtualspheretechnologies.in/api/totalDoctors",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        const videoRes = await fetch(
          "https://cipla-backend.virtualspheretechnologies.in/api/totalVideos",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        const doctorData = await doctorRes.json();
        const videoData = await videoRes.json();

        console.log("Doctor Data:", doctorData);
        console.log("Video Data:", videoData);

        setTotalDoctors(doctorData.totalDoctors || 0);
        setTotalVideos(videoData.totalVideos || 0);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    if (token) fetchCounts();
  }, [token]);

  return (
    <div className="bg-[#FBFCFD]">
      {/* <div className="xl:max-w-7xl xl:mx-auto my-[50px]">
        <p className="text-black text-4xl font-bold">Welcome back, System!</p>
      </div> */}
      <div className="p-6 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:max-w-7xl xl:mx-auto">
        {/* Card 1: Total Doctors */}
        <div className="bg-white h-[200px] rounded-2xl shadow-sm p-5 border-t-4 border-[#6A1916]">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-md bg-[#6A1916]">
              <FaUserMd className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                {totalDoctors}
              </h2>

              <p className="text-base text-gray-600">Total Doctors</p>
            </div>
          </div>
          {/* <div className="flex items-center text-green-600 text-sm font-medium space-x-2 mt-3">
            <FaArrowUp />
            <span>+2 today</span>
          </div> */}
        </div>

        {/* Card 2: Total Videos */}
        <div className="bg-white h-[200px] rounded-xl shadow-sm p-5 border-t-4 border-[#6A1916]">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-md bg-[#6A1916]">
              <FaVideo className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                {totalVideos}
              </h2>

              <p className="text-base text-gray-600">Total Videos</p>
            </div>
          </div>
          {/* <div className="flex items-center text-green-600 text-sm font-medium space-x-2 mt-3">
            <FaArrowUp />
            <span>+1 today</span>
          </div> */}
        </div>

        {/* Card 3: Field Managers */}
        {/* <div className="bg-white h-[200px] rounded-xl shadow-sm p-5 border-t-4 border-[#6A1916]">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-md bg-gradient-to-r from-purple-500 to-blue-500">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                0
              </h2>
              <p className="text-base text-gray-600">Field Managers</p>
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium space-x-2 mt-3">
            <FaUserCheck />
            <span>Active users</span>
          </div>
        </div> */}

        {/* Card 4: Downloads */}
        {/* <div className="bg-white h-[200px] rounded-xl shadow-sm p-5 border-t-4 border-[#6A1916]">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-md bg-gradient-to-r from-yellow-400 to-orange-400">
              <FaDownload className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                11
              </h2>
              <p className="text-base text-gray-600">Downloads</p>
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium space-x-2 mt-3">
            <FaArrowUp />
            <span>Total downloads</span>
          </div>
        </div> */}
      </div>

      <div className="p-6 xl:max-w-7xl xl:mx-auto">
        <h2 className="text-xl font-semibold flex items-center space-x-2 mb-4">
          <span className="text-black">⚡ Quick Actions</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Doctor */}
          <div
            onClick={() => {
              setShowForm(true);
            }}
            className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-[#6A1916] flex items-center justify-between transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-start space-x-3">
              <div className="p-3 rounded-md bg-[#6A1916]">
                <FaUserPlus className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-md font-bold text-gray-800">Add Doctor</h3>
                <p className="text-sm text-gray-500">
                  Register new doctor profiles
                </p>
              </div>
            </div>
            <FiArrowRight className="text-gray-400 text-lg" />
          </div>

          {/* Upload Video
          <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-green-500 flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-start space-x-3">
              <div className="p-3 rounded-md bg-green-500">
                <FaUpload className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-md font-bold text-gray-800">
                  Upload Video
                </h3>
                <p className="text-sm text-gray-500">Create branded montages</p>
              </div>
            </div>
            <FiArrowRight className="text-gray-400 text-lg" />
          </div> */}

          {/* View Doctors */}
          <div
            onClick={() => {
              navigate("/all-doctors");
            }}
            className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-[#6A1916] flex items-center justify-between transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-start space-x-3">
              <div className="p-3 rounded-md bg-[#6A1916]">
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-md font-bold text-gray-800">
                  View Doctors
                </h3>
                <p className="text-sm text-gray-500">Manage doctor database</p>
              </div>
            </div>
            <FiArrowRight className="text-gray-400 text-lg" />
          </div>

          {/* View Videos
          <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-yellow-400 flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-start space-x-3">
              <div className="p-3 rounded-md bg-orange-400">
                <FaVideo className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-md font-bold text-gray-800">View Videos</h3>
                <p className="text-sm text-gray-500">Browse video library</p>
              </div>
            </div>
            <FiArrowRight className="text-gray-400 text-lg" />
          </div> */}
        </div>
      </div>
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
    </div>
  );
};

export default Home;
