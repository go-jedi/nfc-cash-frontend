<template>
  <q-header elevated>
    <q-toolbar class="bg-green-10">
      <q-toolbar-title>
        {{ title }}
      </q-toolbar-title>
      <q-tabs v-model="tab" shrink>
        <!-- <q-tab name="home" label="Главная" @click="changeTab('Главная')" /> -->
        <q-tab name="sign-up" label="Регистрация" @click="changeTab('Регистрация')" />
        <q-tab name="sign-in" label="Войти" @click="changeTab('Войти')" />
      </q-tabs>
    </q-toolbar>
  </q-header>
</template>

<script lang="js">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from "vue-router"

export default defineComponent({
  name: "MainHeaderComponent",
  props: {
    activePage: {
      type: String,
      required: true,
    }
  },
  setup(props) {
    const router = useRouter()

    const title = ref('Главная')
    const tab = ref("")

    const changeTab = (needName) => {
      try {
        if (tab.value === "home") {
          router.push("/")
        } else {
          router.push(`/${tab.value}`)
        }
        title.value = needName
      } catch (error) {
        console.log("error in changeTab func -->", error);
      }
    }

    onMounted(() => {
      if (props.activePage === "home") {
        title.value = "Главная"
        tab.value = "home"
      }
      if (props.activePage === "sign-up") {
        title.value = "Регистрация"
        tab.value = "sign-up"
      }
      if (props.activePage === "sign-in") {
        title.value = "Войти"
        tab.value = "sign-in"
      }
    })

    return {
      title,
      tab,
      changeTab
    }
  }
})
</script>

<style lang="scss" scoped></style>
