const FORM_ID = 'contact-form';
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{2,150}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{8,15}$/;

// Valida un campo individual. Devuelve el mensaje de error o null si es valido.
function validateField(name, value) {
  const trimmed = value.trim();

  if (name === 'name' && !NAME_REGEX.test(trimmed)) {
    return 'Ingresa un nombre valido (solo letras, 2 a 150 caracteres).';
  }
  if (name === 'email' && !EMAIL_REGEX.test(trimmed)) {
    return 'Ingresa un correo electronico valido.';
  }
  if (name === 'phone' && !PHONE_REGEX.test(trimmed.replace(/[\s-]/g, ''))) {
    return 'Ingresa un telefono valido (8 a 15 digitos).';
  }
  if (name === 'locality' && (trimmed.length < 2 || trimmed.length > 150)) {
    return 'Ingresa una localidad valida (2 a 150 caracteres).';
  }
  return null;
}

// Limpia el error visible de un campo ante cualquier interaccion del usuario.
function clearFieldError(field) {
  const errorElement = document.getElementById(`${field.name}-error`);
  field.classList.remove('is-invalid');
  if (errorElement) errorElement.textContent = '';
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(`${field.name}-error`);
  field.classList.add('is-invalid');
  if (errorElement) errorElement.textContent = message;
}

function setFormStatus(statusElement, message, type) {
  statusElement.textContent = message;
  statusElement.className = type ? `form-status form-status--${type}` : 'form-status';
}

// Obtiene un token CSRF nuevo del backend antes de enviar el formulario.
async function getCsrfToken() {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.csrfToken;
}

// Valida todos los campos del formulario. Devuelve los datos y si hay errores.
function validateForm(form) {
  const formData = new FormData(form);
  const payload = {};
  let hasErrors = false;

  form.querySelectorAll('input').forEach((field) => {
    const value = formData.get(field.name) || '';
    payload[field.name] = value;

    const error = validateField(field.name, value);
    if (error) {
      showFieldError(field, error);
      hasErrors = true;
    }
  });

  return { payload, hasErrors };
}

// Envia el formulario al backend con el token CSRF correspondiente.
async function submitContact(payload) {
  const csrfToken = await getCsrfToken();

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'No pudimos enviar tu mensaje.');
  }
}

// Inicializa la validacion y el envio del formulario de contacto.
export function initContactForm() {
  const form = document.getElementById(FORM_ID);
  if (!form) return;

  const statusElement = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');

  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('focus', () => clearFieldError(field));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFormStatus(statusElement, '', '');

    const { payload, hasErrors } = validateForm(form);
    if (hasErrors) return;

    submitButton.disabled = true;
    try {
      await submitContact(payload);
      form.reset();
      setFormStatus(statusElement, 'Gracias, hemos recibido tu mensaje. Te contactaremos pronto.', 'success');
    } catch (error) {
      setFormStatus(statusElement, error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
}
