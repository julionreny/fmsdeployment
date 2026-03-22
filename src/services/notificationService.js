import axios from "axios";

const API = "https://://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api/notifications";

export const getNotifications = (branchId) =>
  axios.get(`${API}/${branchId}`);

export const clearNotifications = (branchId) =>
  axios.delete(`${API}/clear/${branchId}`);


/* READ (delete single notification) */
export const deleteNotification = (id) =>
  axios.delete(`${API}/${id}`);

export const getOwnerNotifications = (franchiseId) =>
  axios.get(`https://://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api/notifications/owner/${franchiseId}`);