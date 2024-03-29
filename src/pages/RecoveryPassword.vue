<template>
  <div>
    <q-dialog v-model="alertSuccessRecoveryPassword">
      <q-card>
        <q-card-section>
          <div class="text-h6">Изменение пароля</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Ваш пароль был успешно изменён. Для перехода на страницу входа нажмите на кнопку "OK"
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="green" v-close-popup @click="alertClose" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="main-signup fixed-center">
      <div class="container">
        <div class="main-login">
          <div class="main-login-content">
            <div class="main-login-content__title">
              Изменение пароля
            </div>
            <form class="main-login-content__form" @submit.prevent="submitRecoveryPassword">
              <div class="main-login-content__form_input" :class="{ error: v$.newPassword.$errors.length }">
                <input class="main-login-content__form_input_i"
                  :class="{ 'input-error': v$.newPassword.$errors.length > 0 }" type="password" placeholder="Новый пароль"
                  v-model.trim="recoveryPasswordForm.newPassword" @blur="v$.newPassword.$touch()" />
                <div class="input-errors" v-for="error of v$.newPassword.$errors" :key="error.$uid">
                  <div class="error-msg">{{ error.$message === "Value is required" ? "Пожалуйста, введите новый пароль"
                    :
                    error.$message === "This field should be at least 8 characters long" ?
                      "Это поле должно содержать не менее 8 символов" : "" }}
                  </div>
                </div>
              </div>
              <div class="main-login-content__form_input" :class="{ error: v$.confirmNewPassword.$errors.length }">
                <input class="main-login-content__form_input_i"
                  :class="{ 'input-error': v$.confirmNewPassword.$errors.length > 0 }" type="password"
                  placeholder="Повторите пароль" v-model.trim="recoveryPasswordForm.confirmNewPassword"
                  @blur="v$.confirmNewPassword.$touch()" />
                <div class="input-errors" v-for="error of v$.confirmNewPassword.$errors" :key="error.$uid">
                  <div class="error-msg">{{ error.$message === "Value is required" ?
                    "Пожалуйста, введите новый пароль ещё раз" :
                    error.$message === "The value must be equal to the other value" ? "Пароли не совпадают" : ""
                  }}
                  </div>
                </div>
              </div>
              <div class="main-login-content__form_submit">
                <button type="submit" :disabled="isButtonRecoveryDisabled" @click.prevent="submitRecoveryPassword">
                  Изменить пароль
                </button>
              </div>
              <div class="main-login-content__form_submitt">
                <button :disabled="isButtonCancelDisabled" @click.prevent="submitCancelRecoveryPassword">
                  Отменить изменение пароля
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from "vue-router"

import { required, minLength, sameAs } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'

import { useRecoveryStore } from "../stores/recovery"

export default defineComponent({
  name: "RecoveryPasswordPage",
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()

    const notifyNeed = (needMessage, needType, needPosition, needTimeout) => {
      $q.notify({
        type: needType,
        message: needMessage,
        progress: true,
        position: needPosition,
        timeout: needTimeout
      })
    }

    const recoveryStore = useRecoveryStore()

    const recoveryPasswordForm = ref({
      newPassword: "",
      confirmNewPassword: "",
    })
    const isButtonRecoveryDisabled = ref(false)
    const isButtonCancelDisabled = ref(false)

    const alertSuccessRecoveryPassword = ref(false)

    const rules = {
      newPassword: {
        required,
        minLength: minLength(8),
      },
      confirmNewPassword: {
        required,
        sameAs: sameAs(computed(() => recoveryPasswordForm.value.newPassword)),
      }
    }

    const v$ = useVuelidate(rules, recoveryPasswordForm)

    const alertClose = async () => {
      alertSuccessRecoveryPassword.value = false
      router.push("/sign-in")
    }

    const submitRecoveryPassword = async () => {
      v$.value.$touch()
      if (v$.value.$invalid) {
        notifyNeed("Не все поля заполнены", "warning", "top", 1000)
      } else {
        isButtonRecoveryDisabled.value = true
        $q.loading.show()
        const formDataComparePassword = {
          uid: route.params.id,
          password: recoveryPasswordForm.value.newPassword
        }
        await recoveryStore.actRecoveryPasswordCompare(formDataComparePassword)
        console.log("recoveryStore.isPasswordsCompare -->", recoveryStore.isPasswordsCompare)
        if (recoveryStore.isPasswordsCompare === true) {
          notifyNeed("Новый пароль совпадает с текущим паролем", "warning", "top-right", 2000)
        } else {
          const formDataRecoveryPassword = {
            uid: route.params.id,
            password: recoveryPasswordForm.value.newPassword
          }
          await recoveryStore.actRecoveryPassword(formDataRecoveryPassword)
          if (recoveryStore.isRecoveryPassword === true) {
            isButtonRecoveryDisabled.value = false
            $q.loading.hide()
            notifyNeed("Успешное изменение пароля", "positive", "top-right", 2000)
            alertSuccessRecoveryPassword.value = true
          } else {
            notifyNeed("Ошибка изменения пароля. Попробуйте позже", "warning", "top-right", 2000)
          }
        }
        isButtonRecoveryDisabled.value = false
        $q.loading.hide()
      }
    }

    const submitCancelRecoveryPassword = async () => {
      isButtonCancelDisabled.value = true
      $q.loading.show()
      const formData = {
        uid: route.params.id
      }
      await recoveryStore.actRecoveryPasswordComplete(formData)
      if (recoveryStore.isRecoveryPasswordComplete === true) {
        router.push("/sign-in")
      }
      isButtonCancelDisabled.value = false
      $q.loading.hide()
    }

    onMounted(async () => {
      const formData = {
        uid: route.params.id
      }
      await recoveryStore.actCheckRecoveryPassword(formData)
      if (recoveryStore.isCheckRecoveryPassword === false) {
        router.push("/recovery/e-recovery-password")
      }
    })

    return {
      recoveryPasswordForm,
      v$,
      submitRecoveryPassword,
      submitCancelRecoveryPassword,
      isButtonRecoveryDisabled,
      isButtonCancelDisabled,
      alertSuccessRecoveryPassword,
      alertClose
    }
  }
})
</script>

