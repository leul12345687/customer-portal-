import axios from "axios";

const API_URL = "https://lmgtech-4.onrender.com"; // or your Render API URL

export async function createBooking(form, token) {
  try {
    const lang = localStorage.getItem("lang") || "en";

    const response = await axios.post(
      `${API_URL}/booking/create`,
      {
        assetName: form.assetName,
        merchantEmail: form.merchantEmail,
        startDate: form.startDate,
        endDate: form.endDate,
        timeInterval: form.timeInterval,
        numberOfProperty: form.numberOfProperty,
        securityDeposit: form.securityDeposit,
        lang: lang,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": lang,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Booking API error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
