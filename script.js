/* =========================================
   NAVIGATION
   ========================================= */
const burger  = document.getElementById('navBurger');
const navMenu = document.getElementById('navMenu');

burger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* =========================================
   COOKIE CONSENT
   ========================================= */
const banner        = document.getElementById('cookieBanner');
const btnAccept     = document.getElementById('cookieAccept');
const btnReject     = document.getElementById('cookieReject');
const COOKIE_KEY    = 'cookieConsent';

function initCookieBanner() {
  if (banner && !localStorage.getItem(COOKIE_KEY)) {
    setTimeout(() => banner.classList.add('show'), 900);
  }
}

function dismissBanner(value) {
  localStorage.setItem(COOKIE_KEY, value);
  if (banner) banner.classList.remove('show');
}

if (btnAccept) btnAccept.addEventListener('click', () => dismissBanner('accepted'));
if (btnReject) btnReject.addEventListener('click', () => dismissBanner('rejected'));

/* =========================================
   CONTACT FORM  (Formspree AJAX + validation)
   ========================================= */
const form = document.getElementById('contactForm');

if (form) {

  /* --- helpers --- */
  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.form-group--error, .form-check--error')
        .forEach(el => el.classList.remove('form-group--error', 'form-check--error'));
  }

  function showError(fieldName, msg) {
    const field = form.elements[fieldName];
    const wrapper = field.closest('.form-group') || field.closest('.form-check');
    const isCheck = wrapper && wrapper.classList.contains('form-check');
    wrapper.classList.add(isCheck ? 'form-check--error' : 'form-group--error');
    const span = document.createElement('span');
    span.className = 'form-error';
    span.textContent = msg;
    wrapper.appendChild(span);
  }

  /* --- clear error on input so it feels responsive --- */
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const wrapper = el.closest('.form-group') || el.closest('.form-check');
      if (!wrapper) return;
      wrapper.classList.remove('form-group--error', 'form-check--error');
      wrapper.querySelectorAll('.form-error').forEach(e => e.remove());
    });
  });

  /* --- submit --- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    const privacy = form.privacy.checked;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;

    if (!name) {
      showError('name', 'Podaj imię i nazwisko');
      valid = false;
    }
    if (!email) {
      showError('email', 'Podaj adres e-mail');
      valid = false;
    } else if (!EMAIL_RE.test(email)) {
      showError('email', 'Podaj prawidłowy adres e-mail');
      valid = false;
    }
    if (!message) {
      showError('message', 'Napisz wiadomość');
      valid = false;
    }
    if (!privacy) {
      showError('privacy', 'Wymagana zgoda na przetwarzanie danych');
      valid = false;
    }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        form.innerHTML = `
          <div class="form-success">
            <strong>Dziękujemy, ${name}!</strong>
            Twoja wiadomość została wysłana. Odpiszemy wkrótce na adres ${email}.
          </div>`;
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'WYŚLIJ WIADOMOŚĆ';
        const data = await res.json().catch(() => ({}));
        const errMsg = data.errors?.map(err => err.message).join(', ')
          || 'Coś poszło nie tak. Spróbuj ponownie lub napisz na hello@drogulski.com';
        alert(errMsg);
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'WYŚLIJ WIADOMOŚĆ';
      alert('Brak połączenia. Spróbuj ponownie.');
    }
  });
}

/* =========================================
   SMOOTH SCROLL OFFSET (for fixed nav)
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h'), 10) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================
   INIT
   ========================================= */
initCookieBanner();
