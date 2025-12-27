<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

definePageMeta({
  layout: "authpage",
});

const userName = ref("");
const email = ref("");
const password = ref("");
const router = useRouter();

const handleSignup = async () => {
  const response = await axios.post("http://localhost:8000/api/signup", {
    userName: userName.value,
    email: email.value,
    password: password.value,
  });

  if (response.status === 201) {
    router.push("/chatapp/login");
  }
};

const userNameRules = [
  (value) => {
    if (value?.length >= 3) return true;
    return "Username is required.";
  },
];

const emailRules = [
  (value) => {
    if (value?.length >= 3) return true;
    return "Please enter you email.";
  },
];

const passwordRules = [
  (value) => {
    if (/[^0-9]/.test(value)) return true;
    return "Please enter you password.";
  },
];
</script>

<template>
  <div class="container">
    <section
      class="d-flex justify-center align-center"
      style="width: 40%; height: 80vh"
    >
      <img
        src="public/images/undraw_complete-form_aarh.png"
        alt="Signup Page Image"
        width="100%"
      />
    </section>
    <v-sheet class="d-flex flex-column ga-5 justify-center" width="300">
      <h1 class="text-center">Signup</h1>

      <v-form fast-fail @submit.prevent="handleSignup">
        <v-text-field
          v-model="userName"
          :rules="userNameRules"
          label="Enter Username"
        ></v-text-field>

        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="Enter your Email"
        ></v-text-field>

        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Set Password"
        ></v-text-field>

        <v-btn
          class="mt-2"
          style="background-color: #457b9d; color: white"
          type="submit"
          block
          >Signup</v-btn
        >
      </v-form>
      <div class="d-flex justify-center ga-4">
        Already have an account?
        <span><a href="/chatapp/login">Login</a></span>
      </div>
    </v-sheet>
  </div>
</template>

<style scoped>
.container {
  height: 80vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8vw;
}
</style>
