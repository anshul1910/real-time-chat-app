<script setup>
import { defineProps, defineEmits } from "vue";
import { useCookie } from "#app";
import { useRouter } from "#vue-router";
import { jwtDecode } from "jwt-decode";

const props = defineProps({
  users: Array,
});

const emit = defineEmits(["select"]);

function handleSelect(user) {
  emit("select", user);
}

const token = useCookie("uid");
const router = useRouter();

let username = "";

if (token.value) {
  try {
    const decoded_data = jwtDecode(token.value);
    username = decoded_data.username;
  } catch (e) {
    console.log("Invalid Token", e);
  }
}

function logout() {
  token.value = null;
  router.push("/");
}

function groupChat() {
  router.push("/chatapp/groupchat");
}
</script>

<template>
  <section class="chat-list">
    <div
      :elevation="2"
      class="sidebar-app-bar d-flex flex-column flex-lg-row justify-space-between ga-2 px-5"
    >
      <div
        class="d-flex justify-center align-center px-2 elevation-3 rounded-xl"
        style="
          background-color: #9ebfd3;
          color: #1d3557;
          font-size: x-large;
          letter-spacing: 0.1rem;
          font-weight: 700;
        "
      >
        <p>
          {{ username }}
        </p>
      </div>

      <section class="d-flex justify-center align-center ga-3">
        <v-btn @click="groupChat" icon elevation="5" color="#1d3557  ">
          <v-icon>mdi-account-group</v-icon>
        </v-btn>

        <v-btn @click="logout" icon elevation="5" color="#1d3557  ">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </section>
    </div>

    <div
      v-for="(user, index) in users"
      :key="index"
      class="chat-item"
      @click="handleSelect(user)"
    >
      <h2>{{ user.userName }}</h2>
      <p>{{ user.lastMessage }}</p>
    </div>
  </section>
</template>

<style scoped>
.chat-list {
  width: 25%;
  background-color: #f1f1f0;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-app-bar {
  width: 100%;
  padding: 0.5rem;
  background-color: #457b9d;
  color: white;
}
/*
.chat-list {
  width: 25%;
  background-color: #f1f1f0;
  border-right: 1px solid #ccc;
  overflow-y: auto;
} */

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
</style>
