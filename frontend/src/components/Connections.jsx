import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import axios from "axios";

const Connections = () => {
  const dispatch = useDispatch();
  const connectionData = useSelector((store) => store.connection);

  const handleConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnection(res?.data?.data));
      console.log(res?.data?.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  useEffect(() => {
    handleConnections();
  }, []);

  if (!connectionData) return;

  if (connectionData.length === 0)
    return (
      <h1 className="text-center text-2xl text-secondary-content font-semibold">
        No Connection Found
      </h1>
    );

  return (
    <div className="">
      <div className="max-w-3xl mx-auto text-center mt-16">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2 pb-4 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            YOUR CONNECTIONS
          </span>
          <span class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></span>
        </h1>
      </div>

      {connectionData.map((connection) => (
        <div
          className="carousel carousel-center bg-gradient-to-r from-[#0f172a] to-[#334155] rounded-box space-x-4 p-4 gap-2 my-20 mx-10 max-w-md ml-28"
          key={connection?._id}
        >
          <div className="carousel-item h-[280px] w-[450px] overflow-hidden ">
            <img
              src={connection?.photoUrl}
              className=" h-44 w-44 ml-10 mt-10 mb-40"
            />
            <div className="flex flex-col">
              <div className="bg-gradient-to-tl from-purple-500 via-blue-500 to-zinc-400 bg-clip-text text-transparent text-2xl font-semibold text-justify mt-9 mx-5">{`${connection?.firstName} ${connection?.lastName}`}</div>
              <div className="my-4 mx-5 flex flex-col gap-2 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-orange-800 via-pink-100 to-slate-200 bg-clip-text text-transparent">
                <div>{`AGE- ${connection?.userAge}`}</div>
                <div>{` GENDER- ${connection?.gender}`}</div>
                <div>{`BIO- ${connection?.bio}`}</div>
                <div>{`SKILLS- ${connection?.skills}`}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Connections;
