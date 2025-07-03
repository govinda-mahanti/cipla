// Portrait-mode video recorder with camera switch and photo capture
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaUpload,
  FaSave,
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
  const [recording, setRecording] = useState(false);
  const [facingMode, setFacingMode] = useState("user");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error("Camera error:", err);
      errorToast("Camera access failed");
    }
  };

  const switchCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (mode === "photo" || mode === "video") startCamera();
  }, [mode, facingMode]);

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 720;
    canvas.height = 1280;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const photoFile = new File([blob], `photo_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setVideoFile(photoFile);
      setIsUploaded(false);
    }, "image/jpeg");
  };

  const startRecording = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 480;
    canvas.height = 848;

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      const aspectRatio = canvas.width / canvas.height;

      let sx = 0, sy = 0, sWidth = vWidth, sHeight = vHeight;
      if (vWidth / vHeight > aspectRatio) {
        sWidth = vHeight * aspectRatio;
        sx = (vWidth - sWidth) / 2;
      } else {
        sHeight = vWidth / aspectRatio;
        sy = (vHeight - sHeight) / 2;
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const canvasStream = canvas.captureStream(30);
    const audioTrack = streamRef.current.getAudioTracks()[0];
    canvasStream.addTrack(audioTrack);

    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(animationFrameRef.current);
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const file = new File([blob], `portrait_${Date.now()}.webm`, {
        type: "video/webm",
      });
      setVideoFile(file);
      setIsUploaded(false);
      setRecording(false);
    };

    recorder.start();
    setRecording(true);

    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
        successToast("Recording auto-stopped after 40s");
      }
    }, 40000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const handleSubmit = async () => {
    if (!videoFile) return errorToast("No file to upload");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("doctor_id", doctorId);
    const isImage = videoFile.type.startsWith("image/");
    formData.append(isImage ? "photo" : "video", videoFile);

    const endpoint = isImage
      ? "https://cipla-backend.virtualspheretechnologies.in/api/capture-image"
      : "https://cipla-backend.virtualspheretechnologies.in/api/merge-with-intro-outro";

    try {
      const res = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      if (res.headers["content-type"].includes("video")) {
        const blob = new Blob([res.data], { type: "video/mp4" });
        setUploadedVideoUrl(URL.createObjectURL(blob));
        setIsUploaded(true);
        successToast("Upload successful");
        setTimeout(() => setShowVideoForm(false), 3000);
      } else {
        errorToast("Unexpected response from server");
      }
    } catch (e) {
      errorToast("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 my-8">
        <div className="bg-[#6A1916] text-white font-semibold text-lg px-4 py-2 rounded-t-md">
          <FaUpload className="inline-block mr-2" /> Upload or Capture Media for {doctorName}
        </div>

        <div className="flex justify-between gap-3 mt-6 mb-4">
          {["upload", "photo", "video"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setVideoFile(null);
              }}
              className={`flex-1 border rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
                mode === m
                  ? m === "upload"
                    ? "border-[#6A1916] text-[#6A1916] bg-[#f8e8e5]"
                    : m === "photo"
                    ? "border-green-600 text-green-600 bg-green-50"
                    : "border-purple-600 text-purple-600 bg-purple-50"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaCamera /> {m === "upload" ? "Upload" : `Capture ${m}`}
            </button>
          ))}
        </div>

        {(mode === "photo" || mode === "video") && (
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-600">Camera: {facingMode}</span>
            <button
              onClick={switchCamera}
              className="bg-[#f5eaea] text-[#6A1916] px-3 py-1 text-xs rounded-md hover:bg-[#ecd7d7]"
            >
              🔄 Switch Camera
            </button>
          </div>
        )}

        {(mode === "photo" || mode === "video") && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[480px] object-cover rounded-md border border-gray-300"
              style={{ display: recording ? "none" : "block" }}
            />
            <canvas ref={canvasRef} className="w-full h-[480px] rounded-md border border-gray-300" />
            <div className="flex justify-center mt-2 gap-2">
              {mode === "photo" ? (
                <button
                  onClick={capturePhoto}
                  className="bg-green-500 text-white px-4 py-1 rounded-md text-sm hover:bg-green-600"
                >
                  Capture
                </button>
              ) : !recording ? (
                <button
                  onClick={startRecording}
                  className="bg-purple-500 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-600"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-purple-700 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-800"
                >
                  Stop
                </button>
              )}
            </div>
          </>
        )}

        {videoFile && !uploadedVideoUrl && !isUploaded && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            {videoFile.type.startsWith("video/") ? (
              <video controls src={URL.createObjectURL(videoFile)} className="w-full rounded-md border border-gray-300" />
            ) : (
              <img src={URL.createObjectURL(videoFile)} alt="Captured" className="w-full rounded-md border border-gray-300" />
            )}
          </div>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => setShowVideoForm(false)}
            disabled={isUploaded}
            className="border border-gray-300 text-[#6A1916] px-4 py-2 text-sm rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          {!isUploaded && (
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className={`px-4 py-2 text-sm rounded-md font-medium flex items-center gap-2 ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#6A1916] hover:bg-[#8B3E2D] text-white"
              }`}
            >
              <FaSave /> {isUploading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideoCard;
