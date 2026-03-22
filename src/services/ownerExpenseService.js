import axios from "axios";

const API = "http://https://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api/owner-expenses";


export const getOwnerExpenses = async (franchiseId) => {

  console.log("📤 Fetching owner expenses for franchiseId:", franchiseId);

  try {
    const res = await axios.get(`${API}/${franchiseId}`);
    console.log("📥 API Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }

};