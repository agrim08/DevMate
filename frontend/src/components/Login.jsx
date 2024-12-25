import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateInputs = () => {
    let validationError = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailId.trim()) {
      validationError += "Email is required.\n";
    } else if (!emailRegex.test(emailId)) {
      validationError += "Enter a valid email.\n";
    }

    if (!password.trim()) {
      validationError += "Password is required.\n";
    } else if (password.length < 6) {
      validationError += "Password must be at least 6 characters.\n";
    }

    setErrors(validationError.trim());
    return validationError === ""; // Return true if no errors
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${BASE_URL}/login`,
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      setIsLoading(false);
      setErrors("");
      navigate("/");
    } catch (error) {
      setErrors(error?.response?.data);
      console.error("Login failed:", error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${BASE_URL}/signup`,
        {
          emailId,
          password,
          firstName,
          lastName,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setIsLoading(false);
      setEmailId("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setErrors("");
      navigate("/profile");
    } catch (error) {
      setErrors(error?.response?.data);
      console.error("signup failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center my-3">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isLoginForm ? "Login" : "Sign Up"}
        </h2>
        <form
          className="space-y-6"
          onSubmit={isLoginForm ? handleLogin : handleSignUp}
          method="POST"
        >
          {!isLoginForm ? (
            <>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-gray-300 font-medium mb-2"
                >
                  First Name
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
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                    placeholder="Enter your email"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Last Name
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
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                    placeholder="Enter your email"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : null}

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
            {errors?.emailId && (
              <p className="text-red-500 text-sm mt-1">{errors?.emailId}</p>
            )}
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
            {errors?.password && (
              <p className="text-red-500 text-sm mt-1">{errors?.password}</p>
            )}
          </div>
          {errors && (
            <div
              className="toast transition-all duration-200 ease-in-out"
              style={{
                transform: errors ? "translateX(0)" : "translateX(100%)",
                opacity: errors ? 1 : 0,
              }}
            >
              <div className="alert alert-info bg-red-600">
                <span>{errors}</span>
              </div>
            </div>
          )}

          <button className="w-full bg-info text-white py-2 rounded hover:bg-blue-700 hover:scale-105 transition font-semibold my-10 bg-gradient-to-r from-purple-600 to-blue-600">
            {isLoading && !errors ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              <div>{isLoginForm ? "Login" : "SignUp"}</div>
            )}
          </button>
        </form>
        {isLoginForm ? (
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => setIsLoginForm(!isLoginForm)}
              className="text-blue-400 hover:underline"
            >
              Register
            </button>
          </p>
        ) : (
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => setIsLoginForm(!isLoginForm)}
              className="text-blue-400 hover:underline"
            >
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
