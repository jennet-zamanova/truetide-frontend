<script setup lang="ts">
import AddData from "@/components/Post/AddData.vue";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "../../utils/formatDate";

const props = defineProps(["post"]);
const content = ref(props.post.content);
const emit = defineEmits(["editPost", "refreshPosts"]);

const fileUploaded = ref(false);
const linksReceived = ref(false);
const linksAdded = ref(false);
const labelsAdded = ref(false);
let links: string[] = props.post.citations;
let labels: string[] = props.post.labels;

const editPost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { content: content.value, citations: links.join(", "), labels: labels.join(", ") } });
  } catch (e) {
    return;
  }
  emit("editPost");
  emit("refreshPosts");
};

const handleFileUpload = async () => {
  fileUploaded.value = true;
  content.value = "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp"; // will be used
  const fileId = ""; // would be different if implemented
  const filePath = "";
  try {
    if (fileId != "") {
      content.value = fileId;
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
  await editPost();
};

const handleLabelsBackward = async (selectedLabels: string[]) => {
  labels = selectedLabels;
  linksAdded.value = false;
};
</script>

<template>
  <form @submit.prevent="editPost()" v-if="!labelsAdded">
    <p class="author">{{ props.post.author }}</p>
    <div v-if="!fileUploaded">
      <label for="content">Update Content:</label>
      <input id="content" v-model="content" placeholder="Update your post!" required />
      <menu>
        <li><button type="button" class="btn-small pure-button" @click="emit('editPost')">Cancel</button></li>
        <li><button type="button" @click="handleFileUpload" class="btn-small pure-button-primary pure-button">Next</button></li>
      </menu>
    </div>

    <!-- <UploadVideo v-if="!fileUploaded" @uploadFile="handleFileUpload"></UploadVideo> -->
    <AddData
      v-if="fileUploaded && linksReceived && !linksAdded"
      :defaultData="links"
      name="Citations"
      next="Next"
      @addData="handleLinksForward"
      @goBack="handleLinksBackward"
      @cancel="emit('editPost')"
    ></AddData>
    <AddData v-if="linksAdded && !labelsAdded" :defaultData="labels" name="Hashtags" @addData="handleLabelsForward" next="Save" @goBack="handleLabelsBackward" @cancel="emit('editPost')"></AddData>

    <div class="base">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated" class="timestamp">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else class="timestamp">Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </div>
  </form>
  <div class="loading" v-else>Updating the Post...</div>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.loading {
  padding: 2em;
  text-align: center;
  background-color: var(--base-bg);
  border-radius: 1em;
}
</style>