<style lang="scss" scoped>
.main-signup {
  width: 100%;
}

.container {
  margin: 0 auto;
  padding-right: 15px;
  padding-left: 15px;
  max-width: 1110px;
}

.main-login {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 15px;
  background-color: #ffffff;
}

.main-login-content {
  width: 537px;
  padding: 40px 30px 60px 30px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  -webkit-box-shadow: 0px 2px 6px 0px #1d2030;
  box-shadow: 0px 2px 6px 0px #1d2030;
}

.main-login-content__title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1b5e20;
  text-align: center;
}

.main-login-content__signupl {
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-login-content__signupl_text {
  font-size: 14px;
  font-weight: 400;
  color: #333;
}

.main-login-content__signupl_link {
  margin-left: 5px;
}

.main-login-content__signupl_link>a {
  text-decoration: none;
  font-size: 14px;
  color: #1b5e20;
}

.main-login-content__signupl_link>a:hover {
  color: #1b5e20;
  text-decoration: underline;
}

.main-login-content__form {
  margin-top: 25px;
}

.main-login-content__form_input {
  margin-bottom: 20px;
}

.main-login-content__form_input_i {
  width: 100%;
  height: 50px;
  background-color: #fff;
  color: #333333;
  font-size: 18px;
  padding: 12px 22px;
  border-radius: 3px;
  border: solid 1px #bcc2ce;
  outline: none;
  -webkit-box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.1), 0 0 2px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.1), 0 0 2px 0 rgba(0, 0, 0, 0.1);
}

.input-error {
  border: 1px solid #ff0000;
}

.error-msg {
  color: #ff0000;
  font-size: 11px;
}

.main-login-content__form_forgot {
  display: flex;
  justify-content: end;
  margin: 0 0 10px;
}

.main-login-content__form_forgot_link>a {
  font-size: 14px;
  text-decoration: none;
  color: #1b5e20;
}

.main-login-content__form_forgot_link>a:hover {
  color: #1b5e20;
  text-decoration: underline;
}

.main-login-content__form_submit {
  margin-top: 20px;
}

.main-login-content__form_submit>button {
  cursor: pointer;
  width: 100%;
  height: 48px;
  padding: 8px 16px;
  border-radius: 3px;
  border: none;
  box-shadow: 0px 2px 3px #9c9c9c;
  font-size: 20px;
  background-color: #1b5e20;
  color: #fff;
}

.main-login-content__form_submit>button:hover {
  color: #fff;
  background-color: #1b5e1fe8;
  border-color: #1b5e1fe8;
}

.main-login-content__form_submitt {
  margin-top: 20px;
}

.main-login-content__form_submitt>button {
  cursor: pointer;
  width: 100%;
  height: 48px;
  padding: 8px 16px;
  border-radius: 3px;
  border: none;
  box-shadow: 0px 2px 3px #9c9c9c;
  font-size: 20px;
  background-color: #fff;
  color: #333;
}

.main-login-content__form_submitt>button:hover {
  color: #000;
  background-color: #bcc2ce1a;
  border-color: #bcc2ce1a;
}

