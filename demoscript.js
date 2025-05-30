document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('warrantyForm');
  const loading = document.getElementById('loading');
  const successContainer = document.getElementById('successContainer');
  const errorMessage = document.getElementById('errorMessage');
  const qrcodeDiv = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadLink');
  const pdfLinkSection = document.getElementById('pdfLinkSection');
  const storeIdInput = document.getElementById('storeId');

  const planType = document.getElementById('planType');
  const planOption = document.getElementById('planOption');

  // Define plan option groups
  const planOptionsMap = {
    extended: [
      { value: 'under_15000', text: 'Under ₹15,000 (₹699)', price: 699 },
      { value: '15001_25000', text: '₹15,001 - ₹25,000 (₹799)', price: 799 },
      { value: '25001_35000', text: '₹25,001 - ₹35,000 (₹899)', price: 899 },
      { value: '35001_45000', text: '₹35,001 - ₹45,000 (₹999)', price: 999 },
      { value: '45001_60000', text: '₹45,001 - ₹60,000 (₹1299)', price: 1299 },
      { value: '60001_75000', text: '₹60,001 - ₹75,000 (₹1599)', price: 1599 },
      { value: '75001_100000', text: '₹75,001 - ₹1,00,000 (₹1999)', price: 1999 },
      { value: '100001_150000', text: '₹1,00,001 - ₹1,50,000 (₹2499)', price: 2499 },
      { value: '150001_200000', text: '₹1,50,001 - ₹2,00,000 (₹2999)', price: 2999 },
      { value: '200001_250000', text: '₹2,00,001 - ₹2,50,000 (₹3499)', price: 3499 },
    ],
    damage: [
      { value: 'plan_a', text: 'Plan A', price: 500 },
      { value: 'plan_b', text: 'Plan B', price: 1000 },
      { value: 'plan_c', text: 'Plan C', price: 1500 },
    ],
    combo: [
      { value: 'combo_1', text: 'Combo Plan 1', price: 2000 },
      { value: 'combo_2', text: 'Combo Plan 2', price: 3000 },
      { value: 'combo_3', text: 'Combo Plan 3', price: 4000 },
    ]
  };

  // Handle plan type change
  planType.addEventListener('change', function () {
    const selectedType = planType.value;
    planOption.innerHTML = '<option value="">-- Select Plan Option --</option>';

    if (planOptionsMap[selectedType]) {
      planOptionsMap[selectedType].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        opt.setAttribute('data-price', option.price);
        planOption.appendChild(opt);
      });
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // ====== VALIDATION LOGIC ======
    let isValid = true;
    const requiredFields = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'productName',
      'imeiNumber',
      'purchaseDate',
      'planType',
      'planOption'
    ];

    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    });

    // Simple email validation
    const email = document.getElementById('customerEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
      email.classList.add('error');
      isValid = false;
    }

    if (!isValid) {
      alert('Please fill in all required fields correctly before submitting.');
      return; // stop submission
    }

    // ====== SUBMISSION LOGIC ======
    loading.classList.remove('hidden');
    successContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    pdfLinkSection.classList.add('hidden');

    const formData = new FormData(form);

    fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          document.getElementById('successMessage').textContent = 'Warranty certificate generated successfully!';
          downloadLink.href = data.url;
          qrcodeDiv.innerHTML = '';
          new QRCode(qrcodeDiv, {
            text: data.url,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });

          pdfLinkSection.classList.remove('hidden');
          successContainer.classList.remove('hidden');
          form.reset();

          // Re-apply store ID after reset
          const storeId = sessionStorage.getItem('storeId');
          if (storeId) {
            storeIdInput.value = storeId;
          }

          // Scroll into view
          pdfLinkSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          throw new Error(data.message || 'Unknown error');
        }
      })
      .catch(error => {
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = 'An error occurred: ' + error.message;
      })
      .finally(() => {
        loading.classList.add('hidden');
      });
  });
});
