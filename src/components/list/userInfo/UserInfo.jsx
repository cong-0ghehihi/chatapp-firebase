import React, { useState } from "react";
import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";

const UserInfo = () => {
  const { currentUser } = useUserStore();
    const [showLogout, setShowLogout] = useState(false);

    const handleIconClick = () => {
      setShowLogout(!showLogout);
    };
  return (
    <>
      <div className="userInfo">
        <div className="user">
          <img
            src={currentUser.avatar || "./avatar.png"}
            alt=""
            onClick={handleIconClick}
          />
          <h2>{currentUser.username}</h2>
          {showLogout && (
            <div className="logout">
              <button onClick={() => auth.signOut()}>Logout</button>
            </div>
          )}
        </div>

        <div className="icons">
          <img src="./more.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./edit.png" alt="" />
        </div>
      </div>
    </>
  );
};

export default UserInfo;
