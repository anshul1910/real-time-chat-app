<script setup>
import { ref } from "vue";
import axios from "axios";
import { useCookie } from "#app";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "#vue-router";

const groupName = ref("");
const formRef = ref(null);
const formValid = ref(false);
const allUsers = ref([]);
const selectedMembers = ref([]);
const router = useRouter();

let currentUserEmail = "";
const token = useCookie("uid");
if (token.value) {
  const decoded_data = jwtDecode(token.value);
  currentUserEmail = decoded_data.email;
}

onMounted(async () => {
  try {
    const usersResponse = await axios.get(
      "http://localhost:8000/api/getallusers"
    );

    allUsers.value = usersResponse.data.filter(
      (user) => user.email !== currentUserEmail
    );
  } catch (error) {
    console.error("Error fetching users :", error);
  }
});

const createGroup = async () => {
  if (!formValid.value) return;

  try {
    const res = await axios.post(
      "http://localhost:8000/api/creategroup",
      {
        groupName: groupName.value,
        members: selectedMembers.value.map((user) => user._id),
      },
      {
        withCredentials: true,
      }
    );

    if (res.status === 201) {
      router.push("/chatapp/groupchat");
    }

    groupName.value = "";
    formRef.value.resetValidation();
  } catch (error) {
    console.error("Error creating group:", error);
  }
};
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4 max-w-md mx-auto mt-10">
          <v-card-title>Create Group</v-card-title>
          <v-card-text>
            <v-form
              @submit.prevent="createGroup"
              ref="formRef"
              v-model="formValid"
            >
              <v-text-field
                v-model="groupName"
                label="Group Name"
                :rules="[(v) => !!v || 'Group name is required']"
                required
              ></v-text-field>

              <div class="mt-4">
                <h4 class="mb-2">Select Members:</h4>
                <v-checkbox
                  v-for="user in allUsers"
                  :key="user._id"
                  :label="user.userName || user.email"
                  :value="user"
                  v-model="selectedMembers"
                  hide-details
                  density="comfortable"
                />
              </div>

              <v-btn
                type="submit"
                :disabled="!formValid"
                color="#457b9d"
                class="mt-4"
                block
              >
                <v-icon start>mdi-plus</v-icon>
                Create Group
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
