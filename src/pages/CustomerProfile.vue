<template>
  <div class="profile-container">
    <h2 class="title">My Profile</h2>

    <div v-if="loading" class="loading">Loading profile...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <form
      v-if="!loading && profile"
      @submit.prevent="updateProfile"
      class="profile-card"
    >
      <!-- Profile Image Display -->
      <div class="image-section">
        <img
          :src="previewImage || profile.profilePictureUrl || defaultImage"
          alt="Profile Picture"
          class="profile-img"
        />

        <label class="upload-btn">
          Change Photo
          <input type="file" accept="image/*" @change="onImageSelected" hidden />
        </label>
      </div>

      <!-- Full Name -->
      <label>Full Name</label>
      <input v-model="form.fullName" type="text" required />

      <!-- Email -->
      <label>Email</label>
      <input v-model="form.email" type="email" required />

      <!-- Phone -->
      <label>Phone Number</label>
      <input v-model="form.phonenumber" type="text" required />

      <!-- Address -->
      <label>Address</label>
      <input v-model="form.address" type="text" required />

      <button type="submit" class="save-btn">Save Changes</button>
    </form>
  </div>
</template>

<script>
import api from "../services/customerprofile.js";

export default {
  data() {
    return {
      loading: true,
      error: null,
      profile: null,
      previewImage: null,
      defaultImage: "/default-user.png",

      // Fields must match backend EXACTLY
      form: {
        fullName: "",
        email: "",
        phonenumber: "",
        address: "",
        profileImage: null, // uploading file
      },
    };
  },

  async created() {
    await this.fetchProfile();
  },

  methods: {
    async fetchProfile() {
      try {
        const res = await api.get("/customer/profile");
        this.profile = res.data;

        // populate form
        this.form.fullName = this.profile.fullName;
        this.form.email = this.profile.email;
        this.form.phonenumber = this.profile.phonenumber;
        this.form.address = this.profile.address;
      } catch (err) {
        this.error = "Failed to load profile.";
      } finally {
        this.loading = false;
      }
    },

    onImageSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.form.profileImage = file;
      this.previewImage = URL.createObjectURL(file);
    },

    async updateProfile() {
      try {
        const formData = new FormData();

        // MUST MATCH backend allowed fields
        formData.append("fullName", this.form.fullName);
        formData.append("email", this.form.email);
        formData.append("phonenumber", this.form.phonenumber);
        formData.append("address", this.form.address);

        // MUST match FileInterceptor('profileImage')
        if (this.form.profileImage) {
          formData.append("profileImage", this.form.profileImage);
        }

        const res = await api.patch("/customer/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Profile updated successfully!");

        // Replace with updated customer
        this.profile = res.data.updatedCustomer;
        this.previewImage = null;
      } catch (err) {
        alert("Profile update failed.");
      }
    },
  },
};
</script>

<style>
.profile-container {
  max-width: 450px;
  margin: auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 22px;
}

.profile-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0,0,0,0.1);
}

.image-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  display: inline-block;
  background: #1976D2;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 10px;
  cursor: pointer;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
}

.error {
  color: red;
  text-align: center;
}
</style>
