<script setup>
import { defineProps, defineEmits, ref } from "vue";
import { useCookie } from "#app";
import { useRouter } from "#vue-router";
import { jwtDecode } from "jwt-decode";

const props = defineProps({
  groups: Array,
});

const emit = defineEmits(["select", "groupCreated"]);

const token = useCookie("uid");
const router = useRouter();

let username = "";
let userId = "";

if (token.value) {
  try {
    const decoded_data = jwtDecode(token.value);
    username = decoded_data.username;
    userId = decoded_data._id;
  } catch (e) {
    console.log("Invalid Token", e);
  }
}

async function createGroup() {
  router.push("/chatapp/create-group");
}

function handleSelect(group) {
  emit("select", group);
}

function logout() {
  token.value = null;
  router.push("/");
}

function privateChat() {
  router.push("/chatapp/dashboard");
}
</script>

<template>
  <section class="group-list">
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
        <v-btn @click="createGroup" icon elevation="5" color="#1d3557  ">
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <v-btn @click="privateChat" icon elevation="5" color="#1d3557  ">
          <v-icon>mdi-chat</v-icon>
        </v-btn>

        <v-btn @click="logout" icon elevation="5" color="#1d3557  ">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </section>
    </div>

    <div
      v-for="(group, index) in groups"
      :key="index"
      class="chat-item"
      @click="handleSelect(group)"
    >
      <h2>{{ group.groupName }}</h2>
    </div>
  </section>
</template>

<style scoped>
.group-list {
  width: 25%;
  background-color: #f1f1f0;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.group-create {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.group-input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.member-select {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  height: 100px;
}

.sidebar-app-bar {
  width: 100%;
  padding: 0.5rem;
  background-color: #457b9d;
  color: white;
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
</style>
