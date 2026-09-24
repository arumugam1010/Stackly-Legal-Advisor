// Stackly Legal & Consulting - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  // 2.5 Auth State Synchronization for Navbar
  function syncAuthNavbar() {
    let auth = null; 
    try {
      auth = JSON.parse(localStorage.getItem('stackly_auth'));
    } catch (err) {}

    // Clear legacy auto-init sessions that were generated without explicit user login
    if (auth && !auth.userSignedIn) {
      localStorage.removeItem('stackly_auth');
      auth = null;
    }

    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (auth && auth.isLoggedIn && auth.userSignedIn) {
      const isAdvocate = auth.role === 'advocate';
      const dashUrl = isAdvocate ? 'dashboard-advocate.html' : 'dashboard-client.html';
      const roleBadge = isAdvocate ? 'Advocate' : 'Client';

      // Show Dashboard button only when user has logged in
      navActions.innerHTML = `
        <a href="contact.html" class="btn btn-outline-mint btn-sm">Free Consultation</a>
        <a href="${dashUrl}" class="btn btn-mint btn-sm nav-dashboard-btn" style="display: inline-flex; align-items: center; gap: 6px;" title="Go to ${roleBadge} Dashboard">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Dashboard
        </a>
      `;
    } else {
      // Show Login button when NOT logged in
      navActions.innerHTML = `
        <a href="contact.html" class="btn btn-outline-mint btn-sm">Free Consultation</a>
        <a href="signin.html" class="btn btn-mint btn-sm">Login</a>
      `;
    }

    // Ensure no duplicate Dashboard link inside navMenu
    const existingDashLink = navMenu ? navMenu.querySelector('.mobile-dash-link') : null;
    if (existingDashLink) {
      existingDashLink.remove();
    }
  }

  // Run navbar sync
  syncAuthNavbar();

  // Smart 404 Dashboard Return Handler
  function initSmart404Return() {
    const wrap = document.getElementById('errorActionsWrap');
    if (!wrap) return;

    let auth = null;
    try {
      auth = JSON.parse(localStorage.getItem('stackly_auth'));
    } catch (err) {}

    const isLoggedIn = !!(auth && auth.isLoggedIn && auth.userSignedIn);
    const referrer = (document.referrer || '').toLowerCase();
    const referrerIsDash = referrer.includes('dashboard');
    const sessionFromDash = sessionStorage.getItem('stackly_from_dashboard') === 'true';
    const lastDashUrl = sessionStorage.getItem('stackly_last_dash_url');
    const lastDashTab = sessionStorage.getItem('stackly_last_dash_tab');

    // Show Return to Dashboard if user is logged in AND (came from dashboard OR has active dashboard session)
    const shouldShowDashboard = isLoggedIn && (referrerIsDash || sessionFromDash || sessionStorage.getItem('stackly_from_dashboard') !== 'false');

    if (shouldShowDashboard) {
      const isAdvocate = (auth && auth.role === 'advocate') || referrer.includes('advocate') || (lastDashUrl && lastDashUrl.includes('advocate'));
      let dashTarget = lastDashUrl || (isAdvocate ? 'dashboard-advocate.html' : 'dashboard-client.html');
      if (lastDashTab && !dashTarget.includes('#')) {
        dashTarget += lastDashTab;
      }

      wrap.innerHTML = `
        <a href="${dashTarget}" class="btn btn-outline-mint" id="btnReturnDashboard" title="Return to Dashboard">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Return to Dashboard</span>
        </a>
        <a href="index.html" class="error-sublink-home" id="btnSublinkHome" title="Return to Main Website">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>or Return to Home</span>
        </a>
      `;

      const btnReturnDashboard = document.getElementById('btnReturnDashboard');
      if (btnReturnDashboard) {
        btnReturnDashboard.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = dashTarget;
        });
      }
    } else {
      wrap.innerHTML = `
        <a href="index.html" class="btn btn-outline-mint" id="btnReturnHome" title="Return to Home">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Return to Home</span>
        </a>
      `;
    }
  }

  initSmart404Return();

  // 3. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) {
          otherAnswer.style.maxHeight = null;
        }
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
      }
    });
  });

  // All FAQ items closed by default

  // 4. Featured Services Accordion / Interaction
  const serviceCards = document.querySelectorAll('.service-accordion-item');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // 5. Modals Management (Consultation & Login)
  const consultModal = document.getElementById('consultModal');
  const loginModal = document.getElementById('loginModal');
  const profileModal = document.getElementById('profileModal');

  // Trigger buttons
  document.querySelectorAll('.trigger-consult').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'contact.html';
    });
  });

  document.querySelectorAll('.trigger-login').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'signin.html';
    });
  });

  document.querySelectorAll('.trigger-profile').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.attorney-card');
      const name = card.querySelector('.attorney-name').textContent;
      const role = card.querySelector('.attorney-role').textContent;
      const img = card.querySelector('img').src;

      document.getElementById('profileModalName').textContent = name;
      document.getElementById('profileModalRole').textContent = role;
      document.getElementById('profileModalImg').src = img;
      openModal(profileModal);
    });
  });

  // Close modals
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        closeAllModals();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  function openModal(modal) {
    if (!modal) return;
    closeAllModals();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }

  // 6. Toast Notifications System
  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${type === 'success' ? '✅' : 'ℹ️'}</span>
      <div>
        <p style="font-weight: 600; font-size: 0.9rem; color: #0f172a;">${type === 'success' ? 'Success' : 'Notice'}</p>
        <p style="font-size: 0.825rem; color: #64748b;">${message}</p>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // Input Field Restrictions (Strict: No numbers in Name, No letters in Phone)
  // =========================================================================
  function isNameInput(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    const type = (el.type || 'text').toLowerCase();
    if (['email', 'password', 'checkbox', 'radio', 'hidden', 'tel', 'number', 'submit', 'file'].includes(type)) {
      return false;
    }
    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const placeholder = (el.placeholder || '').toLowerCase();
    return id.includes('name') || name.includes('name') || placeholder.includes('name');
  }

  function isPhoneOrNumberInput(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    const type = (el.type || '').toLowerCase();
    if (type === 'tel' || type === 'number') return true;
    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const placeholder = (el.placeholder || '').toLowerCase();
    return id.includes('phone') || name.includes('phone') || placeholder.includes('phone');
  }

  function showFieldWarning(inputEl, msg) {
    if (!inputEl) return;
    inputEl.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    inputEl.style.borderColor = '#ef4444';
    inputEl.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.18)';

    let parent = inputEl.closest('.form-group') || inputEl.parentElement;
    let hint = parent.querySelector('.field-invalid-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'field-invalid-hint';
      hint.style.cssText = 'color: #dc2626; font-size: 0.76rem; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px; transition: opacity 0.2s ease;';
      parent.appendChild(hint);
    }
    hint.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${msg}`;
    hint.style.display = 'flex';
    hint.style.opacity = '1';

    clearTimeout(inputEl._warnTimer);
    inputEl._warnTimer = setTimeout(() => {
      inputEl.style.borderColor = '';
      inputEl.style.boxShadow = '';
      if (hint) {
        hint.style.opacity = '0';
        setTimeout(() => { if (hint && hint.parentElement) hint.remove(); }, 250);
      }
    }, 2800);
  }

  // 1. Prevent invalid keypress in real-time
  document.addEventListener('keydown', (e) => {
    const el = e.target;
    // Allow keyboard shortcuts and navigation
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      return;
    }

    // Name field: block all digits
    if (isNameInput(el)) {
      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
        showFieldWarning(el, 'Numbers are not allowed in Name');
      }
    }

    // Phone field: block all letters
    if (isPhoneOrNumberInput(el)) {
      if (/[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        showFieldWarning(el, 'Letters are not allowed in Phone Number');
      }
    }
  });

  // 2. Sanitize on input (catches paste, autofill, drag-drop, mobile virtual keyboard)
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (isNameInput(el)) {
      if (/[0-9]/.test(el.value)) {
        el.value = el.value.replace(/[0-9]/g, '');
        showFieldWarning(el, 'Numbers are not allowed in Name');
      }
    }

    if (isPhoneOrNumberInput(el)) {
      if (/[a-zA-Z]/.test(el.value)) {
        el.value = el.value.replace(/[a-zA-Z]/g, '');
        showFieldWarning(el, 'Letters are not allowed in Phone Number');
      }
    }
  });

  // Form Handlers
  const contactPageForm = document.getElementById('contactPageForm');
  if (contactPageForm) {
    contactPageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contactName');
      const phoneInput = document.getElementById('contactPhone');

      if (nameInput && /[0-9]/.test(nameInput.value)) {
        showToast('Please enter a valid name without numbers.');
        showFieldWarning(nameInput, 'Numbers are not allowed in Name');
        nameInput.focus();
        return;
      }

      if (phoneInput && /[a-zA-Z]/.test(phoneInput.value)) {
        showToast('Please enter a valid phone number without letters.');
        showFieldWarning(phoneInput, 'Letters are not allowed in Phone Number');
        phoneInput.focus();
        return;
      }

      showToast('Thank you for contacting Stackly Legal! Your message has been sent successfully.');
      contactPageForm.reset();
    });
  }

  const consultForm = document.getElementById('consultForm');
  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cName = document.getElementById('cName');
      const cPhone = document.getElementById('cPhone');

      if (cName && /[0-9]/.test(cName.value)) {
        showToast('Please enter a valid name without numbers.');
        showFieldWarning(cName, 'Numbers are not allowed in Name');
        cName.focus();
        return;
      }

      if (cPhone && /[a-zA-Z]/.test(cPhone.value)) {
        showToast('Please enter a valid phone number without letters.');
        showFieldWarning(cPhone, 'Letters are not allowed in Phone Number');
        cPhone.focus();
        return;
      }

      closeAllModals();
      showToast('Your consultation request has been submitted! Our legal team will reach out within 2 hours.');
      consultForm.reset();
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeAllModals();
      showToast('Successfully logged in to Stackly Client Portal.');
      loginForm.reset();
    });
  }

  // Newsletter Forms
  document.querySelectorAll('.newsletter-form, #footerSubscribeForm').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        showToast('Thank you for subscribing! You will receive our latest legal updates.');
        input.value = '';
      }
    });
  });

  // 7. Role Card Toggle Interaction
  document.querySelectorAll('.role-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.role-toggle-grid');
      if (parent) {
        parent.querySelectorAll('.role-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });


  // 8. Real-Time Password Criteria Validator (Sign Up)
  const suPass = document.getElementById('suPass');
  if (suPass) {
    suPass.addEventListener('input', () => {
      const val = suPass.value;
      const critLength = document.getElementById('critLength');
      const critNumber = document.getElementById('critNumber');
      const critSpecial = document.getElementById('critSpecial');

      if (critLength) critLength.classList.toggle('met', val.length >= 8);
      if (critNumber) critNumber.classList.toggle('met', /\d/.test(val));
      if (critSpecial) critSpecial.classList.toggle('met', /[!@#$%^&*(),.?":{}|<>]/.test(val));
    });
  }

  // 9. Email & Password Validation Helpers
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).trim());
  }

  function validatePassword(pass) {
    const p = String(pass || '');
    return {
      hasLength: p.length >= 8,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNum: /[0-9]/.test(p),
      hasSym: /[!@#$%^&*(),.?":{}|<>\-_+=\\~`[\]/]/.test(p),
      get isValid() {
        return this.hasLength && this.hasUpper && this.hasLower && this.hasNum && this.hasSym;
      }
    };
  }

  // Live Password Criteria Checker on Sign In Page
  const siPassInput = document.getElementById('siPass');
  const siEmailInput = document.getElementById('siEmail');
  const siEmailErr = document.getElementById('siEmailError');
  const siPassErr = document.getElementById('siPassError');

  if (siPassInput) {
    siPassInput.addEventListener('input', () => {
      const val = siPassInput.value;
      const res = validatePassword(val);

      const critLen = document.getElementById('siCritLen');
      const critUpper = document.getElementById('siCritUpper');
      const critLower = document.getElementById('siCritLower');
      const critNum = document.getElementById('siCritNum');
      const critSym = document.getElementById('siCritSym');
      const strengthBadge = document.getElementById('siPassStrength');

      if (critLen) {
        critLen.classList.toggle('met', res.hasLength);
        critLen.querySelector('.crit-icon').textContent = res.hasLength ? '✓' : '○';
      }
      if (critUpper) {
        critUpper.classList.toggle('met', res.hasUpper);
        critUpper.querySelector('.crit-icon').textContent = res.hasUpper ? '✓' : '○';
      }
      if (critLower) {
        critLower.classList.toggle('met', res.hasLower);
        critLower.querySelector('.crit-icon').textContent = res.hasLower ? '✓' : '○';
      }
      if (critNum) {
        critNum.classList.toggle('met', res.hasNum);
        critNum.querySelector('.crit-icon').textContent = res.hasNum ? '✓' : '○';
      }
      if (critSym) {
        critSym.classList.toggle('met', res.hasSym);
        critSym.querySelector('.crit-icon').textContent = res.hasSym ? '✓' : '○';
      }

      if (strengthBadge) {
        const count = [res.hasLength, res.hasUpper, res.hasLower, res.hasNum, res.hasSym].filter(Boolean).length;
        if (count === 5) {
          strengthBadge.textContent = 'Valid & Strong';
          strengthBadge.style.background = '#d1fae5';
          strengthBadge.style.color = '#065f46';
        } else if (count >= 3) {
          strengthBadge.textContent = `${count}/5 Criteria`;
          strengthBadge.style.background = '#fef3c7';
          strengthBadge.style.color = '#92400e';
        } else {
          strengthBadge.textContent = `${count}/5 Criteria`;
          strengthBadge.style.background = '#e2e8f0';
          strengthBadge.style.color = '#64748b';
        }
      }

      if (res.isValid && siPassErr) {
        siPassErr.style.display = 'none';
      }
    });
  }

  if (siEmailInput && siEmailErr) {
    siEmailInput.addEventListener('input', () => {
      if (validateEmail(siEmailInput.value)) {
        siEmailErr.style.display = 'none';
      }
    });
  }

  // 10. Sign In Form Submission with Strict Validation & Role Routing
  const signInPageForm = document.getElementById('signInPageForm');
  if (signInPageForm) {
    signInPageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = (siEmailInput ? siEmailInput.value : '').trim();
      const password = siPassInput ? siPassInput.value : '';
      let hasError = false;

      // Email Validation
      if (!validateEmail(email)) {
        if (siEmailErr) {
          siEmailErr.textContent = 'Please enter a valid email address (e.g. user@domain.com).';
          siEmailErr.style.display = 'block';
        }
        if (siEmailInput) siEmailInput.focus();
        hasError = true;
      } else if (siEmailErr) {
        siEmailErr.style.display = 'none';
      }

      // Password Validation (8+ chars, upper, lower, num, symbol)
      const passResult = validatePassword(password);
      if (!passResult.isValid) {
        if (siPassErr) {
          siPassErr.textContent = 'Password must meet all 5 requirements (min 8 chars, uppercase, lowercase, number, symbol).';
          siPassErr.style.display = 'block';
        }
        if (!hasError && siPassInput) siPassInput.focus();
        hasError = true;
      } else if (siPassErr) {
        siPassErr.style.display = 'none';
      }

      if (hasError) {
        showToast('Please satisfy both email and password requirements.', 'error');
        return;
      }

      // Selected Role
      const activeRoleBtn = document.querySelector('.role-card-btn.active');
      const role = activeRoleBtn ? activeRoleBtn.dataset.role : 'client';
      const roleDisplayName = role === 'advocate' ? 'Advocate' : 'Client';
      const targetDashboard = role === 'advocate' ? 'dashboard-advocate.html' : 'dashboard-client.html';

      // Save Session
      const sessionData = {
        isLoggedIn: true,
        userSignedIn: true,
        email: email,
        name: email.split('@')[0],
        role: role,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem('stackly_auth', JSON.stringify(sessionData));

      showToast(`Welcome! Authenticated as ${roleDisplayName} (${email}). Redirecting to your Dashboard...`, 'success');

      setTimeout(() => {
        window.location.href = targetDashboard;
      }, 900);
    });
  }

  // 11. Sign Up Page Submission
  const signUpPageForm = document.getElementById('signUpPageForm');
  if (signUpPageForm) {
    signUpPageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('suName');
      const phoneInput = document.getElementById('suPhone');

      if (nameInput && /[0-9]/.test(nameInput.value)) {
        showToast('Please enter a valid name without numbers.', 'error');
        showFieldWarning(nameInput, 'Numbers are not allowed in Name');
        nameInput.focus();
        return;
      }

      if (phoneInput && /[a-zA-Z]/.test(phoneInput.value)) {
        showToast('Please enter a valid phone number without letters.', 'error');
        showFieldWarning(phoneInput, 'Letters are not allowed in Phone Number');
        phoneInput.focus();
        return;
      }

      const email = document.getElementById('suEmail') ? document.getElementById('suEmail').value.trim() : '';
      const p1 = document.getElementById('suPass').value;
      const p2 = document.getElementById('suConfirmPass').value;

      if (!validateEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      const passRes = validatePassword(p1);
      if (!passRes.isValid) {
        showToast('Password must be 8+ chars with uppercase, lowercase, number, and symbol.', 'error');
        return;
      }

      if (p1 !== p2) {
        showToast('Passwords do not match! Please check and retry.', 'error');
        return;
      }

      const name = document.getElementById('suName').value;
      const activeRole = document.querySelector('.role-card-btn.active');
      const roleName = activeRole ? activeRole.dataset.role : 'client';

      // Auto-register session
      localStorage.setItem('stackly_auth', JSON.stringify({
        isLoggedIn: true,
        userSignedIn: true,
        email: email,
        name: name,
        role: roleName,
        loginAt: new Date().toISOString()
      }));

      showToast(`Congratulations ${name}! Account created. Redirecting to your ${roleName.toUpperCase()} Dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = roleName === 'advocate' ? 'dashboard-advocate.html' : 'dashboard-client.html';
      }, 1000);
    });
  }

  // 11. Social Auth Buttons -> Route to 404.html
  document.querySelectorAll('.social-login-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('stackly_from_dashboard', 'false');
      window.location.href = '404.html';
    });
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        navMenu.classList.remove('mobile-open');
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 12. Modern Scroll-Driven Reveal Animations
  const revealTargets = document.querySelectorAll(
    '.practice-card, .why-card, .attorney-card, .case-card, .testimonial-card, .blog-card, .stat-item, .faq-item, .section-header, .about-grid, .cta-banner, .services-feature-grid, .contact-card, .contact-details'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.08
    });

    revealTargets.forEach(el => {
      el.classList.add('reveal-init');
      const siblings = el.parentNode ? Array.from(el.parentNode.children) : [];
      const siblingIndex = siblings.indexOf(el);
      if (siblingIndex >= 0) {
        el.classList.add(`reveal-delay-${(siblingIndex % 4) + 1}`);
      }
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(el => el.classList.add('is-revealed'));
  }

  // 13. Animated Counter for Stats & Metrics (Home, Team, About)
  const counterElements = document.querySelectorAll('.stat-number, .team-metric-number, .team-stat-number, [data-counter]');
  if (counterElements.length > 0) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      counterElements.forEach(el => {
        prepareCounterInitial(el);
        countObserver.observe(el);
      });
    } else if (!prefersReducedMotion) {
      counterElements.forEach(el => animateCounter(el));
    }
  }

  function prepareCounterInitial(el) {
    const rawHTML = el.innerHTML.trim();
    const rawText = el.textContent.trim();
    const targetNum = parseInt(rawText.replace(/[^0-9]/g, ''), 10);
    if (isNaN(targetNum)) return;

    el.dataset.originalHtml = rawHTML;
    el.dataset.targetNum = targetNum;

    const hasPlus = rawText.includes('+');
    const hasPercent = rawText.includes('%');
    const hasSpanPlus = el.querySelector('.plus') !== null;

    if (hasSpanPlus) {
      const spanContent = el.querySelector('.plus').textContent;
      el.innerHTML = `0<span class="plus">${spanContent}</span>`;
    } else {
      el.textContent = '0' + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
    }
  }

  function animateCounter(el) {
    const rawHTML = el.dataset.originalHtml || el.innerHTML.trim();
    const rawText = el.textContent.trim();
    const targetNum = el.dataset.targetNum ? parseInt(el.dataset.targetNum, 10) : parseInt(rawText.replace(/[^0-9]/g, ''), 10);
    if (isNaN(targetNum)) return;

    const hasPlus = rawText.includes('+') || (el.dataset.originalHtml && el.dataset.originalHtml.includes('+'));
    const hasPercent = rawText.includes('%') || (el.dataset.originalHtml && el.dataset.originalHtml.includes('%'));
    const hasSpanPlus = el.dataset.originalHtml && el.dataset.originalHtml.includes('class="plus"');

    let start = 0;
    const duration = 1800; // 1.8s silky smooth count animation
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutExpo for energetic start and gentle deceleration
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (targetNum - start) * ease);
      const formattedNum = targetNum >= 1000 ? current.toLocaleString() : current;

      if (hasSpanPlus) {
        const symbol = hasPercent ? '%' : '+';
        el.innerHTML = `${formattedNum}<span class="plus">${symbol}</span>`;
      } else {
        el.textContent = formattedNum + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.innerHTML = rawHTML;
      }
    }

    requestAnimationFrame(updateCount);
  }

  // 14. Ripple Effect on Buttons
  document.querySelectorAll('.btn, .auth-submit-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = button.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('btn-ripple');

      const existingRipple = button.querySelector('.btn-ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      button.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // Dynamic Ambient Card Spotlight Cursor Tracker
  const interactiveCards = document.querySelectorAll(
    '.practice-card, .why-card, .attorney-card, .team-profile-card, .step-card, .case-card, .testimonial-card, .article-card, .blog-card, .blog-grid-card, .location-card, .contact-info-card, .value-card, .why-pillar-item'
  );

  interactiveCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', '-500px');
      card.style.setProperty('--mouse-y', '-500px');
    });
  });

  // 14. Dashboard Mobile Drawer & User Profile Sync
  const dashMobileToggle = document.getElementById('dashMobileToggle');
  const dashSidebar = document.getElementById('dashSidebar');
  const dashSidebarClose = document.getElementById('dashSidebarClose');
  const dashSidebarOverlay = document.getElementById('dashSidebarOverlay');

  if (dashMobileToggle && dashSidebar) {
    dashMobileToggle.addEventListener('click', () => {
      dashSidebar.classList.add('drawer-open');
      if (dashSidebarOverlay) dashSidebarOverlay.classList.add('active');
    });
  }

  function closeDashSidebar() {
    if (dashSidebar) dashSidebar.classList.remove('drawer-open');
    if (dashSidebarOverlay) dashSidebarOverlay.classList.remove('active');
  }

  if (dashSidebarClose) dashSidebarClose.addEventListener('click', closeDashSidebar);
  if (dashSidebarOverlay) dashSidebarOverlay.addEventListener('click', closeDashSidebar);

  // Forward wheel events on sidebar to main window (Sidebar never scrolls, only page scrolls)
  if (dashSidebar) {
    dashSidebar.addEventListener('wheel', (e) => {
      if (window.innerWidth > 992) {
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    }, { passive: true });
  }

  // Sync dashboard user info
  const dashUserEmail = document.getElementById('dashUserEmail');
  const dashUserName = document.getElementById('dashUserName');
  const dashUserAvatar = document.getElementById('dashUserAvatar');

  let activeSession = null;
  try {
    activeSession = JSON.parse(localStorage.getItem('stackly_auth'));
  } catch (err) {}

  if (activeSession && activeSession.isLoggedIn) {
    if (dashUserEmail) dashUserEmail.textContent = activeSession.email;
    if (dashUserName) dashUserName.textContent = activeSession.name || activeSession.email.split('@')[0];
    if (dashUserAvatar) dashUserAvatar.textContent = (activeSession.name || activeSession.email)[0].toUpperCase();
  }

  // Dashboard Logout triggers
  document.querySelectorAll('.dash-logout-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('stackly_auth');
      showToast('You have been signed out successfully.');
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 500);
    });
  });

  // 15. Dashboard Interactive Tab Switching (Zero 404 Pages)
  const tabTitles = {
    'tab-overview': { title: 'Client Overview', sub: 'Welcome to your personal legal matter workspace' },
    'tab-cases': { title: 'My Active Cases', sub: 'All commercial litigation and advisory matters under active counsel' },
    'tab-consultations': { title: 'Legal Consultations', sub: 'Scheduled strategy meetings and video conferences' },
    'tab-documents': { title: 'Legal Documents', sub: 'Official court briefs, stamped pleadings, and retainer agreements' },
    'tab-messages': { title: 'Attorney Messages', sub: 'Confidential encrypted communications with senior partners' },
    'tab-billing': { title: 'Invoices & Billing', sub: 'Retainer balances, verified time ledgers, and invoice settlements' },
    'tab-team': { title: 'My Legal Team', sub: 'Credentials, direct contact info, and bios of your assigned attorneys' },
    'tab-milestones': { title: 'Case Milestones', sub: 'Real-time litigation stage progression and docket benchmarks' },
    'tab-vault': { title: 'Evidence Vault', sub: '256-bit encrypted repository for confidential client files' },
    'tab-settings': { title: 'Account Settings', sub: 'Client profile preferences, notification alerts, and security' },

    // Advocate Tabs
    'tab-adv-overview': { title: 'Practice Overview', sub: 'Court schedules, docket filings, and client litigation management' },
    'tab-adv-cases': { title: 'Active Case Files', sub: '18 active corporate matters across federal and international jurisdictions' },
    'tab-adv-roster': { title: 'Client Roster', sub: '42 institutional and private equity clients currently under active retainer' },
    'tab-adv-hearings': { title: 'Court Hearings & Calendar', sub: 'Synchronized trial appearance dates, oral arguments, and chambers conferences' },
    'tab-adv-pleadings': { title: 'Pleadings & Briefs', sub: 'Prepared motions, affidavits, and appellate submissions' },
    'tab-adv-messages': { title: 'Client Communications', sub: 'Inquiries, priority flags, and matter updates' },
    'tab-adv-billing': { title: 'Retainers & Billing', sub: 'Managing escrow retainers and verified partner hours' },
    'tab-adv-analytics': { title: 'Practice Analytics', sub: 'Statistical review of trial success, arbitration results, and settlement efficiency' },
    'tab-adv-precedents': { title: 'Legal Precedents', sub: 'Curated landmark authorities for commercial dispute defense' },
    'tab-adv-settings': { title: 'Firm Settings', sub: 'Bar admissions, clerk integration, and firm security controls' }
  };

  function switchDashboardTab(targetId) {
    if (!targetId) return;

    // Find tab pane
    const targetPane = document.getElementById(targetId);
    if (!targetPane) return;

    // Remove active from all tabs in current page
    document.querySelectorAll('.dash-tab-pane').forEach(p => p.classList.remove('active'));
    targetPane.classList.add('active');

    // Update active state on sidebar
    document.querySelectorAll('.dash-nav-link').forEach(link => {
      const isMatch = link.getAttribute('data-tab') === targetId || link.getAttribute('href') === '#' + targetId;
      link.classList.toggle('active', isMatch);
    });

    // Update Topbar Title
    const titleEl = document.getElementById('dashCurrentTitle');
    const subEl = document.getElementById('dashCurrentSub');
    if (tabTitles[targetId]) {
      if (titleEl) titleEl.textContent = tabTitles[targetId].title;
      if (subEl) subEl.textContent = tabTitles[targetId].sub;
    }

    // Update URL hash without jumping
    try {
      history.replaceState(null, null, '#' + targetId);
      sessionStorage.setItem('stackly_last_dash_tab', '#' + targetId);
    } catch (e) {}

    // Close mobile sidebar if open
    closeDashSidebar();

    // Scroll main to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Bind all sidebar nav links & dashboard brand logo with data-tab
  document.querySelectorAll('.dash-nav-link[data-tab], .dash-brand-logo-link[data-tab], .dash-sidebar .nav-brand[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-tab');
      switchDashboardTab(target);
    });
  });

  // Bind intra-dashboard switcher buttons (.switch-tab-trigger)
  document.querySelectorAll('.switch-tab-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-target');
      switchDashboardTab(target);
    });
  });

  // Check initial hash on page load
  const currentHash = window.location.hash.replace('#', '');
  if (currentHash && document.getElementById(currentHash)) {
    switchDashboardTab(currentHash);
  }

  // 16. Interactive Modals (Consultation, Pay Invoice, Draft Motion)
  const bookConsultModal = document.getElementById('bookConsultModal');
  const payInvoiceModal = document.getElementById('payInvoiceModal');
  const draftMotionModal = document.getElementById('draftMotionModal');

  // Book Consultation Modal
  document.querySelectorAll('.trigger-book-consult-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      if (bookConsultModal) bookConsultModal.classList.add('active');
    });
  });

  const closeConsultModalBtn = document.getElementById('closeConsultModalBtn');
  const cancelConsultModalBtn = document.getElementById('cancelConsultModalBtn');
  if (closeConsultModalBtn) closeConsultModalBtn.addEventListener('click', () => bookConsultModal.classList.remove('active'));
  if (cancelConsultModalBtn) cancelConsultModalBtn.addEventListener('click', () => bookConsultModal.classList.remove('active'));

  const consultBookingForm = document.getElementById('consultBookingForm');
  if (consultBookingForm) {
    consultBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('consultDate') ? document.getElementById('consultDate').value : 'selected date';
      const att = document.getElementById('consultAttorneySelect') ? document.getElementById('consultAttorneySelect').value.split('(')[0] : 'your attorney';
      bookConsultModal.classList.remove('active');
      showToast(`Success! Consultation booked with ${att.trim()} on ${date}. Confirmation sent to your email.`, 'success');
      switchDashboardTab('tab-consultations');
    });
  }

  // Pay Invoice Modal
  document.querySelectorAll('.trigger-pay-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      if (payInvoiceModal) payInvoiceModal.classList.add('active');
    });
  });

  const closePayModalBtn = document.getElementById('closePayModalBtn');
  const cancelPayModalBtn = document.getElementById('cancelPayModalBtn');
  if (closePayModalBtn) closePayModalBtn.addEventListener('click', () => payInvoiceModal.classList.remove('active'));
  if (cancelPayModalBtn) cancelPayModalBtn.addEventListener('click', () => payInvoiceModal.classList.remove('active'));

  const invoicePaymentForm = document.getElementById('invoicePaymentForm');
  if (invoicePaymentForm) {
    invoicePaymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      payInvoiceModal.classList.remove('active');
      showToast('Payment of $3,450.00 processed successfully! Official tax receipt #REC-2026-492 generated.', 'success');
      switchDashboardTab('tab-billing');
    });
  }

  // Draft Motion Modal (Advocate)
  document.querySelectorAll('.trigger-draft-motion-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      if (draftMotionModal) draftMotionModal.classList.add('active');
    });
  });

  const closeMotionModalBtn = document.getElementById('closeMotionModalBtn');
  const cancelMotionModalBtn = document.getElementById('cancelMotionModalBtn');
  if (closeMotionModalBtn) closeMotionModalBtn.addEventListener('click', () => draftMotionModal.classList.remove('active'));
  if (cancelMotionModalBtn) cancelMotionModalBtn.addEventListener('click', () => draftMotionModal.classList.remove('active'));

  const motionDraftForm = document.getElementById('motionDraftForm');
  if (motionDraftForm) {
    motionDraftForm.addEventListener('submit', (e) => {
      e.preventDefault();
      draftMotionModal.classList.remove('active');
      showToast('Pleading drafted successfully and submitted to clerk docket repository.', 'success');
      switchDashboardTab('tab-adv-pleadings');
    });
  }

  // 17. Client Interactive Chat
  const chatComposeForm = document.getElementById('chatComposeForm');
  const chatInputText = document.getElementById('chatInputText');
  const chatMessagesFeed = document.getElementById('chatMessagesFeed');

  if (chatComposeForm && chatInputText && chatMessagesFeed) {
    chatComposeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = chatInputText.value.trim();
      if (!txt) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // User Message Bubble
      const userBubble = document.createElement('div');
      userBubble.style.cssText = 'align-self: flex-end; max-width: 75%; background: #52cba5; color: #0f1926; font-weight: 500; padding: 12px 16px; border-radius: 12px 12px 2px 12px; font-size: 0.85rem; animation: dashFadeIn 0.2s ease;';
      userBubble.innerHTML = `${txt}<span style="display: block; font-size: 0.7rem; color: rgba(15, 25, 38, 0.7); margin-top: 4px;">${timeStr}</span>`;
      chatMessagesFeed.appendChild(userBubble);
      chatInputText.value = '';
      chatMessagesFeed.scrollTop = chatMessagesFeed.scrollHeight;

      // Attorney Auto-Response Simulation
      setTimeout(() => {
        const attBubble = document.createElement('div');
        attBubble.style.cssText = 'align-self: flex-start; max-width: 75%; background: #f1f5f9; padding: 12px 16px; border-radius: 12px 12px 12px 2px; font-size: 0.85rem; color: #1e293b; animation: dashFadeIn 0.2s ease;';
        attBubble.innerHTML = `Thank you for the update. Our litigation team has noted this and will review the relevant stipulations. We will update the court record accordingly.<span style="display: block; font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">Just now</span>`;
        chatMessagesFeed.appendChild(attBubble);
        chatMessagesFeed.scrollTop = chatMessagesFeed.scrollHeight;
      }, 1000);
    });
  }

  // Advocate Chat Form
  const advChatForm = document.getElementById('advChatForm');
  const advChatInput = document.getElementById('advChatInput');
  if (advChatForm && advChatInput) {
    advChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = advChatInput.value.trim();
      if (!txt) return;
      showToast(`Reply sent to General Counsel: "${txt}"`, 'success');
      advChatInput.value = '';
    });
  }

  // Vault File Upload Dropzone
  const vaultDropZone = document.getElementById('vaultDropZone');
  const vaultFileInput = document.getElementById('vaultFileInput');
  if (vaultDropZone && vaultFileInput) {
    vaultDropZone.addEventListener('click', () => vaultFileInput.click());
    vaultFileInput.addEventListener('change', () => {
      if (vaultFileInput.files && vaultFileInput.files.length > 0) {
        const fname = vaultFileInput.files[0].name;
        showToast(`Encrypting & uploading ${fname} with AES-256... File secured in Evidence Vault!`, 'success');
      }
    });
  }

  // Client Settings Form
  const clientSettingsForm = document.getElementById('clientSettingsForm');
  if (clientSettingsForm) {
    clientSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('setClientName') ? document.getElementById('setClientName').value.trim() : 'Saravanan';
      const newEmail = document.getElementById('setClientEmail') ? document.getElementById('setClientEmail').value.trim() : 'client@stackly.com';

      // Update session
      try {
        const auth = JSON.parse(localStorage.getItem('stackly_auth')) || {};
        auth.name = newName;
        auth.email = newEmail;
        localStorage.setItem('stackly_auth', JSON.stringify(auth));
      } catch (e) {}

      if (dashUserName) dashUserName.textContent = newName;
      if (dashUserEmail) dashUserEmail.textContent = newEmail;

      showToast('Profile & security preferences saved successfully!', 'success');
    });
  }

  // Advocate Settings Form
  const advSettingsForm = document.getElementById('advSettingsForm');
  if (advSettingsForm) {
    advSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Advocate practice credentials and jurisdiction settings updated.', 'success');
    });
  }

  // 18. Protected Dashboard Route: Redirect to signin if user is not signed in
  if (document.body.classList.contains('dash-body')) {
    let auth = null;
    try {
      auth = JSON.parse(localStorage.getItem('stackly_auth'));
    } catch (err) {}
    if (!auth || !auth.isLoggedIn || !auth.userSignedIn) {
      localStorage.removeItem('stackly_auth');
      window.location.href = 'signin.html';
      return;
    }

    // Active Dashboard Session Tracking
    sessionStorage.setItem('stackly_from_dashboard', 'true');
    const isAdv = window.location.pathname.includes('advocate');
    sessionStorage.setItem('stackly_last_dash_url', isAdv ? 'dashboard-advocate.html' : 'dashboard-client.html');
  }

  // 19. Across about.html, blog.html, contact.html, index.html, services.html, team.html & Dashboards:
  // Any button outside Navbar and Footer routes to 404.html ("nav and footer aa thavira entha button click panalum 404 page ku ponum")
  document.addEventListener('click', (e) => {
    // Exclude auth pages (signin.html, signup.html) so login & signup work properly
    if (document.body.classList.contains('auth-page-body') || document.querySelector('.auth-layout')) {
      return;
    }

    // Exclude 404 error page itself
    if (e.target.closest('.error-page-wrapper') || e.target.closest('.full-screen-404')) {
      return;
    }

    // 1. Allow Header / Navbar (Brand logo, Menu links, Action buttons, Mobile hamburger toggle)
    if (
      e.target.closest('header') ||
      e.target.closest('.site-header') ||
      e.target.closest('.navbar') ||
      e.target.closest('nav') ||
      e.target.closest('.nav-actions') ||
      e.target.closest('.nav-menu') ||
      e.target.closest('.mobile-menu-btn') ||
      e.target.closest('.nav-toggle')
    ) {
      return;
    }

    // 2. Allow Footer (Quick links, practice links, social icons, newsletter, copyright)
    if (e.target.closest('footer') || e.target.closest('.site-footer')) {
      return;
    }

    // 3. In Dashboards, allow Sidebar navigation (all 10 tabs, logo, logout)
    if (e.target.closest('.dash-sidebar')) {
      return;
    }

    // 4. In Topbar on dashboards, allow Home link and mobile drawer toggle
    if (e.target.closest('.dash-mobile-toggle')) {
      return;
    }
    const homeLink = e.target.closest('a');
    if (homeLink && (homeLink.getAttribute('href') === 'index.html' || homeLink.getAttribute('href') === '/')) {
      sessionStorage.setItem('stackly_from_dashboard', 'false');
      return;
    }

    // 5. Allow FAQ accordion questions to toggle open/close
    if (e.target.closest('.faq-question')) {
      return;
    }

    // 6. Catch ANY other button, button-link, action item, or form submit outside navbar & footer
    const actionTarget = e.target.closest(
      'button, .btn, a[class*="btn"], .link-arrow, .dash-action-item, .switch-tab-trigger, .trigger-consult, input[type="submit"], input[type="button"], .blog-read-more, .service-btn, .action-link'
    );

    if (actionTarget) {
      // Do not block sidebar close button
      if (actionTarget.classList.contains('dash-sidebar-close')) return;

      e.preventDefault();
      e.stopPropagation();

      // Track if navigating to 404 from dashboard vs public website
      if (document.body.classList.contains('dash-body') || window.location.pathname.includes('dashboard')) {
        sessionStorage.setItem('stackly_from_dashboard', 'true');
        const isAdv = window.location.pathname.includes('advocate');
        sessionStorage.setItem('stackly_last_dash_url', isAdv ? 'dashboard-advocate.html' : 'dashboard-client.html');
      } else {
        sessionStorage.setItem('stackly_from_dashboard', 'false');
      }

      window.location.href = '404.html';
    }
  }, true);
});

// Global Password Visibility Toggle
window.togglePassVisibility = function(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.getAttribute('type') === 'password';
  input.setAttribute('type', isPass ? 'text' : 'password');

  // Toggle eye icon inside parent button
  const eyeBtn = input.parentElement.querySelector('.input-toggle-eye');
  if (eyeBtn) {
    eyeBtn.innerHTML = isPass
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
           <line x1="1" y1="1" x2="23" y2="23"></line>
         </svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
           <circle cx="12" cy="12" r="3"></circle>
         </svg>`;
  }
};

