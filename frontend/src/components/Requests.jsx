import React, { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequest } from "../utils/requestSlice";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.request);

  const handleRequest = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/pending`, {
        withCredentials: true,
      });
      dispatch(addRequest(res?.data?.data));
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    handleRequest();
  }, []);

  if (!requests) return <div>Loading...</div>;

  if (requests.length === 0) return <div>No Connection Requests Found</div>;

  const handleAccept = (requestId) => {
    console.log("Accepted request with ID:", requestId);
    // Add accept request logic here
  };

  const handleReject = (requestId) => {
    console.log("Rejected request with ID:", requestId);
    // Add reject request logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0f172a]  to-[#334155] py-10 px-5">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Connection Requests
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => {
          const { firstName, lastName, photoUrl, bio, skills } =
            request?.fromUserId;

          return (
            <div
              key={request?._id}
              className="bg-gray-200 rounded-xl shadow-lg p-5 flex flex-col items-center"
            >
              <img
                src={
                  photoUrl ||
                  `https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp`
                }
                alt="profile"
                className="w-24 h-24 rounded-full border-4 border-purple-500 mb-4"
              />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{`${firstName} ${lastName}`}</h2>
              {bio && <p className="text-gray-600 text-center mb-3">{bio}</p>}
              {skills && (
                <p className="text-gray-500 text-sm text-center mb-3">
                  Skills: {skills.join(", ")}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  onClick={() => handleAccept(request?._id)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  onClick={() => handleReject(request?._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
