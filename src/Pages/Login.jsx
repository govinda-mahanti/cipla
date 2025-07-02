import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { FaUser, FaLock } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { HiEyeOff, HiEye } from "react-icons/hi";
import axios from "axios";
import { successToast, errorToast } from "../Utils/toastConfig";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";
import logo3 from "../assets/logo3.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://cipla-backend.virtualspheretechnologies.in/auth/login",
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
        const { token, userData } = response.data;
        dispatch(setCredentials({ user: userData, token }));
        successToast("Login successful");
        navigate("/dashboard", { state: { showAddDoctor: true } });
      }
    } catch (err) {
      console.error("Login failed", err);
      errorToast("Invalid username or password");
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-[url('/grid.svg')] bg-cover bg-no-repeat">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-[400px] relative">
        <div className="text-center mb-8">
          {/* <h1 className="text-3xl font-extrabold text-[#6A1916]">CIPLA</h1> */}
          <div className="flex justify-between items-center mb-4 absolute top-0 left-4 right-0">
            <img
              src={logo3}
              alt="Asia Book of Records"
              className="w-[70px] h-auto object-contain"
            />
            <img
              src={logo1}
              alt="Defeat Hepatitis"
              className="w-[150px] h-auto object-contain"
            />
          </div>

          <div className="flex justify-center h-[120px]">
            <img
              src={logo2}
              alt="Tenvir AF"
              className="w-[160px] h-auto object-contain"
            />
          </div>

        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-sm text-gray-500">Access your dashboard</p>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4 flex items-center space-x-2">
            <AiOutlineInfoCircle /> <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Username
            </label>
            <div className="flex items-center bg-[#6A1916] text-white rounded-md px-3 py-2 space-x-2">
              <FaUser />
              <input
                type="text"
                value={username}
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent outline-none w-full placeholder-white text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <div className="flex items-center bg-[#6A1916] text-white rounded-md px-3 py-2 space-x-2">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full placeholder-white text-white"
              />
              {showPassword ? (
                <HiEyeOff
                  className="cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <HiEye
                  className="cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-[#6A1916] py-2 rounded-md font-semibold flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
