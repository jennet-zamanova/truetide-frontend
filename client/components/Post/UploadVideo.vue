<script setup lang="ts">
import { ref } from "vue";
const content = ref("");
const emit = defineEmits(["uploadFile"]);
const fileInput = ref<HTMLInputElement | null>(null);
const files = ref();
function handleFileUpload() {
  files.value = fileInput.value?.files;
}
async function uploadFile() {
  const file = files.value[0];
  console.log(file);
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("File upload failed");
    }
    console.log("File uploaded successfully");
  } catch (error) {
    console.error("Here is the error on upload", error);
  }
}
</script>
<template>
  <input ref="fileInput" type="file" @change="handleFileUpload" />
  <button type="button" @click="uploadFile" class="pure-button-primary pure-button">Next</button>
</template>
<style scoped></style>
