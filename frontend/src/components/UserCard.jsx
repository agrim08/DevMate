import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  if (!user) return null;
  const { _id, firstName, lastName, photoUrl, userAge, gender, bio } = user;
  const dispatch = useDispatch();
  // const feed =

  const handleSendRequest = async (status, _id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/request/send/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(_id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    user && (
      <div className="card card-side bg-base-100 shadow-xl my-20">
        <figure className="bg-gray-300">
          <img
            className="h-60 w-40"
            src={
              photoUrl
                ? photoUrl
                : `https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp`
            }
            alt="profile pic"
          />
        </figure>
        <div className="card-body w-72 h-60 bg-gray-200 text-black rounded-r-xl">
          <h2 className="card-title">{`${firstName || ""} ${
            lastName || ""
          }`}</h2>

          {userAge && gender && (
            <p className="text-black">{userAge || "" + " " + gender || ""}</p>
          )}
          {bio && <p className="text-black">{bio || ""}</p>}

          <div className="card-actions flex justify-evenly">
            <button
              className="btn btn-error"
              onClick={() => handleSendRequest("ignored", _id)}
            >
              Ignore
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleSendRequest("interested", _id)}
            >
              Follow
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default UserCard;
