<script setup lang="ts">
import AddData from "@/components/Post/AddData.vue";
import UploadVideo from "@/components/Post/UploadVideo.vue";

import { useToastStore } from "@/stores/toast";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const emit = defineEmits(["refreshPosts"]);

const fileUploaded = ref(false);
const linksReceived = ref(false);
const linksAdded = ref(false);
const labelsAdded = ref(false);

// let fileId: string = "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp"; // will be used
let fileId: string = "";
let links: string[] = [];
let labels: string[] = [];
const createPost = async () => {
  labelsAdded.value = true;
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
  if (fileID.length !== 0) {
    fileId = fileID;
  }
  // fileId = fileID ?? "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp"; // will be used
  links = [];
  labels = [];
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

const handleLinksForward = (selectedLinks: string[]) => {
  links = selectedLinks;
  linksAdded.value = true;
};

const handleLinksBackward = (selectedLinks: string[]) => {
  links = selectedLinks;
  linksReceived.value = false;
  fileUploaded.value = false;
};

const handleLabelsForward = async (selectedLabels: string[]) => {
  labels = selectedLabels;
  await createPost();
};

const handleLabelsBackward = async (selectedLabels: string[]) => {
  labels = selectedLabels;
  linksAdded.value = false;
};

const preventSubmit = () => {
  useToastStore().showToast({ message: `Please click on Next`, style: "error" });
};

const emptyForm = () => {
  fileUploaded.value = false;
  linksReceived.value = false;
  linksAdded.value = false;
  // fileId = "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp";
  fileId = "";
  links = [];
  labels = [];
  labelsAdded.value = false;
};
</script>

<template>
  <form @submit.prevent="createPost()" v-if="!labelsAdded" @keydown.enter.prevent="preventSubmit">
    <div>
      <UploadVideo v-if="!fileUploaded" @uploadFile="handleFileUpload"></UploadVideo>
    </div>
    <AddData
      v-if="fileUploaded && linksReceived && !linksAdded"
      :defaultData="links"
      name="Citations"
      next="Next"
      @addData="handleLinksForward"
      @goBack="handleLinksBackward"
      @cancel="emptyForm"
    ></AddData>
    <AddData v-if="linksAdded && !labelsAdded" :defaultData="labels" name="Hashtags" next="Create Post!" @addData="handleLabelsForward" @goBack="handleLabelsBackward" @cancel="emptyForm"></AddData>
  </form>
  <div class="loading" v-else>Uploading the Post...</div>
</template>

<style scoped>
form {
  height: 100%;
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
.loading {
  padding: 2em;
  text-align: center;
  background-color: var(--base-bg);
  border-radius: 1em;
}
</style>
