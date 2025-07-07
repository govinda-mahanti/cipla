import React, { useEffect, useState } from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import axios from "axios";

const AllDoctorsList = () => {
  const [doctorData, setDoctorData] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          "https://cipla-backend.virtualspheretechnologies.in/api/totalDoctorsList"
        );
        const data = res.data.results || [];
        setDoctorData(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        alert("Failed to load doctors");
      }
    };

    fetchDoctors();
  }, []);

  // Search filter
  const handleSearch = () => {
    const filtered = doctorData.filter((doc) => {
      const nameMatch = doc.full_name
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const locationMatch = doc.city
        ?.toLowerCase()
        .includes(searchLocation.toLowerCase());
      return nameMatch && locationMatch;
    });
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file.");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredDoctors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDownloadDoctors = () => {
    if (filteredDoctors.length === 0) {
      alert("No doctors to download.");
      return;
    }

    const headers = [
      "Sl No",
      "Doctor Name",
      "Specialization",
      "City",
      "Contact",
      "Media",
    ];

    const rows = filteredDoctors.map((doc, index) => {
      let media = "No Media";
      if (doc.video_details?.image_file) {
        media = `https://cipla-backend.virtualspheretechnologies.in/api/image/${doc.video_details.image_file}`;
      }
      if (doc.video_details?.video_file) {
        media = `https://cipla-backend.virtualspheretechnologies.in/api/video/${doc.video_details.video_file}`;
      }

      return [
        index + 1,
        doc.full_name || "N/A",
        doc.specialization || "N/A",
        doc.city || "N/A",
        doc.contact === 0 || !doc.contact ? "N/A" : doc.contact,
        media,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `DoctorsList_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">All Doctors</h2>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
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
          onClick={handleDownloadDoctors}
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
            <th className="py-2 px-4 border">Specialization</th>
            <th className="py-2 px-4 border">Contact</th>
            <th className="py-2 px-4 border">Location</th>
            <th className="py-2 px-4 border text-center">Media</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((doc, index) => (
              <tr key={index} className="text-sm hover:bg-gray-50">
                <td className="py-2 px-4 border">{startIndex + index + 1}</td>
                <td className="py-2 px-4 border">{doc.full_name}</td>
                <td className="py-2 px-4 border">
                  {doc.specialization || "N/A"}
                </td>
                <td className="py-2 px-4 border">
                  {doc.contact === 0 || !doc.contact ? "N/A" : doc.contact}
                </td>
                <td className="py-2 px-4 border">{doc.city}</td>
                <td className="py-2 px-4 border text-center">
                  <div className="flex items-center justify-center gap-2">
                    <FaEye
                      className="text-cyan-500 cursor-pointer w-5 h-5"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setShowModal(true);
                      }}
                      title="Preview"
                    />

                    {doc.video_details?.image_file && (
                      <button
                        onClick={() =>
                          handleDownload(
                            `https://cipla-backend.virtualspheretechnologies.in/api/image/${doc.video_details.image_file}`,
                            `doctor_${doc.full_name || "image"}.jpg`
                          )
                        }
                        className="text-green-600 hover:text-green-800"
                        title="Download Image"
                      >
                        <FaDownload />
                      </button>
                    )}

                    {doc.video_details?.video_file && (
                      <button
                        onClick={() =>
                          handleDownload(
                            `https://cipla-backend.virtualspheretechnologies.in/api/video/${doc.video_details.video_file}`,
                            `doctor_${doc.full_name || "video"}.mp4`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Video"
                      >
                        <FaDownload />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="py-3 px-4 border text-center text-gray-500"
              >
                No doctors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {filteredDoctors.length > itemsPerPage && (
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

      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-[500px]">
            <h3 className="text-lg font-bold mb-4 text-center">
              Media Preview
            </h3>

            {/* Image Preview */}
            {selectedDoctor.video_details?.image_file && (
              <div className="mb-4">
                <p className="font-semibold mb-1">Image:</p>
                <img
                  src={`https://cipla-backend.virtualspheretechnologies.in/api/image/${selectedDoctor.video_details.image_file}`}
                  alt="Doctor"
                  className="w-auto h-[70vh] rounded"
                />
              </div>
            )}

            {/* Video Preview */}
            {selectedDoctor.video_details?.video_file && (
              <div className="mb-4">
                <p className="font-semibold mb-1">Video:</p>
                <video
                  controls
                  className="w-auto h-[70vh] rounded"
                  src={`https://cipla-backend.virtualspheretechnologies.in/api/video/${selectedDoctor.video_details.video_file}`}
                />
              </div>
            )}

            {/* Fallback if no media */}
            {!selectedDoctor.video_details?.image_file &&
              !selectedDoctor.video_details?.video_file && (
                <p className="text-center text-gray-500">No media available.</p>
              )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDoctorsList;
