<template>
  <div class="profile-wrapper">
    <div class="profile-card">
      <h2>My Profile</h2>

      <p v-if="loading" class="loading-text">Loading profile...</p>
      <p v-if="error" class="error-text">{{ error }}</p>

      <form v-if="!loading && profile" @submit.prevent="updateProfile" class="profile-form">
        <!-- Profile Image -->
        <div class="image-section">
          <img :src="previewImage || profile.profilePictureUrl || defaultImage" class="profile-img" alt="Profile Photo" />
          <label class="upload-btn">
            Change Photo
            <input type="file" accept="image/*" hidden @change="onImageSelected" />
          </label>
        </div>

        <!-- Full Name -->
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" v-model="form.fullName" required />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" required />
        </div>

        <!-- Phone -->
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" v-model="form.phonenumber" required />
        </div>

        <!-- Address -->
        <div class="form-group">
          <label>Address</label>
          <input type="text" v-model="form.address" required />
        </div>

        <button type="submit" class="save-btn" :disabled="updating">
          <span v-if="updating">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </form>

      <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import api from "../services/api.js";

export default {
  data() {
    return {
      loading: true,
      updating: false,
      error: null,
      profile: null,
      previewImage: null,
      successMessage: "",
      defaultImage: "/default-user.png",
      form: {
        fullName: "",
        email: "",
        phonenumber: "",
        address: "",
        profileImage: null,
      },
    };
  },

  async created() {
    await this.fetchProfile();
  },

  methods: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get("/customer/profile");
        this.profile = res.data;

        // Prefill form
        this.form.fullName = this.profile.fullName;
        this.form.email = this.profile.email;
        this.form.phonenumber = this.profile.phonenumber;
        this.form.address = this.profile.address;
      } catch (err) {
        this.error = err.response?.data?.message || "Unable to load profile.";
      } finally {
        this.loading = false;
      }
    },

    onImageSelected(e) {
      const file = e.target.files[0];
      if (!file) return;

      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        this.error = "Only JPG, JPEG, or PNG images are allowed!";
        return;
      }

      this.form.profileImage = file;
      this.previewImage = URL.createObjectURL(file);
      this.error = null;
    },

    async updateProfile() {
      this.updating = true;
      this.error = null;
      this.successMessage = "";

      try {
        const formData = new FormData();
        formData.append("fullName", this.form.fullName);
        formData.append("email", this.form.email);
        formData.append("phonenumber", this.form.phonenumber);
        formData.append("address", this.form.address);
        if (this.form.profileImage) formData.append("profileImage", this.form.profileImage);

        const res = await api.patch("/customer/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.successMessage = res.data?.message || "Profile updated successfully!";
        this.profile = res.data.updatedCustomer;
        this.previewImage = null;

        // Reset form image
        this.form.profileImage = null;
      } catch (err) {
        this.error = err.response?.data?.message || "Profile update failed.";
      } finally {
        this.updating = false;
      }
    },
  },
};
</script>


<style scoped>
/* ========================= WRAPPER ========================= */
.profile-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 16px;
  background: white;
}

/* ========================= CARD ========================= */
.profile-card {
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.3s ease-out;
}

.profile-card h2 {
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 22px;
}

/* ========================= IMAGE ========================= */
.image-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d1d9e6;
}

.upload-btn {
  display: inline-block;
  margin-top: 10px;
  background: #1976d2;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

/* ========================= FORM ========================= */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
}

.form-group input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #c7d1e0;
  font-size: 15px;
  transition: 0.25s ease-in-out;
}

.form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  outline: none;
}

/* ========================= BUTTON ========================= */
.save-btn {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.save-btn:hover {
  background: #1d4ed8;
}

.save-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* ========================= MESSAGES ========================= */
.success-msg {
  margin-top: 15px;
  text-align: center;
  color: #10b981;
  font-weight: 600;
}

.error-text {
  text-align: center;
  color: #dc2626;
}

/* ========================= ANIMATION ========================= */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
  }
}
</style>
