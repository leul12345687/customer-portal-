import axios from "axios";

const API_URL = "http://localhost:3000/booking";

export async function createBooking(form, token) {
  try {
    const lang = localStorage.getItem("lang") || "en"; // 👈 dynamic language

    const response = await axios.post(
      `${API_URL}/create`,
      {
        assetName: form.assetName,
        merchantEmail: form.merchantEmail,
        startDate: form.startDate,
        endDate: form.endDate,
        timeInterval: form.timeInterval,
        numberOfProperty: form.numberOfProperty,
        securityDeposit: form.securityDeposit,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": lang, // 👈 CORRECT place for language
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Booking API error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
