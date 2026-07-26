import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initContactForm } from './modules/contact-form.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initContactForm();
});
