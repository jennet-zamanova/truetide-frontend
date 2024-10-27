<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { ref } from "vue";

const props = defineProps(["postPair", "editing"]);
let editing = ref(props.editing);
const emit = defineEmits(["editPost", "refreshPosts"]);

const updateEditing = (_id: string) => {
  emit("editPost", _id);
};

const refresh = () => {
  emit("refreshPosts");
};
</script>

<template>
  <div class="row">
    <!-- {{ props.editing }} -->
    <div v-for="(post, index) of props.postPair" :key="index" class="row">
      <div class="post">
        <PostComponent v-if="props.editing !== post._id" :post="post" @refreshPosts="refresh" @editPost="updateEditing"></PostComponent>
        <EditPostForm v-else :post="post" @refreshPosts="refresh" @editPost="updateEditing" />
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
