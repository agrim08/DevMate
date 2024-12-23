import { useState } from "react";
import UserCard from "./UserCard";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || ""); // Provide default value
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");

  const previewUser = {
    // Create the preview user object
    firstName: firstName,
    lastName: lastName,
    age: age,
    bio: bio,
    skills: skills,
    photoUrl: user?.photoUrl, // Important: keep photoUrl
    gender: user?.gender, // and gender
  };

  const dispatch = useDispatch();

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${BASE_URL}/profile/edit`,
        {
          firstName,
          lastName,
          age,
          bio,
          skills,
          photoUrl,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json", // Ensure proper content type is sent
            // "Access-Control-Allow-Methods": "POST,PUT,GET,PATCH,OPTIONS",
          },
        }
      );

      dispatch(addUser(res?.data?.data));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex justify-evenly items-center bg-gray-900 ">
      <div className="min-h-screen flex items-center justify-center my-10">
        <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Edit Profile
          </h2>
          <form className="space-y-6" onSubmit={updateProfile}>
            <div className="flex justify-between space-x-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-gray-300 font-medium mb-2"
                >
                  First Name
                </label>
                <div className="flex items-center bg-gray-700 border border-gray-600 rounded focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 text-gray-400"></span>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                    placeholder="First Name"
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
                  <span className="px-3 text-gray-400"></span>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between space-x-4">
              <div>
                <label
                  htmlFor="bio"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Bio
                </label>
                <div className="flex items-center focus-within:ring-2 focus-within:ring-blue-500">
                  <textarea
                    type="text"
                    id="bio"
                    name="bio"
                    className="textarea textarea-bordered w-full p-3 bg-gray-700 text-white placeholder-gray-400  rounded-md"
                    placeholder="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="skills"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Skills
                </label>
                <div className="flex items-center focus-within:ring-2 focus-within:ring-blue-500">
                  <textarea
                    type="text"
                    id="skills"
                    name="skills"
                    className="textarea textarea-bordered w-full p-3 bg-gray-700 text-white placeholder-gray-400  rounded-md"
                    placeholder="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="age"
                className="block text-gray-300 font-medium mb-2"
              >
                Age
              </label>
              <div className="flex items-center bg-gray-700 border border-gray-600 rounded focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-400"></span>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="photoUrl"
                className="block text-gray-300 font-medium mb-2"
              >
                Photo
              </label>
              <div className="flex items-center bg-gray-700 border border-gray-600 rounded focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-400"></span>
                <input
                  type="text"
                  id="photoUrl"
                  name="photoUrl"
                  className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none rounded-r"
                  placeholder="Enter your photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>
            </div>

            <button className="w-full bg-info text-white py-2 rounded hover:bg-blue-700 hover:scale-105 transition font-semibold my-10 bg-gradient-to-r from-purple-600 to-blue-600">
              Save
            </button>
          </form>
        </div>
      </div>
      <div>
        <p className="text-center text-4xl text-accent my-0 font-semibold">
          PREVIEW
        </p>
        <UserCard user={previewUser} />
      </div>
    </div>
  );
};

export default EditProfile;
