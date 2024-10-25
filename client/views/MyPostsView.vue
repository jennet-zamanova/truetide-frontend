<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");

async function getPosts() {
  let query: Record<string, string> = { author: currentUsername.value };
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <main class="column">
    <h1>Your Posts</h1>
    <section class="posts" v-if="loaded && posts.length !== 0">
      <article v-for="post in posts" :key="post._id" :class="{ post: post._id !== editing }">
        <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
        <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      </article>
    </section>
    <div v-else-if="loaded">
      <p>You did not post anything yet.</p>
      <RouterLink :to="{ name: 'Upload' }"><button class="pure-button pure-button-primary">Upload</button></RouterLink>
    </div>
    <p v-else>Loading...</p>
  </main>
</template>

<style scoped>
.text {
  color: inherit;
  text-decoration: none;
}
.column {
  align-items: center;
}

.posts {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 10% 5em 10%;
  gap: 4em;
  width: 70%;
}

.post {
  padding: 0 20%;
  width: 60%;
}
</style>
