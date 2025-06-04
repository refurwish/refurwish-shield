document.addEventListener('DOMContentLoaded', function () {
  const loginSection = document.getElementById('loginSection');
  const warrantySection = document.getElementById('warrantySection');
  const loginForm = document.getElementById('loginForm');
  const loginStoreId = document.getElementById('loginStoreId');
  const loginPassword = document.getElementById('loginPassword');
  const loginLoading = document.getElementById('loginLoading');
  const loginError = document.getElementById('loginError');

  const logoutButton = document.getElementById('logoutButton');
  const displayedStoreId = document.getElementById('displayedStoreId');
  const storeIdInput = document.getElementById('storeId');

  const form = document.getElementById('warrantyForm');
  const loading = document.getElementById('loading');
  const successContainer = document.getElementById('successContainer');
  const errorMessage = document.getElementById('errorMessage');
  const qrcodeDiv = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadLink');
  const pdfLinkSection = document.getElementById('pdfLinkSection');

  const phonePriceInput = document.getElementById('phonePrice');
  const showPlansButton = document.getElementById('showPlansButton');
  const plansContainer = document.getElementById('plansContainer');
  const plansList = document.getElementById('plansList');
  const selectedPlanTypeInput = document.getElementById('selectedPlanType');
  const selectedPlanValueInput = document.getElementById('selectedPlanValue');

  // --- Authentication Logic ---
  function showLogin() {
    loginSection.classList.remove('hidden');
    warrantySection.classList.add('hidden');
  }
  function showWarranty() {
    loginSection.classList.add('hidden');
    warrantySection.classList.remove('hidden');
  }
  function setStoreId(storeId) {
    sessionStorage.setItem('storeId', storeId);
    displayedStoreId.textContent = storeId;
    storeIdInput.value = storeId;
  }

  // Simple login simulation - replace with your real auth
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    loginError.classList.add('hidden');
    loginLoading.classList.remove('hidden');

    const storeId = loginStoreId.value.trim();
    const password = loginPassword.value.trim();

    // Simulate async login
    setTimeout(() => {
      loginLoading.classList.add('hidden');
      // Example: any non-empty storeId & password accepted for demo
      if (storeId && password) {
        setStoreId(storeId);
        showWarranty();
        loginForm.reset();
      } else {
        loginError.classList.remove('hidden');
      }
    }, 1000);
  });

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('storeId');
    showLogin();
  });

  // Auto-login if storeId in sessionStorage
  const storedId = sessionStorage.getItem('storeId');
  if (storedId) {
    setStoreId(storedId);
    showWarranty();
  } else {
    showLogin();
  }

  // --- Pricing Data ---
  // Extended warranty ranges with fixed prices
  const extendedPlans = [
    { label: 'Under ₹15,000', max: 15000, price: 699 },
    { label: '₹15,001 - ₹25,000', min: 15001, max: 25000, price: 799 },
    { label: '₹25,001 - ₹35,000', min: 25001, max: 35000, price: 899 },
    { label: '₹35,001 - ₹45,000', min: 35001, max: 45000, price: 999 },
    { label: '₹45,001 - ₹60,000', min: 45001, max: 60000, price: 1299 },
    { label: '₹60,001 - ₹75,000', min: 60001, max: 75000, price: 1599 },
    { label: '₹75,001 - ₹1,00,000', min: 75001, max: 100000, price: 1999 },
    { label: '₹1,00,001 - ₹1,50,000', min: 100001, max: 150000, price: 2499 },
    { label: '₹1,50,001 - ₹2,00,000', min: 150001, max: 200000, price: 2999 },
    { label: '₹2,00,001 - ₹2,50,000', min: 200001, max: 250000, price: 3499 },
  ];

  // --- Plan Types ---
  // We'll build plan options dynamically when user enters phone price and clicks "Show Plans"

  showPlansButton.addEventListener('click', () => {
    const phonePrice = Number(phonePriceInput.value);
    if (!phonePrice || phonePrice <= 0) {
      alert('Please enter a valid phone price greater than 0.');
      plansContainer.classList.add('hidden');
      plansList.innerHTML = '';
      selectedPlanTypeInput.value = '';
      selectedPlanValueInput.value = '';
      return;
    }

    // Find extended warranty price based on phone price
    let extendedPlan = extendedPlans.find(p => {
      if (p.max && !p.min) return phonePrice <= p.max;
      if (p.min && p.max) return phonePrice >= p.min && phonePrice <= p.max;
      return false;
    });
    if (!extendedPlan) {
      alert('Phone price out of range for extended warranty plans.');
      plansContainer.classList.add('hidden');
      plansList.innerHTML = '';
      selectedPlanTypeInput.value = '';
      selectedPlanValueInput.value = '';
      return;
    }

    const extendedPrice = extendedPlan.price;
    const screenDamagePrice = Math.round(phonePrice * 0.075);
    const totalDamagePrice = Math.round(phonePrice * 0.125);
    const comboScreenPrice = screenDamagePrice + Math.round(extendedPrice * 0.5);
    const comboTotalPrice = totalDamagePrice + Math.round(extendedPrice * 0.5);

    // Clear previous plans
    plansList.innerHTML = '';

    // Create plan buttons
    const plans = [
      { type: 'extended', value: extendedPlan.label, display: `Extended Warranty - ${extendedPlan.label} (₹${extendedPrice})`, price: extendedPrice },
      { type: 'damage', value: 'screen_damage', display: `Screen Damage Plan (7.5% of phone price) - ₹${screenDamagePrice}`, price: screenDamagePrice },
      { type: 'damage', value: 'total_damage', display: `Total Damage Protection Plan (12.5% of phone price) - ₹${totalDamagePrice}`, price: totalDamagePrice },
      { type: 'combo', value: 'combo_screen', display: `Combo Plan (Screen Damage + 50% off Extended Warranty) - ₹${comboScreenPrice}`, price: comboScreenPrice },
      { type: 'combo', value: 'combo_total', display: `Combo Plan (Total Damage + 50% off Extended Warranty) - ₹${comboTotalPrice}`, price: comboTotalPrice }
    ];

    plans.forEach(plan => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = plan.display;
      btn.dataset.type = plan.type;
      btn.dataset.value = plan.value;
      btn.dataset.price = plan.price;
      btn.classList.remove('selected');

      btn.addEventListener('click', () => {
        // Deselect all buttons first
        [...plansList.children].forEach(child => child.classList.remove('selected'));
        btn.classList.add('selected');

        selectedPlanTypeInput.value = plan.type;
        selectedPlanValueInput.value = plan.value;
      });

      plansList.appendChild(btn);
    });

    plansContainer.classList.remove('hidden');
  });

  // --- Form Validation & Submission ---

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'productName',
      'imeiNumber',
      'purchaseDate',
      'phonePrice',
      'selectedPlanType',
      'selectedPlanValue'
    ];

    let isValid = true;
    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        if (el) el.classList.add('error');
        isValid = false;
      } else {
        el.classList.remove('error');
      }
    });

    // Email pattern
    const email = document.getElementById('customerEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
      email.classList.add('error');
      isValid = false;
    }

    if (!isValid) {
      alert('Please fill in all required fields correctly before submitting.');
      return;
    }

    loading.classList.remove('hidden');
    successContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    pdfLinkSection.classList.add('hidden');

    // Append hidden inputs to form data
    // StoreId already included as hidden readonly input
    const formData = new FormData(form);

    fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          document.getElementById('successMessage').textContent = 'Warranty certificate generated successfully!';
          downloadLink.href = data.url;

          qrcodeDiv.innerHTML = '';
          new QRCode(qrcodeDiv, {
            text: data.url,
            width: 150,
            height: 150,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });

          pdfLinkSection.classList.remove('hidden');
          successContainer.classList.remove('hidden');
          form.reset();

          // Re-apply Store ID after reset
          const storeId = sessionStorage.getItem('storeId');
          if (storeId) {
            storeIdInput.value = storeId;
            displayedStoreId.textContent = storeId;
          }
          plansContainer.classList.add('hidden');
          plansList.innerHTML = '';
          selectedPlanTypeInput.value = '';
          selectedPlanValueInput.value = '';

          // Scroll to PDF section
          pdfLinkSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          throw new Error(data.message || 'Unknown error');
        }
      })
      .catch(err => {
        errorMessage.textContent = 'An error occurred: ' + err.message;
        errorMessage.classList.remove('hidden');
      })
      .finally(() => {
        loading.classList.add('hidden');
      });
  });
});
