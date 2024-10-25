<script setup lang="ts">
const props = defineProps(["links"]);
</script>

<template>
  <div>
    <a v-for="(link, index) of props.links" v-bind:key="index" :href="link" target="_blank" rel="noopener noreferrer">
      <div v-if="link !== ''">{{ link.slice("https://".length).slice(0, link.slice("https://".length).indexOf("/")) }}</div>
    </a>
  </div>
</template>

<style scoped>
a {
  font-size: medium;
  font-weight: bold;
  padding: 0.2em 0.8em;
}

div {
  padding: 0.1em;
  display: flex;
  flex-direction: row;
  gap: 2em;
}

a:first-child {
  padding: 0.2em;
}
</style>
