<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { ref } from "vue";

const emit = defineEmits(["addData", "goBack", "cancel"]);
const props = defineProps(["name", "next", "defaultData"]);

const data = ref(props.defaultData);

const inputData = ref("");

const submitData = async (dataPoint: string) => {
  emit("addData", dataPoint);
  emptyForm();
};

const addData = () => {
  if (inputData.value === "") {
    useToastStore().showToast({ message: `Please add a nonempty ${props.name.toLowerCase().slice(0, -1)}`, style: "error" });
  } else {
    if (props.name === "Citations" && !URL.canParse(inputData.value)) {
      useToastStore().showToast({ message: "Please submit a valid link!", style: "error" });
    } else {
      data.value.push(inputData.value);
    }
  }

  inputData.value = "";
};

const cancel = () => {
  emit("cancel");
  emptyForm();
};

const emptyForm = () => {
  data.value = "";
};
</script>

<template>
  <form class="add-form" @submit.prevent="submitData(data)">
    <div class="full-row-div row-div">
      <label for="content">Add {{ props.name }}:</label>
      <button type="button" class="button-secondary pure-button add-button" @click="cancel">Cancel</button>
    </div>
    <div>
      <div>
        <div class="row-div" v-for="(dataPoint, index) of data" :key="index">
          <label> {{ dataPoint }}</label>
          <button type="button" class="circle-button" @click="data.splice(index, 1)">-</button>
        </div>
      </div>

      <div class="row-div">
        <textarea id="content" v-model="inputData" :placeholder="`Add a ${props.name.slice(0, -1)}!`"> </textarea>
        <button type="button" class="button-secondary pure-button add-button" @click="addData">Add</button>
      </div>
    </div>

    <div class="full-row-div row-div">
      <button type="button" class="pure-button-primary pure-button" @click="emit('goBack', data)">Back</button>
      <button type="submit" class="pure-button-primary pure-button">{{ props.next ?? "Next" }}</button>
    </div>
  </form>
</template>

<style scoped>
label {
  font-size: large;
  font-weight: bold;
  padding: 0.25em 0;
}

textarea {
  flex: 1;
}

.add-button {
  flex: 0;
}
.row-div {
  display: flex;
  flex-direction: row;
  gap: 0.5em;
}
.full-row-div {
  justify-content: space-between;
}
.add-form {
  padding: 0;
}

div {
  padding: 0.1em;
}
</style>
