import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  FaUpload,
  FaSave,
  FaTimes,
  FaDownload,
  FaCamera,
} from "react-icons/fa";
import axios from "axios";
import { successToast, errorToast } from "../Utils/toastConfig";

const UploadVideoCard = ({ setShowVideoForm, doctorName, doctorId }) => {
  const token = useSelector((state) => state.auth.token);

  const [mode, setMode] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [facingMode, setFacingMode] = useState("user");

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordedChunks = useRef([]);
  const maxDurationRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith("video/") || file.type.startsWith("image/"))) {
      setVideoFile(file);
      setUploadedVideoUrl(null);
      setIsUploaded(false);
    } else {
      errorToast("Please select a valid image or video file");
      setVideoFile(null);
    }
  };

  const startCamera = async () => {
    try {
      const hasPermissions = await navigator.permissions?.query({ name: "camera" });
      if (hasPermissions?.state === "denied") {
        errorToast("Camera access is denied in browser settings");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 848 },
          aspectRatio: 9 / 16,
          facingMode,
        },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      errorToast("Camera error: " + err.message);
      console.error(err);
    }
  };

  const switchCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));

    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    await startCamera();
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const photoFile = new File([blob], `captured_photo_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setVideoFile(photoFile);
        setIsUploaded(false);
      }
    }, "image/jpeg");
  };

  const startVideoRecording = () => {
    const stream = videoRef.current?.srcObject;

    if (!stream) {
      errorToast("Camera not initialized.");
      return;
    }

    recordedChunks.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : "video/webm";

    try {
      if (!window.MediaRecorder) {
        errorToast("MediaRecorder is not supported in this browser.");
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: mimeType });
        const timestamp = Date.now();
        const fileName = `captured_${timestamp}.mp4`;

        const file = new File([blob], fileName, { type: "video/mp4" });

        setVideoFile(file);
        setIsCapturingVideo(false);
        setIsUploaded(false);
        console.log("🎥 Captured file ready to upload:", file.name, file.type);
      };

      mediaRecorder.onerror = (e) => {
        errorToast("Recording error: " + e.error?.message || e.message);
        console.error("MediaRecorder error:", e.error || e);
      };

      mediaRecorder.start();
      setIsCapturingVideo(true);

      maxDurationRef.current = setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          successToast("Recording stopped after max duration (30s)");
        }
      }, 40000);
    } catch (err) {
      errorToast("Failed to start recording: " + err.message);
      console.error("MediaRecorder error:", err);
    }
  };

  const stopVideoRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (maxDurationRef.current) {
      clearTimeout(maxDurationRef.current);
      maxDurationRef.current = null;
    }
  };

  const handleSubmit = async () => {
    const fileToUpload = videoFile;
    if (!fileToUpload) {
      errorToast("Please provide a video or photo");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("doctor_id", doctorId);

    const isImage = videoFile.type?.startsWith("image/");
    const fieldName = isImage ? "photo" : "video";
    formData.append(fieldName, videoFile);

    const endpoint = isImage
      ? "https://cipla-backend.virtualspheretechnologies.in/api/capture-image"
      : "https://cipla-backend.virtualspheretechnologies.in/api/merge-with-intro-outro";

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];

      if (response.status === 200 || response.status === 201) {
        if (contentType.includes("application/json")) {
          const text = await response.data.text();
          const json = JSON.parse(text);

          if (json.fileName) {
            const videoUrl = `https://cipla-backend.virtualspheretechnologies.in/api/video/${json.fileName}`;
            setUploadedVideoUrl(videoUrl);
            setIsUploaded(true);
            successToast(json.message || "Upload successful");
          } else {
            errorToast(json.message || "Server returned no video file");
          }
        } else if (contentType.includes("video")) {
          const videoBlob = new Blob([response.data], { type: "video/mp4" });
          const videoUrl = URL.createObjectURL(videoBlob);
          setUploadedVideoUrl(videoUrl);
          setIsUploaded(true);
          successToast("Upload successful");
        } else {
          errorToast("Unsupported file type received from server.");
        }
      } else {
        errorToast("Unexpected response status");
      }
    } catch (err) {
      errorToast("Upload failed");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadVideo = () => {
    if (!uploadedVideoUrl) return;
    const a = document.createElement("a");
    a.href = uploadedVideoUrl;
    a.download = `${doctorName.replace(/\s+/g, "_")}_merged_video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 my-8">
        <div className="bg-blue-600 text-white font-semibold text-lg px-4 py-2 rounded-t-md">
          <FaUpload className="inline-block mr-2" />
          Upload or Capture Media for {doctorName}
        </div>

        <div className="flex justify-between gap-3 mt-6 mb-4">
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 border rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
              mode === "upload"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-blue-300 text-blue-500 hover:bg-blue-100"
            }`}
          >
            <FaUpload />
            Upload from device
          </button>

          <button
            onClick={() => {
              setMode("photo");
              setVideoFile(null);
              startCamera();
            }}
            className={`flex-1 border rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
              mode === "photo"
                ? "border-green-600 text-green-600 bg-green-50"
                : "border-green-300 text-green-500 hover:bg-green-100"
            }`}
          >
            <FaCamera />
            Capture Photo
          </button>

          <button
            onClick={() => {
              setMode("video");
              setVideoFile(null);
              startCamera();
            }}
            className={`flex-1 border rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
              mode === "video"
                ? "border-purple-600 text-purple-600 bg-purple-50"
                : "border-purple-300 text-purple-500 hover:bg-purple-100"
            }`}
          >
            <FaCamera />
            Capture Video
          </button>
        </div>

        {(mode === "photo" || mode === "video") && (
          <div className="flex justify-end mb-2">
            <button
              onClick={switchCamera}
              className="bg-gray-200 text-gray-800 px-3 py-1 text-xs rounded-md hover:bg-gray-300"
            >
              🔄 Switch Camera
            </button>
          </div>
        )}

        <div className="mb-4">
          {mode === "upload" && (
            <div className="w-full">
              <label
                htmlFor="media-upload"
                className="w-full block border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
              >
                {videoFile ? videoFile.name : "📁 Upload media (image or video)"}
              </label>
              <input
                id="media-upload"
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {(mode === "photo" || mode === "video") && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-md border border-gray-300 mt-2"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex justify-center mt-2 gap-2">
                {mode === "photo" ? (
                  <button
                    onClick={capturePhoto}
                    className="bg-green-500 text-white px-4 py-1 rounded-md text-sm hover:bg-green-600"
                  >
                    Capture Photo
                  </button>
                ) : !isCapturingVideo ? (
                  <button
                    onClick={startVideoRecording}
                    className="bg-purple-500 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-600"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopVideoRecording}
                    className="bg-purple-600 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-700"
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {videoFile &&
          !uploadedVideoUrl &&
          (videoFile.type.startsWith("video/") ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <video
                controls
                src={URL.createObjectURL(videoFile)}
                className="w-full rounded-md border border-gray-300"
              />
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Captured Image:</p>
              <img
                src={URL.createObjectURL(videoFile)}
                alt="Captured"
                className="w-full rounded-md border border-gray-300"
              />
            </div>
          ))}

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => setShowVideoForm(false)}
            className="border border-gray-300 text-blue-600 px-4 py-2 text-sm rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>

          {!isUploaded ? (
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className={`px-4 py-2 text-sm rounded-md font-medium flex items-center gap-2 ${
                isUploading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaSave />
              {isUploading ? "Uploading..." : "Upload Media"}
            </button>
          ) : (
            <button
              onClick={downloadVideo}
              className="bg-green-600 text-white px-4 py-2 text-sm rounded-md flex items-center gap-2 hover:bg-green-700"
            >
              <FaDownload /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideoCard;
