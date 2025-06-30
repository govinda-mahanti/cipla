import { useState } from "react";
import { useSelector } from "react-redux";
import { FaUserPlus, FaSave, FaTimes, FaDownload } from "react-icons/fa";
import axios from "axios";
import { successToast, errorToast } from "../Utils/toastConfig";
import { Listbox } from "@headlessui/react";

const specializations = [
  "Cardiologist", "Dermatologist", "Endocrinologist", "Gastroenterologist",
  "Hematologist", "Nephrologist", "Neurologist", "Oncologist", "Ophthalmologist",
  "Orthopedist", "Pediatrician", "Psychiatrist", "Pulmonologist", "Radiologist",
  "Rheumatologist", "Urologist", "General Physician", "Surgeon", "Others",
];

const AddDoctorCard = ({ setShowForm, setShowVideoForm, setDoctorName, setDoctoeId }) => {
  const token = useSelector((state) => state.auth.token);
  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "",
    customSpecialization: "",
    city: "",
    contact: "",
  });

  const [downloadImageUrl, setDownloadImageUrl] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getFinalSpecialization = () => {
    return formData.specialization === "Others"
      ? formData.customSpecialization
      : formData.specialization;
  };

  const validateForm = () => {
    const finalSpecialization = getFinalSpecialization();
    const { doctorName, city, contact } = formData;
    if (!doctorName || !finalSpecialization || !city || !contact) {
      errorToast("All required fields must be filled!");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      doctorName: formData.doctorName,
      specialization: getFinalSpecialization(),
      city: formData.city,
      contact: formData.contact,
    };

    try {
      const response = await axios.post(
        "https://cipla-backend.virtualspheretechnologies.in/api/add-doctor",
        payload,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const { doctorId, image_file } = response.data;

        successToast("Doctor added successfully");
        setShowForm(false);
        setShowVideoForm(true);
        setDoctorName(formData.doctorName);
        setDoctoeId(doctorId);

        if (image_file) {
          setDownloadImageUrl(
            `https://cipla-backend.virtualspheretechnologies.in/api/image/${image_file}`
          );
        }
      }
    } catch (err) {
      console.error(err);
      errorToast("Failed to add doctor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg p-7">
        <div className="rounded-md border border-gray-300">
          {/* Header */}
          <div className="bg-blue-600 text-white font-medium text-base px-4 py-2 rounded-t-md flex items-center gap-2">
            <FaUserPlus />
            Doctor Information
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 text-black">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Enter full name e.g., Dr. John Smith"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium mb-1">Specialization *</label>
                <Listbox
                  value={formData.specialization}
                  onChange={(val) =>
                    setFormData({ ...formData, specialization: val, customSpecialization: "" })
                  }
                >
                  <div className="relative">
                    <Listbox.Button className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm text-left bg-white">
                      {formData.specialization || "Select Specialization"}
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      {specializations.map((specialty, idx) => (
                        <Listbox.Option
                          key={idx}
                          value={specialty}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${active ? "bg-blue-100" : ""}`
                          }
                        >
                          {specialty}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>

                {formData.specialization === "Others" && (
                  <input
                    type="text"
                    name="customSpecialization"
                    value={formData.customSpecialization}
                    onChange={handleChange}
                    placeholder="Enter custom specialization"
                    className="mt-2 w-full border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                )}
              </div>
            </div>

            {/* Contact & City */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact *</label>
                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>

            {/* Download Button and Preview */}
            {downloadImageUrl && (
              <div className="mt-4 border-t pt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Image:</h4>
                <img
                  src={downloadImageUrl}
                  alt="Doctor"
                  className="max-w-sm w-full rounded border"
                />
                <a
                  href={downloadImageUrl}
                  download="doctor_image.jpg"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                >
                  <FaDownload />
                  Download Image
                </a>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="border text-blue-600 border-gray-300 rounded-md px-4 py-2 text-sm flex items-center gap-1 hover:bg-gray-100"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm flex items-center gap-1 hover:bg-blue-700"
              >
                <FaSave /> Save Doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorCard;
