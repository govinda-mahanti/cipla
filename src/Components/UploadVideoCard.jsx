import { useState, useRef, useEffect } from "react";
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
  const [forcePortrait, setForcePortrait] = useState(false);

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordedChunks = useRef([]);
  const maxDurationRef = useRef(null);

  useEffect(() => {
    const checkOrientation = () => {
      setForcePortrait(window.innerHeight < window.innerWidth);
    };
    window.addEventListener("resize", checkOrientation);
    checkOrientation();
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type.startsWith("video/") || file.type.startsWith("image/"))
    ) {
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
      const hasPermissions = await navigator.permissions?.query({
        name: "camera",
      });
      if (hasPermissions?.state === "denied") {
        errorToast("Camera access is denied in browser settings");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
  facingMode,
  aspectRatio: 9 / 16,
  resizeMode: "crop-and-scale", // optional, helps on Android
  height: { ideal: 848 },
  width: { ideal: 480 },
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
    if (stream) stream.getTracks().forEach((t) => t.stop());
    await startCamera();
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = height;
    canvas.height = width;

    ctx.save();
    ctx.translate(height / 2, width / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(video, -width / 2, -height / 2);
    ctx.restore();

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

  const cropVideoToPortrait = async (videoBlob) => {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoBlob);
  video.crossOrigin = "anonymous";
  video.muted = true;
  await video.play();

  const originalWidth = video.videoWidth;
  const originalHeight = video.videoHeight;

  const desiredAspectRatio = 9 / 16;
  const targetHeight = originalHeight;
  const targetWidth = Math.floor(targetHeight * desiredAspectRatio);
  const offsetX = (originalWidth - targetWidth) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  const stream = canvas.captureStream(30);
  const newChunks = [];

  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm",
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) newChunks.push(e.data);
  };

  recorder.onstop = () => {
    const croppedBlob = new Blob(newChunks, { type: "video/webm" });
    const croppedFile = new File(
      [croppedBlob],
      `portrait_${Date.now()}.webm`,
      { type: "video/webm" }
    );
    setVideoFile(croppedFile);
    setIsCapturingVideo(false);
    setIsUploaded(false);
  };

  recorder.start();

  const drawFrame = () => {
    if (video.paused || video.ended) {
      recorder.stop();
      return;
    }

    ctx.drawImage(
      video,
      offsetX,
      0,
      targetWidth,
      targetHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );
    requestAnimationFrame(drawFrame);
  };

  drawFrame();
};


  const startVideoRecording = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas || !video.srcObject) {
    return errorToast("Camera not initialized.");
  }

  const stream = video.srcObject;
  recordedChunks.current = [];

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : "video/webm";

  const videoTrack = stream.getVideoTracks()[0];
  const settings = videoTrack.getSettings();

  canvas.width = 480;
  canvas.height = 848;

  const ctx = canvas.getContext("2d");

  const drawRotatedFrame = () => {
    if (!video.paused && !video.ended) {
    ctx.save();
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Auto-detect if rotation is needed based on device orientation
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const rotateNeeded = isMobile;

if (rotateNeeded) {
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(
    video,
    -settings.height / 2,
    -settings.width / 2,
    settings.height,
    settings.width
  );
} else {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

ctx.restore();

      requestAnimationFrame(drawRotatedFrame);
    }
  };

  drawRotatedFrame();

  const canvasStream = canvas.captureStream(30);
  const audioTrack = stream.getAudioTracks()[0];
  if (audioTrack) canvasStream.addTrack(audioTrack);

  try {
    const mediaRecorder = new MediaRecorder(canvasStream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks.current, { type: mimeType });
      await cropVideoToPortrait(blob); // 🎯 auto-crop after stop
    };

    mediaRecorder.start();
    setIsCapturingVideo(true);

    maxDurationRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        successToast("Recording stopped after max duration (40s)");
      }
    }, 40000);
  } catch (err) {
    errorToast("Recording error: " + err.message);
  }
};


  const stopVideoRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (maxDurationRef.current) {
      clearTimeout(maxDurationRef.current);
      maxDurationRef.current = null;
    }
  };

  const handleSubmit = async () => {
    const fileToUpload = videoFile;
    if (!fileToUpload) return errorToast("Please provide a video or photo");

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

      const contentType = response.headers["content-type"];
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        if (json.fileName) {
          setUploadedVideoUrl(
            `https://cipla-backend.virtualspheretechnologies.in/api/video/${json.fileName}`
          );
          setIsUploaded(true);
          successToast(json.message || "Upload successful");

          setTimeout(() => {
            setShowVideoForm(false);
          }, 5000);
        } else {
          errorToast(json.message || "No file in response");
        }
      } else if (contentType.includes("video")) {
        const blob = new Blob([response.data], { type: "video/mp4" });
        setUploadedVideoUrl(URL.createObjectURL(blob));
        setIsUploaded(true);
        successToast("Upload successful");

        setTimeout(() => {
          setShowVideoForm(false);
        }, 3000);
      } else {
        errorToast("Unknown response format");
      }
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
              onClick={() => {
                setMode(m);
                setVideoFile(null);
                if (m !== "upload") startCamera();
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
              <FaCamera />
              {m === "upload" ? "Upload" : `Capture ${m}`}
            </button>
          ))}
        </div>

        {(mode === "photo" || mode === "video") && (
          <div className="flex justify-end mb-2">
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
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[480px] object-cover rounded-md border border-gray-300 mt-2"
                style={{
                  transform: "rotate(0deg)",
                  objectFit: "cover",
                  aspectRatio: "9 / 16",
                }}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex justify-center mt-2 gap-2">
                {mode === "photo" ? (
                  <button
                    onClick={capturePhoto}
                    className="bg-green-500 text-white px-4 py-1 rounded-md text-sm hover:bg-green-600"
                  >
                    Capture
                  </button>
                ) : !isCapturingVideo ? (
                  <button
                    onClick={startVideoRecording}
                    className="bg-purple-500 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-600"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={stopVideoRecording}
                    className="bg-purple-700 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-800"
                  >
                    Stop
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {videoFile && !uploadedVideoUrl && !isUploaded && (
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
              ✅ Upload successful! You can download video from dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideoCard;