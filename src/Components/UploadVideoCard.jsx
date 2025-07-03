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

  const [mode, setMode] = useState("upload"); // upload | photo | video
  const [videoFile, setVideoFile] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [facingMode, setFacingMode] = useState("user");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    if (mode === "video" || mode === "photo") {
      startCamera();
    } else {
      stopStream();
    }
    return stopStream;
  }, [mode, facingMode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode,
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      errorToast("Camera error: " + err.message);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = 720;
    canvas.height = 1280;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const videoAspect = videoWidth / videoHeight;
    const canvasAspect = canvas.width / canvas.height;

    let sx = 0, sy = 0, sWidth = videoWidth, sHeight = videoHeight;

    if (videoAspect > canvasAspect) {
      const newWidth = sHeight * canvasAspect;
      sx = (sWidth - newWidth) / 2;
      sWidth = newWidth;
    } else {
      const newHeight = sWidth / canvasAspect;
      sy = (sHeight - newHeight) / 2;
      sHeight = newHeight;
    }

    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `captured_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setVideoFile(file);
      setIsUploaded(false);
    }, "image/jpeg");
  };

  const startRecording = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 1280;

    const drawFrame = () => {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const videoAspect = videoWidth / videoHeight;
      const canvasAspect = canvas.width / canvas.height;

      let sx = 0, sy = 0, sWidth = videoWidth, sHeight = videoHeight;

      if (videoAspect > canvasAspect) {
        const newWidth = sHeight * canvasAspect;
        sx = (sWidth - newWidth) / 2;
        sWidth = newWidth;
      } else {
        const newHeight = sWidth / canvasAspect;
        sy = (sHeight - newHeight) / 2;
        sHeight = newHeight;
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const canvasStream = canvas.captureStream(30);
    const audioTrack = streamRef.current.getAudioTracks()[0];
    canvasStream.addTrack(audioTrack);

    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const file = new File([blob], `recorded_${Date.now()}.webm`, {
        type: "video/webm",
      });
      setVideoFile(file);
      setRecording(false);
    };

    recorder.start();
    setRecording(true);

    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
        successToast("Recording stopped after max duration (40s)");
      }
    }, 40000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith("video/") || file.type.startsWith("image/"))) {
      setVideoFile(file);
      setIsUploaded(false);
    } else {
      errorToast("Please select a valid image or video file");
    }
  };

  const handleSubmit = async () => {
    if (!videoFile) return errorToast("Please provide a video or photo");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("doctor_id", doctorId);
    const isImage = videoFile.type.startsWith("image/");
    formData.append(isImage ? "photo" : "video", videoFile);

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

      const blob = new Blob([response.data]);
      setUploadedVideoUrl(URL.createObjectURL(blob));
      setIsUploaded(true);
      successToast("Upload successful");
      setTimeout(() => setShowVideoForm(false), 3000);
    } catch (err) {
      errorToast("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 my-8">
        <div className="bg-[#6A1916] text-white font-semibold text-lg px-4 py-2 rounded-t-md">
          <FaUpload className="inline-block mr-2" />
          Upload or Capture Media for {doctorName}
        </div>

        <div className="flex justify-between gap-3 mt-6 mb-4">
          {["upload", "photo", "video"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 border rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
                mode === m
                  ? "border-[#6A1916] text-[#6A1916] bg-[#f8e8e5]"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaCamera />
              {m === "upload" ? "Upload" : `Capture ${m}`}
            </button>
          ))}
        </div>

        {(mode === "photo" || mode === "video") && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 ml-1">
              {facingMode === "user" ? "Front Camera" : "Back Camera"}
            </span>
            <button
              onClick={switchCamera}
              className="bg-[#f5eaea] text-[#6A1916] px-3 py-1 text-xs rounded-md hover:bg-[#ecd7d7]"
            >
              🔄 Switch Camera
            </button>
          </div>
        )}

        <div className="mb-4">
          {mode === "upload" && (
            <label
              htmlFor="media-upload"
              className="block border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
            >
              {videoFile ? videoFile.name : "📁 Upload media (image or video)"}
              <input
                id="media-upload"
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {(mode === "photo" || mode === "video") && (
            <>
              <video ref={videoRef} autoPlay muted playsInline className="hidden" />
              <canvas
                ref={canvasRef}
                className="w-full max-w-[360px] h-[640px] mx-auto rounded-md border border-gray-300 mt-2"
              />
              <div className="flex justify-center mt-2 gap-2">
                {mode === "photo" ? (
                  <button
                    onClick={capturePhoto}
                    className="bg-green-500 text-white px-4 py-1 rounded-md text-sm hover:bg-green-600"
                  >
                    Capture Photo
                  </button>
                ) : !recording ? (
                  <button
                    onClick={startRecording}
                    className="bg-purple-500 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-600"
                  >
                    Start Recording
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
        </div>

        {videoFile && !uploadedVideoUrl && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            {videoFile.type.startsWith("video/") ? (
              <video
                controls
                src={URL.createObjectURL(videoFile)}
                className="w-full rounded-md border border-gray-300"
              />
            ) : (
              <img
                src={URL.createObjectURL(videoFile)}
                alt="Captured"
                className="w-full rounded-md border border-gray-300"
              />
            )}
          </div>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => setShowVideoForm(false)}
            disabled={isUploaded}
            className={`border border-gray-300 text-[#6A1916] px-4 py-2 text-sm rounded-md ${
              isUploaded ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          {!isUploaded ? (
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
          ) : (
            <p className="text-sm text-green-700 font-medium mt-2">
              ✅ Upload successful!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideoCard;