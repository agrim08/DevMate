const UserCard = ({ user }) => {
  const { firstName, lastName, photoUrl, age, gender, bio } = user;

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
          <h2 className="card-title">{`${firstName} ${lastName}`}</h2>

          {age && gender && <p className="text-black">{age + " " + gender}</p>}
          {bio && <p className="text-black">{bio}</p>}

          <div className="card-actions flex justify-evenly">
            <button className="btn btn-error">Ignore</button>
            <button className="btn btn-success">Follow</button>
          </div>
        </div>
      </div>
    )
  );
};

export default UserCard;
