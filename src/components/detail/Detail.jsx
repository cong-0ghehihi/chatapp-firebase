import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import React from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user || isCurrentUserBlocked) return;

    const userDocRef = doc(db, "users", currentUser.id);

     try {
       await updateDoc(userDocRef, {
         blocked: isReceiverBlocked
           ? arrayRemove(user.id)
           : arrayUnion(user.id),
       });

       changeBlock(); 
     } catch (error) {
       console.log(error);
     }
  };
  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username} </h2>
        <p>Đang hoạt động</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "UnBlock User"
            : "Block User"}
        </button>
      
      </div>
    </div>
  );
};

export default Detail;
