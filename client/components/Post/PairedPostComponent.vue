<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { ref } from "vue";

const props = defineProps(["postPair"]);
let editing = ref("");
const emit = defineEmits(["editPost", "refreshPosts"]);
</script>

<template>
  <div class="row">
    <div v-for="(post, index) of props.postPair" :key="index" class="row">
      <div class="post">
        <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="() => emit('refreshPosts')" @editPost="() => emit('editPost')"></PostComponent>
        <EditPostForm v-else :post="post" @refreshPosts="() => emit('refreshPosts')" @editPost="() => emit('editPost')" />
      </div>

      <h3 v-if="index !== props.postPair.length - 1">VS</h3>
    </div>
  </div>
</template>

<style scoped>
.row {
  justify-content: space-between;
}
.post {
  width: 100%;
}
</style>
