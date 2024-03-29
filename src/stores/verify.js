import { defineStore } from "pinia";

import axios from "axios";

import verifyService from "../services/VerifyService";

export const useVerifyStore = defineStore("verify", {
  state: () => {
    return {
      isCheckVerifyEmail: false,
      isVerifyEmail: false,
    };
  },
  getters: {},
  actions: {
    async actCheckEmailVerify(formData) {
      try {
        const response = await verifyService.checkEmailVerify(formData);
        console.log("response.data -->", response.data);
        if (response.data.status === 200) {
          this.isCheckVerifyEmail = response.data.result;
        }
      } catch (error) {
        console.log("error in actCheckEmailVerify -->", error);
      }
    },
    async actEmailVerify(uid) {
      try {
        const response = await verifyService.emailVerify(uid);
        console.log("response.data -->", response.data);
        if (response.data.status === 200) {
          if (response.data.result === true) {
            this.isVerifyEmail = true;
          } else {
            this.isVerifyEmail = false;
          }
        }
      } catch (error) {
        console.log("error in actEmailVerify -->", error);
      }
    },
  },
});
