import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    console.log(e);
    if (e.target.files[0]) {
      console.log(e.target.file);
      console.log(e.target.files);
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        console.log(id);

        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          console.log(userChatsData);

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updateAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
      setText("");
    } catch (error) {
      console.log(error);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            {/* {console.log(message.createAt?.toDate?.())} */}
            <div className="content">
              {message.img && (
                <img src={message.img} alt="" style={{ objectFit: "cover" }} />
              )}
              <p>{message.text}</p>
              {/* <span>{format(message.createdAt.toDate?.())}</span> */}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img
                src={img.url}
                alt=""
                style={{ width: "500px", height: "400px", objectFit: "cover" }}
              />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        {isCurrentUserBlocked || isReceiverBlocked ? (
          <p className="blocked-message">
            {isCurrentUserBlocked
              ? "You are blocked from sending messages."
              : "You have blocked this user."}
          </p>
        ) : (
          <>
            <div className="icons">
              <label htmlFor="file">
                <img src="./img.png" alt="" />
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleImg}
                disabled={isCurrentUserBlocked || isReceiverBlocked}
              />
              <img src="./camera.png" alt="" />
              <img src="./mic.png" alt="" />
            </div>
            <input
              type="text"
              placeholder="Aa"
              value={text}
              ref={inputRef}
              onChange={(e) => setText(e.target.value)}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
            <div className="emoji">
              <img
                src="./emoji.png"
                alt=""
                onClick={() => setOpen((prev) => !prev)}
                disabled={isCurrentUserBlocked || isReceiverBlocked}
              />
              <div className="picker">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
              </div>
            </div>
            <button
              className="sendButton"
              onClick={handleSend}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
