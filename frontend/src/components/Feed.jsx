import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(`${BASE_URL}/feed`, {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (error) {
      console.log(error.message);
      return;
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (!feed) return;

  return (
    feed && (
      <div className="flex justify-center items-center bg-base-100">
        <UserCard user={feed[0]} />
      </div>
    )
  );
};

export default Feed;
