<script setup lang="ts">
import AddData from "@/components/Post/AddData.vue";
import { useToastStore } from "@/stores/toast";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

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
  if (content.value === "") {
    useToastStore().showToast({ message: `Please give a video link`, style: "error" });
  } else {
    if (!URL.canParse(content.value) || !content.value.includes("youtube")) {
      useToastStore().showToast({ message: "Please submit a valid youtube link!", style: "error" });
      content.value = "";
    } else {
      fileUploaded.value = true;
      // content.value = "https://youtu.be/JiuBeLDSGR0?si=ofefnZH5WCbjJ9qp"; // will be used
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
    }
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

const preventSubmit = () => {
  useToastStore().showToast({ message: `Please click on Next`, style: "error" });
};
</script>

<template>
  <form @submit.prevent="editPost()" v-if="!labelsAdded" class="edit-form full-form" @keydown.enter.prevent="preventSubmit">
    <div v-if="!fileUploaded" class="upload-video">
      <div class="upload-label">
        <h3 for="content">Update Video URL</h3>
        <input id="content" v-model="content" placeholder="Update your post!" required style="width: 100%; margin: 1em 0 0" />
      </div>

      <div class="full-row-div">
        <button type="button" class="button-secondary pure-button cancel-button" @click="emit('editPost')">Cancel</button>
        <button type="button" class="pure-button-primary pure-button move-button" @click="handleFileUpload">Next</button>
      </div>
    </div>
    <AddData
      v-if="fileUploaded && linksReceived && !linksAdded"
      :defaultData="links"
      name="Citations"
      next="Next"
      @addData="handleLinksForward"
      @goBack="handleLinksBackward"
      @cancel="emit('editPost')"
      class="full-form"
    ></AddData>
    <AddData v-if="linksAdded && !labelsAdded" :defaultData="labels" name="Hashtags" @addData="handleLabelsForward" next="Save" @goBack="handleLabelsBackward" @cancel="emit('editPost')"></AddData>
  </form>
  <div class="loading" v-else>Updating the Post...</div>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 3% 5%;
  min-height: 300px;
}

.upload-video {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-label {
  flex: 1;
}

.edit-form {
  display: flex;
  border-radius: 1em;
  border: 4px solid var(--secondary-highlight);
  background-color: white;
}

.full-form {
  flex: 1;
}

.full-row-div {
  margin: 1em 0 0 0;
  display: flex;
  flex-direction: row;
  gap: 0.5em;
  justify-content: space-between;
}
.add-button {
  background-color: var(--secondary-highlight);
  color: white;
  font-weight: bold;
  flex: 0;
}

.cancel-button {
  background-color: var(--base-bg);
  flex: 0;
}

.loading {
  padding: 2em;
  text-align: center;
  background-color: var(--base-bg);
  border-radius: 1em;
}
</style>
