<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { fetchy } from "../../utils/fetchy";
import PostCitations from "./Citation/PostCitations.vue";
import PostLabels from "./Label/PostLabels.vue";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const postURL = computed(() => {
  // const root = "https://youtu.be/";
  // return props.post.content.slice(0, root.length) + "embed/" + props.post.content.slice(root.length)
  console.log("props ", props.post);
  if (props.post.content.includes("embed")) {
    return props.post.content;
  }
  return "https://www.youtube.com/embed/8Eu3jmEUlzc?si=kYFDGrGTQENvkHWe";
});

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};
</script>

<template>
  <iframe
    width="100%"
    height="315"
    :src="postURL"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>
  <div class="post-info">
    <button class="author">{{ props.post.author.slice(0, 1) }}</button>
    <div class="meta">
      <PostLabels :labels="props.post.labels"></PostLabels>
      <PostCitations :links="props.post.citations"></PostCitations>
    </div>
  </div>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}
.post-info {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 10%;
  margin: 1em 0em;
}
.author {
  margin-right: 1em;
  text-align: center;
  padding-left: 3%;
  padding-right: 3%;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.2em;
  background-color: black;
  color: white;
}
.meta {
  display: flex;
  flex-direction: column;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
