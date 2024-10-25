<script setup lang="ts">
import PairedPostComponent from "@/components/Post/PairedPostComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const TrueTideAvailableCategories = ["Politics & Governance"];

const TrueTideCategories = [
  "Race & Identity",
  "Free Speech & Censorship",
  "Social Justice & Activism",
  "Religion & Belief Systems",
  "Health & Lifestyle",
  "Economic Inequality & Class Issues",
  "Language & Communication",
  "Gender & Sexuality",
];

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchCategory = ref("all");

async function getPairedPosts() {
  let postResults;
  try {
    postResults = await fetchy(`/api/posts/${searchCategory.value}`, "GET");
  } catch (_) {
    return;
  }
  console.log("results:::", postResults);
  posts.value = postResults.posts;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getPairedPosts();
  loaded.value = true;
});
</script>

<template>
  <div class="button-row row">
    <select v-model="searchCategory">
      <option value="all">All</option>
      <option v-for="(category, index) of TrueTideAvailableCategories" :key="index">{{ category }}</option>
      <option v-for="(category, index) of TrueTideCategories" :key="index" disabled>{{ category }}</option>
    </select>
    <button @click="getPairedPosts" class="pure-button-primary pure-button">Show Posts</button>
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="(post, index) of posts" :key="index" :style="[index % 2 == 0 ? { 'background-color': 'var(--background)' } : { 'background-color': 'var(--base-bg)' }]">
      <PairedPostComponent :postPair="post" @refreshPosts="getPairedPosts" @editPost="updateEditing"></PairedPostComponent>
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.button-row {
  margin: 0 10%;
}
section {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

section,
p {
  margin: 0 auto;
  max-width: 75em;
  display: flex;
  justify-content: space-between;
}

article {
  width: 100%;
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
  display: flex;
  flex-direction: column;
  /* flex-wrap: wrap; */
}
</style>
