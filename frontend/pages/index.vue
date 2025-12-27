<script setup>
// const { $socket } = useNuxtApp();
const router = useRouter();

function getStarted() {
  // $socket.connect();
  router.push("/chatapp/login");
}
</script>

<template>
  <div class="chat-app">
    <!-- Navbar -->
    <Navbar />

    <!-- Main container -->
    <v-container>
      <div class="main">
        <section
          class="d-flex justify-center align-center"
          style="width: 25%; height: 80vh"
        >
          <img
            src="public/images/undraw_friends-online_gvwz.png"
            alt="Home Page Image"
            width="100%"
          />
        </section>

        <section>
          <!-- <h1>Real Time Chat Application</h1>
          <button>Let Start</button> -->
          <v-card class="pa-5" variant="tonal">
            <h1>Real Time Chat Application</h1>
            <v-card-actions>
              <v-btn
                style="
                  background-color: #457b9d;
                  color: white;
                  font-weight: 600;
                "
                @click="getStarted"
                >Get Started</v-btn
              >
            </v-card-actions>
          </v-card>
        </section>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5vw;
}
</style>
