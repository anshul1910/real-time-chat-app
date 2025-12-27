<script setup>
import { ref } from "vue";
import axios from "axios";
import Navbar from "~/components/Navbar.vue";
import ChatList from "~/components/ChatList.vue";
import { useCookie } from "#app";
import { jwtDecode } from "jwt-decode";

const { $socket } = useNuxtApp();

let sender_id = "";
let receiver_id = "";
let currentUserEmail = "";
const allUsers = ref([]);

const token = useCookie("uid");
if (token.value) {
  const decoded_data = jwtDecode(token.value);
  currentUserEmail = decoded_data.email;
  sender_id = decoded_data._id;
}

function updateLastMessage(userId, message) {
  const user = allUsers.value.find((u) => u._id === userId);
  if (user) {
    user.lastMessage = message;
  }
}

onMounted(async () => {
  $socket.connect();

  $socket.emit("register-user", sender_id);

  $socket.on(
    "receive-private-message",
    ({ message, sender_id, receiver_id }) => {
      chats.value.push({
        sender_id: sender_id,
        receiver_id: receiver_id,
        message,
      });
      updateLastMessage(sender_id, message);
    }
  );

  try {
    const [usersResponse, chatsResponse] = await Promise.all([
      axios.get("http://localhost:8000/api/getallusers"),
      axios.get("http://localhost:8000/api/getchats"),
    ]);

    const usersData = usersResponse.data.filter(
      (user) => user.email !== currentUserEmail
    );

    const allChats = chatsResponse.data;

    allUsers.value = usersData.map((user) => {
      const relevantChats = allChats.filter(
        (chat) =>
          (chat.sender_id === sender_id && chat.receiver_id === user._id) ||
          (chat.sender_id === user._id && chat.receiver_id === sender_id)
      );

      const lastMessage = relevantChats.at(-1)?.message || "No messages yet";

      return {
        ...user,
        lastMessage,
      };
    });
  } catch (error) {
    console.error("Error fetching users or chats:", error);
  }
});

const selectedChat = ref(null);
const newMessage = ref("");
let chats = ref([]);

async function selectChat(chat) {
  selectedChat.value = chat;
  receiver_id = chat._id;
  newMessage.value = "";

  const res = await axios.get("http://localhost:8000/api/getchats");
  chats.value = res.data.filter(
    (chat) =>
      (chat.receiver_id === receiver_id && chat.sender_id === sender_id) ||
      (chat.sender_id === receiver_id && chat.receiver_id === sender_id)
  );
}

async function sendMessage() {
  if (selectedChat.value && newMessage.value.trim()) {
    $socket.emit("send-message", {
      sender_id: sender_id,
      receiver_id: receiver_id,
      message: newMessage.value,
    });
    chats.value.push({
      sender_id: sender_id,
      receiver_id: receiver_id,
      message: newMessage.value,
    });

    updateLastMessage(receiver_id, newMessage.value);

    newMessage.value = "";
  }
}
</script>

<template>
  <div class="chat-app">
    <!-- Navbar -->
    <Navbar />

    <!-- Main container -->
    <div class="main">
      <!-- Chat list -->
      <ChatList :users="allUsers" @select="selectChat" />

      <!-- Chat box -->
      <section class="chat-box">
        <div class="chat-header">
          <h2>{{ selectedChat?.userName || "Select a chat" }}</h2>
        </div>

        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-if="selectedChat"
            v-for="(chat, i) in chats"
            :key="i"
            :class="[
              'message',
              chat.sender_id === receiver_id ? 'received' : 'sent',
            ]"
          >
            {{ chat.message }}
          </div>
          <div v-else class="no-chat">Please select a chat</div>
        </div>

        <div class="chat-input">
          <input
            type="text"
            v-model="newMessage"
            placeholder="Type a message"
            @keyup.enter="sendMessage"
          />
          <button
            @click="sendMessage"
            :disabled="!selectedChat || !newMessage.trim()"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.chat-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Main content */
.main {
  display: flex;
  flex: 1;
}

/* Sidebar / Chat List */
.chat-list {
  width: 25%;
  background-color: #f1f1f0;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.chat-item {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #d0d7da;
}

.chat-item h2 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.chat-item p {
  margin: 0;
  font-size: 13px;
  color: #555;
}

/* Chat Box */
.chat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #edede9;
}

/* Header */
.chat-header {
  background-color: #1d3557;
  color: white;
  padding: 10px 20px;
}

/* Messages area */
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
}

.received {
  background-color: white;
  align-self: flex-start;
}

.sent {
  background-color: #caf0f8;
  align-self: flex-end;
}

/* Input area */
.chat-input {
  display: flex;
  padding: 10px;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
}

.chat-input button {
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #1d3557;
  color: white;
  border-radius: 20px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.no-chat {
  color: #666;
  text-align: center;
  margin-top: 50px;
}
</style>
