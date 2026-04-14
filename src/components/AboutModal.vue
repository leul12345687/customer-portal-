<template>
  <transition name="fade-slide">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-card">
        <header class="modal-header">
          <h3>{{ $t('aboutTitle') || 'About this system' }}</h3>
          <button class="close-btn" @click="close">✕</button>
        </header>

        <section class="modal-body">
          <p>
            This customer portal allows users to register, book properties,
            and manage their bookings. It includes authentication, booking
            management, and multilingual support.
          </p>
          <p>
            For more details or feature requests, please use the Contact
            button to reach the team.
          </p>
        </section>

        <footer class="modal-footer">
          <button @click="close">OK</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

const close = () => emit('update:modelValue', false);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-card {
  width: 90%;
  max-width: 560px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.3);
  overflow: hidden;
}
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #eee }
.modal-body { padding:16px; color:#333 }
.modal-footer { padding:12px 16px; border-top:1px solid #eee; text-align:right }
.close-btn { background:transparent; border:none; font-size:18px; cursor:pointer }
.modal-footer button { background:#0c5b6fff; color:white; padding:8px 12px; border-radius:6px; border:none }
</style>
