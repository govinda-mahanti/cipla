import axios from "axios";
import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0); // Optional

  const fetchTotals = async (date) => {
    try {
      const doctorRes = await axios.get(
        `https://cipla-backend.virtualspheretechnologies.in/api/totalDoctorAdded?date=${date}`
      );
      const videoRes = await axios.get(
        `https://cipla-backend.virtualspheretechnologies.in/api/totalVideosRecorded?date=${date}`
      );

      setTotalDoctors(doctorRes?.data.total_doctors || 0);
      setTotalVideos(videoRes?.data?.count || 0);
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    }
  };

  const handleGoClick = () => {
    if (selectedDate) {
      fetchTotals(selectedDate);
    }
  };

  useEffect(() => {
    // Load today's data by default
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchTotals(today);
  }, []);

  return (
    <div>
      <h2 className="font-bold text-3xl">Dashboard</h2>

      <div className="mb-6">
        <label className="font-semibold text-lg mr-3">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-1 rounded shadow mt-5"
        />
        <button
          className="bg-[#864242] text-white rounded px-2 py-1 ml-5"
          onClick={handleGoClick}
        >
          Go
        </button>
      </div>

      <div className="flex gap-9 mt-8 flex-wrap">
        <div className="flex flex-col justify-between p-5 h-[170px] w-[240px] rounded-xl bg-[#864242] text-white relative">
          <p className="font-semibold text-xl">Doctors Added</p>
          <p className="absolute bottom-3 right-3 font-semibold text-xl">
            {totalDoctors}
          </p>
        </div>
        <div className="flex flex-col justify-between p-5 h-[170px] w-[240px] rounded-xl bg-[#864242] text-white relative">
          <p className="font-semibold text-xl">Doctors Recorded</p>
          <p className="absolute bottom-3 right-3 font-semibold text-xl">
            {totalVideos}
          </p>
        </div>
        <div className="flex flex-col justify-between p-5 h-[170px] w-[240px] rounded-xl bg-[#864242] text-white relative">
          <p className="font-semibold text-xl">Videos Downloaded</p>
          <p className="absolute bottom-3 right-3 font-semibold text-xl">
            {totalDownloads}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
