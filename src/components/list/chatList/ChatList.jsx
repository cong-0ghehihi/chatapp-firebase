import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "../../addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        try {
          const items = res.data().chats;

          const promises = items.map(async (item) => {

            const userDocRef = doc(db, "users", item.receiverId);

            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              // Thay đổi: Thêm kiểm tra tồn tại tài liệu
              console.error("No such document!");
              return null;
            }

            const user = userDocSnap.data();

            return { ...item, user };
          });

          const chatData = await Promise.all(promises);
          setChats(
            chatData
              .filter((item) => item)
              .sort((a, b) => b.updatedAt - a.updatedAt)
          );
        } catch (error) {
          console.error("Error fetching chats: ", error);
        }
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen =true;

    const userChatRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="Search" />
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          className="add"
          src={addMode ? "/minus.png" : "/plus.png"}
          onClick={() => setAddMode((prev) => !prev)}
          alt={addMode ? "Close" : "Add"}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={chat.user.avatar || "/avatar.png"}
            alt={chat.user.username}
          />
          <div className="content">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
