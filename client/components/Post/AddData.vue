<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["addData"]);
const props = defineProps(["name", "defaultData"]);

const data = ref(props.defaultData);

const inputData = ref("");

const submitData = async (dataPoint: string) => {
  emit("addData", dataPoint);
  emptyForm();
};

const addData = () => {
  // todo if name is citations check that its a valid link
  data.value.push(inputData.value);
  inputData.value = "";
};

const emptyForm = () => {
  data.value = "";
};
</script>

<template>
  <form class="add-form" @submit.prevent="submitData(data)">
    <label for="content">Add {{ props.name }}:</label>
    <div>
      <div>
        <div class="row-div" v-for="(dataPoint, index) of data" :key="index">
          <label> {{ dataPoint }}</label>
          <button type="button" class="circle-button" @click="data.splice(index, 1)">-</button>
        </div>
      </div>

      <div class="row-div">
        <textarea id="content" v-model="inputData" :placeholder="`Add a ${props.name.slice(0, -1)}!`"> </textarea>
        <button type="button" class="button-secondary pure-button" @click="addData">Add</button>
      </div>
    </div>

    <button v-if="props.name !== 'Hashtags'" type="submit" class="pure-button-primary pure-button">Next</button>
  </form>
</template>

<style scoped>
label {
  font-size: large;
  font-weight: bold;
  padding: 0.25em 0;
}
.row-div {
  display: flex;
  flex-direction: row;
  gap: 0.5em;
}
.add-form {
  padding: 0;
}

div {
  padding: 0.1em;
}
</style>
