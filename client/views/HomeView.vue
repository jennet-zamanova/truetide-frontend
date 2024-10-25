<script setup lang="ts">
import PairedPostListComponent from "@/components/Post/PairedPostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <PairedPostListComponent></PairedPostListComponent>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
