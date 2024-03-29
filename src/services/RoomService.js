import { api } from "boot/axios";

export default class RoomService {
  static async getRoom(formData) {
    return api.post("room/get-room", formData);
  }

  static async leaveRoom(formData) {
    return api.post("room/leave-room", formData);
  }
}
