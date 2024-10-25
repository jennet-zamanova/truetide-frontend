<script setup lang="ts">
import { ref } from "vue";

const props = defineProps(["labels"]);

const labels = ref(props.labels.filter((label: string) => label !== ""));
</script>

<template>
  <div>
    <label v-for="(label, index) of labels" v-bind:key="index"> #{{ label }} </label>
    <label v-if="labels.length === 0">no labels</label>
  </div>
</template>

<style scoped>
label {
  font-size: medium;
  font-weight: bold;
  padding: 0.2em;
}

div {
  padding: 0.1em;
  display: flex;
  flex-direction: row;
  gap: 0.1em;
}
</style>
