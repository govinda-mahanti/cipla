import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaVideo, FaEye, FaSearch, FaDownload } from "react-icons/fa";
import { Listbox } from "@headlessui/react";

const specializations = [
  "All Specializations",
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Hematologist",
  "Nephrologist",
  "Neurologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Rheumatologist",
  "Urologist",
  "General Physician",
  "Surgeon",
  "Others",
];

const AllDoctors = () => {
  const token = useSelector((state) => state.auth.token);
  const [doctors, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All Specializations");
  const [city, setCity] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "https://cipla-backend.virtualspheretechnologies.in/api/getAllDoctors",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: ` ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        const list = data.data || [];
        setDoctors(list);
        setFilteredDoctors(list); // Initialize with full list
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
  }, [token]);

  const handleSearch = () => {
    const filtered = doctors.filter((doc) => {
      const matchesName = doc.doctor_fullName
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesSpec =
        selectedSpec === "All Specializations" ||
        doc.specialization === selectedSpec;
      const matchesCity = doc.city?.toLowerCase().includes(city.toLowerCase());

      return matchesName && matchesSpec && matchesCity;
    });

    setFilteredDoctors(filtered);
    setCurrentPage(1); // Reset pagination
  };

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExport = () => {
    const header = [
      "Name",
      "Specialization",
      "City",
      "Contact",
      "Added Date",
      "Videos",
    ];
    const rows = doctors.map((doc) => [
      doc.full_name,
      doc.specialization,
      doc.city || "",
      doc.contact || "",
      new Date(doc.created_at).toLocaleDateString(),
      doc.videos?.length || 0,
    ]);
    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "doctors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const contentType = response.headers.get("Content-Type");
      const blobUrl = window.URL.createObjectURL(
        new Blob([blob], { type: contentType })
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file.");
    }
  };

  return (
    <div className="w-full px-4 md:px-12 lg:px-24 py-6 bg-white space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-gray-600 text-lg font-medium">
          Manage your doctor contacts and engagement history
        </h2>
      </div>
      <div className="bg-[#6A1916] text-white p-4 md:p-6 rounded-lg w-full">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="bg-[#4B0F0D] text-white placeholder-gray-300 px-4 py-2 rounded w-full sm:w-64"
          />

          <div className="relative w-full sm:w-64">
            <Listbox value={selectedSpec} onChange={setSelectedSpec}>
              <Listbox.Button className="w-full border border-white bg-[#4B0F0D] text-white px-4 py-2 rounded text-left">
                {selectedSpec || "Select Specialization"}
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded bg-white text-black py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
                {specializations.map((spec, idx) => (
                  <Listbox.Option
                    key={idx}
                    value={spec}
                    className={({ active }) =>
                      `cursor-pointer select-none px-4 py-2 ${
                        active ? "bg-[#f3e7e6]" : ""
                      }`
                    }
                  >
                    {spec}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>

          {selectedSpec === "Other" && (
            <input
              type="text"
              placeholder="Custom specialization"
              value={customSpec}
              onChange={(e) => setCustomSpec(e.target.value)}
              className="bg-[#4B0F0D] text-white placeholder-gray-300 px-4 py-2 rounded w-full sm:w-64"
            />
          )}

          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-[#4B0F0D] text-white placeholder-gray-300 px-4 py-2 rounded w-full sm:w-48"
          />

          <button
            onClick={handleSearch}
            className="p-2 border border-white rounded self-start hover:bg-white hover:text-[#6A1916]"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-[#6A1916]/30 rounded w-full">
        <span className="font-semibold text-[#6A1916]">
          👩‍⚕️ {doctors.length} Doctors Found
        </span>
        <button
          onClick={handleExport}
          className="bg-[#6A1916] text-white px-3 py-1 rounded hover:bg-[#8B3E2D] text-sm"
        >
          ⬇ Export Excel
        </button>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded shadow">
        <table className="min-w-[1000px] text-sm text-left w-full">
          <thead className="bg-[#6A1916] text-white">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Specialization</th>
              <th className="p-2">City</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Added Date</th>
              <th className="p-2">Video</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDoctors.map((doc, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#6A1916] text-white flex items-center justify-center rounded-full uppercase">
                    {doc.doctor_fullName?.[0] || "?"}
                  </div>
                  <span>{doc.doctor_fullName || "Unnamed"}</span>
                </td>
                <td className="p-2">
                  <span className="bg-[#6A1916] text-white text-xs px-2 py-1 rounded">
                    {doc.specialization || "N/A"}
                  </span>
                </td>
                <td className="p-2">{doc.city || "-"}</td>
                <td className="p-2">{doc.contact || "-"}</td>
                <td className="p-2">
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-2">{doc.video_file ? 1 : 0}</td>
                <td className="p-2 flex items-center gap-2">
                  <FaEye
                    className="text-cyan-500 cursor-pointer w-5 h-5"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setShowModal(true);
                    }}
                  />

                  {doc.image_file && (
                    <button
                      onClick={() =>
                        handleDownload(
                          `https://cipla-backend.virtualspheretechnologies.in/api/image/${doc.image_file}`,
                          `doctor_${doc.doctor_fullName || "image"}.jpg`
                        )
                      }
                      className="text-green-600 hover:text-green-800"
                      title="Download Image"
                    >
                      <FaDownload />
                    </button>
                  )}

                  {doc.video_file && (
                    <button
                      onClick={() =>
                        handleDownload(
                          `https://cipla-backend.virtualspheretechnologies.in/api/video/${doc.video_file}`,
                          `doctor_${doc.doctor_fullName || "video"}.mp4`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800"
                      title="Download Video"
                    >
                      <FaDownload />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center p-4">
        <div className="w-full max-w-full overflow-x-auto">
          <div className="inline-flex whitespace-nowrap border rounded overflow-hidden shadow-sm">
            <button
              onClick={() => paginate(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium border-r flex-shrink-0 ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "text-[#6A1916] hover:bg-gray-100"
              }`}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => paginate(num)}
                className={`px-4 py-2 text-sm font-medium border-r flex-shrink-0 ${
                  num === currentPage
                    ? "bg-[#6A1916] text-white"
                    : "text-[#6A1916] hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm font-medium flex-shrink-0 ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "text-[#6A1916] hover:bg-gray-100"
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full space-y-4">
            <h3 className="text-lg font-semibold mb-2">
              Files for {selectedDoctor.doctor_fullName}
            </h3>

            {selectedDoctor.image_file && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Image</h4>
                <img
                  src={`https://cipla-backend.virtualspheretechnologies.in/api/image/${selectedDoctor.image_file}`}
                  alt="Doctor"
                  className="w-full max-w-sm object-cover rounded border"
                />
              </div>
            )}

            {selectedDoctor.video_file && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1 mt-4">Video</h4>
                <video
                  controls
                  src={`https://cipla-backend.virtualspheretechnologies.in/api/video/${selectedDoctor.video_file}`}
                  className="w-full max-w-sm object-cover rounded border"
                />
              </div>
            )}

            <div className="text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-[#6A1916] text-white px-4 py-2 rounded hover:bg-[#8B3E2D]"
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

export default AllDoctors;
