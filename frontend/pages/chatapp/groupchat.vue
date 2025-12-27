<script setup>
import { ref } from "vue";
import axios from "axios";
import Navbar from "~/components/Navbar.vue";
import { useCookie } from "#app";
import { jwtDecode } from "jwt-decode";
import GroupList from "~/components/GroupList.vue";

const { $socket } = useNuxtApp();

const groups = ref([]);
const selectedGroup = ref(null);
const messages = ref([]);
const currentUser = ref({});
const newMessage = ref("");
const groupMemberNames = ref([]);

const token = useCookie("uid");
if (token.value) {
  const decoded_data = jwtDecode(token.value);
  currentUser.value = {
    id: decoded_data._id,
    email: decoded_data.email,
    name: decoded_data.userName,
  };
}

onMounted(async () => {
  $socket.connect();

  $socket.emit("register-user", currentUser.value.id);

  await fetchGroups();

  $socket.on(
    "receive-group-message",
    ({ group_id, sender_id, message, sender_name }) => {
      if (selectedGroup.value && selectedGroup.value._id === group_id) {
        messages.value.push({ group_id, sender_id, sender_name, message });
      }
    }
  );
});

async function fetchGroups() {
  const res = await axios.get("http://localhost:8000/api/getallgroups", {
    withCredentials: true,
  });
  groups.value = res.data;
}

async function selectGroup(group) {
  selectedGroup.value = group;

  const res = await axios.get("http://localhost:8000/api/getgroupchats", {
    withCredentials: true,
  });
  const groupData = res.data.find((g) => g.group_id === group._id);

  groupMemberNames.value = groupData.memberNames;
  if (groupData) {
    messages.value = groupData.messages;
  } else {
    groupMemberNames.value = [];
    messages.value = [];
  }

  $socket.emit("join-group", group._id);
}

async function sendMessage() {
  if (!newMessage.value.trim()) return;

  $socket.emit("send-group-message", {
    sender_id: currentUser.value.id,
    group_id: selectedGroup.value._id,
    message: newMessage.value,
  });

  messages.value.push({
    sender_id: currentUser.value.id,
    group_id: selectedGroup.value._id,
    sender_name: currentUser.value.name,
    message: newMessage.value,
  });

  newMessage.value = "";
}
</script>

<template>
  <div class="group-chat-app">
    <!-- Navbar -->
    <Navbar />

    <!-- Main container -->
    <div class="main">
      <!-- Chat list -->
      <GroupList
        :groups="groups"
        @select="selectGroup"
        @groupCreated="fetchGroups"
      />

      <!-- Chat box -->
      <section class="chat-box">
        <div class="chat-header">
          <h2>{{ selectedGroup?.groupName || "Select a group" }}</h2>
          <p v-if="groupMemberNames.length">
            {{ groupMemberNames.join(", ") }}
          </p>
        </div>

        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-if="selectedGroup"
            v-for="(msg, i) in messages"
            :key="i"
            :class="[
              'message',
              msg.sender_id === currentUser.id ? 'sent' : 'received',
            ]"
          >
            <div class="sender-name" v-if="msg.sender_id !== currentUser.id">
              {{ msg.sender_name }}
            </div>
            <div class="sender-name" v-else>- You</div>
            {{ msg.message }}
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
            :disabled="!selectedGroup || !newMessage.trim()"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.group-chat-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Main content */
.main {
  display: flex;
  flex: 1;
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
  text-align: start;
}

.sent {
  background-color: #caf0f8;
  align-self: flex-end;
  text-align: end;
}

.sender-name {
  font-size: small;
  font-style: italic;
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