@media (max-width: 1024px) {
  .main-login-content {
    width: 517px;
    // height: 510px;
  }

  .main-login-content__title {
    font-size: 25px;
  }

  .main-login-content__signupl_text {
    font-size: 13px;
  }

  .main-login-content__signupl_link>a {
    font-size: 13px;
  }

  .main-login-content__form_input {
    margin-bottom: 17px;
  }

  .main-login-content__form_input_i {
    height: 47px;
    font-size: 15px;
  }

  .main-login-content__form_forgot_link>a {
    font-size: 13px;
  }

  .main-login-content__form_submit>button {
    height: 45px;
    font-size: 17px;
  }

  .main-login-content__form_submitt>button {
    height: 45px;
    font-size: 17px;
  }
}

@media (max-width: 926px) {
  .main-signup {
    height: 100vh;
    overflow: auto;
  }

  .main-login {
    margin-top: 100px;
    padding: 0 15px 45px 15px;
  }
}

@media (max-width: 568px) {
  .main-login-content {
    width: 100%;
  }

  .main-login-content__title {
    font-size: 20px;
  }

  .main-login-content__signupl_text {
    font-size: 11px;
  }

  .main-login-content__signupl_link>a {
    font-size: 11px;
  }

  .main-login-content__form {
    margin-top: 20px;
  }

  .main-login-content__form_input {
    margin-bottom: 16px;
  }

  .main-login-content__form_input_i {
    height: 45px;
    font-size: 12px;
  }

  .main-login-content__form_input_i::placeholder {
    font-size: 13px;
  }

  .main-login-content__form_forgot_link>a {
    font-size: 11px;
  }

  .main-login-content__form_submit>button {
    font-size: 14px;
  }

  .main-login-content__form_submitt>button {
    font-size: 14px;
  }
}

@media (max-width: 428px) {
  .main-signup {
    height: auto;
    overflow: none;
  }

  .main-login {
    margin-top: 20px;
  }

  .error-msg {
    font-size: 10px;
  }
}

@media (max-width: 390px) {
  .main-login-content {
    padding: 40px 30px 40px 30px;
    width: 100%;
  }

  .main-login-content__title {
    font-size: 18px;
  }

  .main-login-content__signupl_text {
    font-size: 10px;
  }

  .main-login-content__signupl_link>a {
    font-size: 10px;
  }

  .main-login-content__form_input {
    margin-bottom: 14px;
  }

  .main-login-content__form_input_i {
    height: 40px;
    font-size: 11px;
  }

  .main-login-content__form_input_i::placeholder {
    font-size: 12px;
  }

  .main-login-content__form_forgot_link>a {
    font-size: 10px;
  }

  .main-login-content__form_submit>button {
    height: 40px;
    font-size: 12px;
  }

  .main-login-content__form_submitt>button {
    height: 40px;
    font-size: 12px;
  }
}

@media (max-width: 375px) {
  .main-login-content {
    padding: 30px 30px 40px 30px;
    width: 100%;
  }

  .error-msg {
    font-size: 9px;
  }

  .main-login-content__title {
    margin: 0 0 4px 0;
    font-size: 16px;
  }

  .main-login-content__form {
    margin-top: 15px;
  }

  .main-login-content__form_input {
    margin-bottom: 13px;
  }

  .main-login-content__form_input_i {
    height: 35px;
    font-size: 10px;
  }

  .main-login-content__form_input_i::placeholder {
    font-size: 11px;
  }

  .main-login-content__form_submit {
    margin-top: 14px;
  }

  .main-login-content__form_submit>button {
    height: 35px;
    font-size: 10px;
  }

  .main-login-content__form_submitt {
    margin-top: 14px;
  }

  .main-login-content__form_submitt>button {
    height: 35px;
    font-size: 10px;
  }
}

@media (max-width: 320px) {
  .main-login {
    margin-top: 80px;
  }

  .main-login-content {
    padding: 20px 20px 30px 20px;
    width: 100%;
  }

  .error-msg {
    font-size: 8px;
  }

  .main-login-content__title {
    margin: 0 0 4px 0;
    font-size: 14px;
  }

  .main-login-content__signupl {
    flex-direction: column;
    margin-top: 10px;
  }

  .main-login-content__signupl_text {
    font-size: 9px;
  }

  .main-login-content__signupl_link {
    margin-left: 0;
  }

  .main-login-content__signupl_link>a {
    font-size: 9px;
  }

  .main-login-content__form_input {
    margin-bottom: 12px;
  }

  .main-login-content__form_input_i {
    height: 30px;
    font-size: 9px;
  }

  .main-login-content__form_input_i::placeholder {
    font-size: 10px;
  }

  .main-login-content__form_forgot_link>a {
    font-size: 9px;
  }

  .main-login-content__form_submit {
    margin-top: 10px;
  }

  .main-login-content__form_submit>button {
    height: 30px;
    font-size: 9px;
  }

  .main-login-content__form_submitt {
    margin-top: 10px;
  }

  .main-login-content__form_submitt>button {
    height: 30px;
    font-size: 9px;
  }
}
</style>
