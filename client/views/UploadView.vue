<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
</script>

<template>
  <main>
    <h1>Create Post</h1>
    <CreatePostForm class="box" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.box {
  margin: 0 5%;
  height: 100%;
}

main {
  height: 80vh;
  display: flex;
  flex-direction: column;
}
</style>
