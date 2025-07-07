import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const AllManagers = () => {
  const [managerData, setManagerData] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchEmpNo, setSearchEmpNo] = useState(""); // Currently unused
  const [searchLocation, setSearchLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  // Fetch API data
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get(
          "https://backend.flctech.in/api/totalManager"
        );
        console.log("Fetched:", res.data.data);
        setManagerData(res.data.data);
        setFilteredManagers(res.data.data);
      } catch (error) {
        console.log("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  // Handle search
  const handleSearch = () => {
    const filtered = managerData.filter((m) => {
      const nameMatch = m.fullName
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const locationMatch = m.Location?.toLowerCase().includes(
        searchLocation.toLowerCase()
      );
      const empNoMatch = m.Emp_Code?.toString().includes(
        searchEmpNo.toString()
      );

      // Apply all active filters
      return nameMatch && locationMatch && empNoMatch;
    });

    setFilteredManagers(filtered);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredManagers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // for all managers
  const handleDownload = () => {
    if (filteredManagers.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Sl No",
      "Name",
      "Emp Code",
      "Location",
      "Doctors allocated",
      "Completed",
    ];

    const rows = filteredManagers.map((manager, index) => [
      index + 1,
      manager.fullName,
      manager.Emp_Code,
      manager.Location,
      50,
      `${manager.total_doctor_added} (${(
        (manager.total_doctor_added / 50) *
        100
      ).toFixed(0)}%)`,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "managers_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // for a spesific manager
const handleDownloadDoctors = async (empCode, fullName) => {
  try {
    const response = await axios.get(
      `https://backend.flctech.in/api/getTotalDoctorsByManager?emp_code=${empCode}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const doctors = response.data.result || [];

    if (doctors.length === 0) {
      alert("No doctors found for this manager.");
      return;
    }

    const headers = ["Sl No", "Doctor Name", "Specialization", "City", "Contact"];

    const rows = doctors.map((doc, index) => [
      index + 1,
      doc.doctor_full_name,
      doc.specialization,
      doc.city,
      doc.contact === 0 ? "N/A" : doc.contact, 
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${fullName.replace(/\s+/g, "_")}_doctors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading doctors:", err);
    alert("Failed to download doctors for this manager.");
  }
};

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">All Managers</h2>

      {/* Search Inputs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="number"
          placeholder="Search by Employee no."
          value={searchEmpNo}
          onChange={(e) => setSearchEmpNo(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64"
        />
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64"
        />
        <input
          type="text"
          placeholder="Search by location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Search
        </button>

        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Download
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="py-2 px-4 border">Sl No</th>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Emp Code</th>
            <th className="py-2 px-4 border">Location</th>
            <th className="py-2 px-4 border">Doctors allocated</th>
            <th className="py-2 px-4 border">Completed</th>
            <th className="py-2 px-4 border">Data</th>
          </tr>
        </thead>
        <tbody>
      {currentData.length > 0 ? (
        currentData.map((manager, index) => (
          <tr
            key={index}
            className="text-sm hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate(`/doctors/${manager.Emp_Code}`)}
          >
            <td className="py-2 px-4 border">{startIndex + index + 1}</td>
            <td className="py-2 px-4 border">{manager.fullName}</td>
            <td className="py-2 px-4 border">{manager.Emp_Code}</td>
            <td className="py-2 px-4 border">{manager.Location}</td>
            <td className="py-2 px-4 border text-center">50</td>
            <td className="py-2 px-4 border text-center">
              {manager.total_doctor_added} (
              {((manager.total_doctor_added / 50) * 100).toFixed(0)}%)
            </td>
            <td className="py-2 px-4 border">
              <button
                className="bg-[#864242] px-2 py-1 rounded text-white"
                onClick={(e) => {
                  e.stopPropagation(); // prevent row navigation
                  handleDownloadDoctors(manager.Emp_Code, manager.fullName);
                }}
              >
                Download
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td className="py-3 px-4 border text-center text-gray-500" colSpan="7">
            No managers found.
          </td>
        </tr>
      )}
    </tbody>
      </table>

      {/* Pagination Controls */}
      {filteredManagers.length > itemsPerPage && (
        <div className="flex justify-end mt-4">
          <div className="space-x-2 text-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Prev
            </button>
            <span className="px-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllManagers;
