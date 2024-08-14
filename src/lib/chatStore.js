import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // Check if the current user is blocked by the other user
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    // Change: Updated condition to check if currentUser has blocked the user
    if (currentUser.blocked.includes(user.id)) {
      // Change here
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    }

    // Neither blocked
    set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },

  changeBlock: () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
}));
