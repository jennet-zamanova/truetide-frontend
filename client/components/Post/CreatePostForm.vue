<script setup lang="ts">
import AddData from "@/components/Post/AddData.vue";
import UploadVideo from "@/components/Post/UploadVideo.vue";

import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);

const fileUploaded = ref(false);
const linksReceived = ref(false);
const linksAdded = ref(false);

let fileId: string = "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp"; // will be used
let links: string[] = [];
let labels: string[] = [];
const createPost = async () => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { citations: links.join(", "), labels: labels.join(", "), content: fileId },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const handleFileUpload = async (filePath: string, fileID: string) => {
  fileUploaded.value = true;
  try {
    if (filePath != "") {
      fileId = fileID;
      links = await fetchy(`/api/citations/${filePath}`, "GET");
    }
    linksReceived.value = true;
  } catch (_) {
    return;
  }
};

const handleLinks = (selectedLinks: string[]) => {
  links = selectedLinks;
  linksAdded.value = true;
};

const handleLabels = (selectedLabels: string[]) => {
  labels = selectedLabels;
};

const emptyForm = () => {
  fileUploaded.value = false;
  linksReceived.value = false;
  linksAdded.value = false;
  fileId = "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp";
  links = [];
  labels = [];
};
</script>

<template>
  <form @submit.prevent="createPost()">
    <label for="content" v-if="!fileUploaded">Post Contents:</label>
    <!-- <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea> -->
    <UploadVideo v-if="!fileUploaded" @uploadFile="handleFileUpload"></UploadVideo>
    <AddData v-if="fileUploaded && linksReceived && !linksAdded" :defaultData="links" name="Citations" @addData="handleLinks"></AddData>
    <AddData v-if="linksAdded" :defaultData="labels" name="Hashtags" @addData="handleLabels"></AddData>
    <button v-if="linksAdded" type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
label {
  font-size: large;
  font-weight: bold;
  padding: 0.25em;
}
</style>
