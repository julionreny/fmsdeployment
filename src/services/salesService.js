import axios from "axios";

const API = "https://://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api/sales";

export const getSalesByBranch = async (branchId, month) => {
  const res = await axios.get(`${API}/${branchId}`, {
    params: { month }
  });
  return res.data;
};

export const addSale = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};
