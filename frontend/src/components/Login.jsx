import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const dispact = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/login",
        {
          emailId: emailId,
          password: password,
        },
        { withCredentials: true }
      );
      dispact(addUser(res.data));
      navigate("/");
    } catch (error) {
      console.log(error.message);
      return;
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Login
        </h2>
        <form className="space-y-6" onSubmit={handleLogin} method="POST">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-300 font-medium mb-2"
            >
              Email
            </label>
            <div className="flex items-center bg-gray-700 border border-gray-600 rounded focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75L12 13.5 2.25 6.75M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75M21.75 6.75L12 13.5 2.25 6.75"
                  />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                placeholder="Enter your email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 font-medium mb-2"
            >
              Password
            </label>
            <div className="flex items-center bg-gray-700 border border-gray-600 rounded focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V9A4.5 4.5 0 007.5 9v1.5M12 15v2.25M4.5 15v2.25M19.5 15v2.25"
                  />
                </svg>
              </span>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button className="w-full bg-info text-white py-2 rounded hover:bg-blue-700 transition font-semibold my-10">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
