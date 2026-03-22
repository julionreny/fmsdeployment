import axios from "axios";

const API = "https://://franchise-backend-e7hgd6fmfugjdyhn.westeurope-01.azurewebsites.net/api/owner-sales";

export const getOwnerSales = async (franchiseId, month = "") => {
  console.log("📤 Fetching owner sales for franchiseId:", franchiseId);
  try {
    const params = month ? { month } : {};
    const res = await axios.get(`${API}/${franchiseId}`, { params });
    console.log("📥 API Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }
};
