import axios from "axios";

export const getOwnerFranchise = (ownerId) => {
  return axios.get(`http://https://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api/franchises/owner/${ownerId}`);
};
