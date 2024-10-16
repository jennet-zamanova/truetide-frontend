<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

import { ref } from "vue";

const fileInput = ref<HTMLInputElement | null>(null);
const files = ref();

function handleFileChange() {
  files.value = fileInput.value?.files;
}

async function doSomething() {
  const file = files.value[0];
  console.log(file);
  // console.log(file.value);
  // await fetchy("/api/users", "POST", {
  //   body: { username, password },
  // });

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    console.log("File uploaded successfully");
  } catch (error) {
    console.error(error);
  }
  // and do other things...
}
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <section>
      <input ref="fileInput" type="file" @change="handleFileChange" />
      <button @click="doSomething">do something</button>
    </section>
    <PostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
