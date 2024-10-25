<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { ref } from "vue";
const content = ref("");
const emit = defineEmits(["uploadFile"]);
const fileInput = ref<HTMLInputElement | null>(null);
const files = ref();
function handleFileUpload() {
  files.value = fileInput.value?.files;
}
async function uploadFile() {
  //   const file = files.value[0];
  //   console.log(file);
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   try {
  // const response = await fetch("https://truetide-frontend.vercel.app/api/upload", {
  //   method: "POST",
  //   body: formData,
  // });
  //     if (!response.ok) {
  //       throw new Error("File upload failed");
  //     }
  //     console.log("File uploaded successfully", await response.text());
  //   } catch (error) {
  //     console.error("Here is the error on upload", error);
  //   }
  if (content.value === "") {
    useToastStore().showToast({ message: `Please give a video link`, style: "error" });
  } else {
    if (!URL.canParse(content.value) || !content.value.includes("youtube")) {
      useToastStore().showToast({ message: "Please submit a valid youtube link!", style: "error" });
      content.value = "";
    } else {
      emit("uploadFile", "", content.value);
    }
  }
}
</script>
<template>
  <h3>Video URL for the post</h3>
  <div>
    <!-- <input ref="fileInput" type="file" @change="handleFileUpload" />
    <h3>or give URL</h3> -->
    <input v-model="content" @change="handleFileUpload" class="input-file" />
    <button type="button" @click="uploadFile" class="pure-button-primary pure-button">Next</button>
  </div>
</template>
<style scoped>
/* div {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
} */
div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 2em;
  padding: 2em;
}

.input-file {
  flex: 1;
}
</style>
