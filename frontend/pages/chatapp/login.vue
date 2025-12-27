<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

definePageMeta({
  layout: "authpage",
});

const email = ref("");
const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/login",
      {
        email: email.value,
        password: password.value,
      },
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      router.push("/chatapp/dashboard");
    }
  } catch (e) {
    console.log("Login Failed :", e);
  }
};

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
        src="public/images/undraw_enter-password_1kl4.png"
        alt="Login Page Image"
        width="100%"
      />
    </section>

    <v-sheet class="d-flex flex-column ga-5 justify-center" width="300">
      <h1 class="text-center">Login</h1>
      <v-form fast-fail @submit.prevent="handleLogin">
        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="Email"
        ></v-text-field>

        <v-text-field
          type="password"
          v-model="password"
          :rules="passwordRules"
          label="Password"
        ></v-text-field>

        <v-btn
          class="mt-2"
          style="background-color: #457b9d; color: white"
          type="submit"
          block
          >Login</v-btn
        >
      </v-form>
      <div class="d-flex justify-center ga-4">
        Don't have an account? <span><a href="/chatapp/signup">Singup</a></span>
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
  gap: 5vw;
}
</style>
