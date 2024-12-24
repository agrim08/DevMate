import { useState } from "react";
import UserCard from "./UserCard";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [userAge, setUserAge] = useState(user?.userAge || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const previewUser = {
    firstName,
    lastName,
    userAge,
    bio,
    skills,
    photoUrl,
    gender,
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setShowToast(false); // Reset toast visibility

      const res = await axios.put(
        `${BASE_URL}/profile/edit`,
        { userAge, bio, skills, photoUrl },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch(addUser(res?.data?.data));

      // Show success toast
      setToastMessage("Profile saved successfully!");
      setToastType("success");
      setShowToast(true);
      setIsLoading(false);
    } catch (error) {
      // Show error toast
      setToastMessage(error.response?.data || "Failed to update profile!");
      setToastType("error");
      setShowToast(true);
    } finally {
      setTimeout(() => setShowToast(false), 3000);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-evenly items-center bg-gray-900">
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
                <input
                  type="text"
                  id="firstName"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bio"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="skills"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Skills
                </label>
                <textarea
                  id="skills"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="age"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Age"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Gender
                </label>
                <input
                  type="text"
                  id="gender"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="photoUrl"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Photo URL
                </label>
                <input
                  type="text"
                  id="photoUrl"
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>
            </div>
            {showToast && (
              <div
                className={`fixed top-5 right-5 p-4 rounded shadow-lg ${
                  toastType === "success" ? "bg-green-500" : "bg-red-500"
                } text-white`}
              >
                {toastMessage}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
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
