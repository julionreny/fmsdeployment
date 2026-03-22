import axios from "axios";

export const API = axios.create({
  baseURL: "https://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api",
});