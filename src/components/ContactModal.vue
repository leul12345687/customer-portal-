<template>
  <transition name="fade-slide">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-card">
        <header class="modal-header">
          <h3>{{ $t('contactTitle') || 'Contact Us' }}</h3>
          <button class="close-btn" @click="close">✕</button>
        </header>

        <section class="modal-body">
          <p>If you'd like to reach the team by email, fill the form below</p>

          <label>Name</label>
          <input v-model="name" type="text" placeholder="Your name" />

          <label>Your email</label>
          <input v-model="from" type="email" placeholder="you@example.com" />

          <label>Message</label>
          <textarea v-model="message" rows="5" placeholder="Write your message here"></textarea>

          <p class="help">Or send directly to: <strong>{{ supportEmail }}</strong></p>
          <p v-if="success" class="success">{{ success }}</p>
          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        </section>

        <footer class="modal-footer">
          <button class="secondary" @click="copyEmail" :disabled="loading">Copy Email</button>
          <button @click="sendMail" :disabled="loading">{{ loading ? 'Sending...' : 'Send via Email' }}</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../services/api.js';
import * as emailjs from '@emailjs/browser';
import emailjsConfig from '../emailjsConfig.js';

const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const name = ref('');
const from = ref('');
const message = ref('');

const supportEmail = 'leulgebremichael12345678@gmail.com';
const loading = ref(false);
const success = ref('');
const errorMsg = ref('');

const close = () => emit('update:modelValue', false);

const sendMail = async () => {
  errorMsg.value = '';
  success.value = '';
  // Try to send via API first
  loading.value = true;
  try {
    // First try EmailJS (client-side delivery). Ensure you fill src/emailjsConfig.js
    if (emailjsConfig.serviceId && emailjsConfig.publicKey && emailjsConfig.templateId
      && !emailjsConfig.serviceId.includes('YOUR_')) {
      const templateParams = {
        from_name: name.value,
        from_email: from.value,
        message: message.value,
      };
      await emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, templateParams, emailjsConfig.publicKey);
      success.value = 'Message sent successfully (via EmailJS).';
      // clear fields
      name.value = '';
      from.value = '';
      message.value = '';
      setTimeout(() => { close(); }, 1200);
      return;
    }

    // Fallback: try backend API if available
    await api.post('/contact', {
      name: name.value,
      email: from.value,
      message: message.value,
    });
    success.value = 'Message sent successfully.';
    // optionally clear fields
    name.value = '';
    from.value = '';
    message.value = '';
    setTimeout(() => { close(); }, 1200);
  } catch (err) {
    // Fallback: open mail client
    try {
      const subject = encodeURIComponent('Customer Portal Inquiry');
      const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${from.value}\n\n${message.value}`);
      const mailto = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
      close();
    } catch (e) {
      errorMsg.value = 'Failed to send message. Please copy the email and contact us directly.';
    }
  } finally {
    loading.value = false;
  }
};

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(supportEmail);
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = supportEmail;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
};
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:3000 }
.modal-card { width:90%; max-width:600px; background:white; border-radius:10px; box-shadow:0 8px 30px rgba(2,6,23,0.3); overflow:hidden }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #eee }
.modal-body { padding:12px 16px; display:flex; flex-direction:column; gap:8px }
.modal-body input, .modal-body textarea { width:100%; padding:8px 10px; border-radius:6px; border:1px solid #ddd }
.modal-footer { padding:12px 16px; border-top:1px solid #eee; text-align:right; display:flex; gap:8px; justify-content:flex-end }
.modal-footer .secondary { background:transparent; border:1px solid #ccc; padding:8px 12px; border-radius:6px }
.modal-footer button { background:#0c5b6fff; color:white; padding:8px 12px; border-radius:6px; border:none }
.help { margin-top:8px; color:#555; font-size:13px }
.success { margin-top:8px; color:green; font-size:13px }
.error { margin-top:8px; color:#c0392b; font-size:13px }
.close-btn { background:transparent; border:none; font-size:18px; cursor:pointer }
</style>
