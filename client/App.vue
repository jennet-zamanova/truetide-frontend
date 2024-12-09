<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { currentUsername } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/anotherLogo.png" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>TrueTide</h1>
        </RouterLink>
      </div>
      <ul>
        <div v-if="isLoggedIn" class="loggedIn">
          <li>
            <RouterLink :to="{ name: 'Upload' }" :class="{ underline: currentRouteName == 'Upload' }">Upload</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'MyPosts' }" :class="{ underline: currentRouteName == 'MyPosts' }">My Posts</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Settings' }" :class="{ profileSelected: currentRouteName == 'Settings', profile: true }"> {{ currentUsername.slice(0, 1) }} </RouterLink>
          </li>
        </div>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  height: 6vh;
  padding: 1em 2em;
  background-color: var(--secondary-backgorund);
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: white;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}

.loggedIn {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.profile {
  padding: 0.5em 1em;
  background-color: white;
  color: black;
  border-radius: 50%;
}

.profileSelected {
  background-color: var(--primary-blue);
  color: white;
}
</style>
