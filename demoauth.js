document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const loginSection = document.getElementById('loginSection');
  const warrantySection = document.getElementById('warrantySection');
  const loginError = document.getElementById('loginError');
  const loginLoading = document.getElementById('loginLoading');
  const loginButton = loginForm.querySelector('.submit-button');
  const displayedStoreId = document.getElementById('displayedStoreId');
  const storeIdInput = document.getElementById('storeId');
  const logoutButton = document.getElementById('logoutButton');
  const warrantyForm = document.getElementById('warrantyForm');
  const getReportButton = document.getElementById('getReportButton');
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');
  
  // Restore session if storeId is saved
  const savedStoreId = sessionStorage.getItem('storeId');
  if (savedStoreId) {
    loginSection.classList.add('hidden');
    warrantySection.classList.remove('hidden');
    storeIdInput.value = savedStoreId;
    displayedStoreId.textContent = savedStoreId;
  }

  // Handle login
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    loginError.classList.add('hidden');
    loginError.textContent = '';
    loginLoading.classList.remove('hidden');
    loginButton.classList.add('hidden');

    const formData = new FormData(loginForm);
    formData.append('action', 'verifyLogin');

    fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        loginLoading.classList.add('hidden');
        loginButton.classList.remove('hidden');

        if (data.status === 'success') {
          const storeId = formData.get('storeId');
          sessionStorage.setItem('storeId', storeId);

          loginSection.classList.add('hidden');
          warrantySection.classList.remove('hidden');
          storeIdInput.value = storeId;
          displayedStoreId.textContent = storeId;
        } else {
          loginError.textContent = 'Invalid Store ID or Password';
          loginError.classList.remove('hidden');
        }
      })
      .catch(err => {
        loginLoading.classList.add('hidden');
        loginButton.classList.remove('hidden');
        loginError.textContent = 'An error occurred: ' + err.message;
        loginError.classList.remove('hidden');
      });
  });

  // Handle logout
  logoutButton.addEventListener('click', () => {
    // Clear session storage
    sessionStorage.removeItem('storeId');

    // Reset forms (manual reset for mobile autofill issues)
    loginForm.reset();
    warrantyForm.reset();

    // Manually clear the form fields to prevent autofill issues on mobile
    document.getElementById('loginStoreId').value = '';
    document.getElementById('loginPassword').value = '';
    storeIdInput.value = '';
    displayedStoreId.textContent = '';

    // Switch views
    warrantySection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });

  // Handle report generation based on date range
  getReportButton.addEventListener('click', function () {
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    // Check if both dates are provided
    if (!fromDate || !toDate) {
      alert('Please select both "From Date" and "To Date"!');
      return;
    }

    const formData = new FormData();
    formData.append('action', 'generateReport');
    formData.append('storeId', storeIdInput.value);
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);

    // Show loading spinner while fetching data
    const loadingMessage = document.getElementById('loading');
    loadingMessage.classList.remove('hidden');

    fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        loadingMessage.classList.add('hidden');

        if (data.status === 'success') {
          // Process the report data (you may need to customize this part)
          alert('Report generated successfully!');
        } else {
          alert('Error generating report: ' + data.message);
        }
      })
      .catch(err => {
        loadingMessage.classList.add('hidden');
        alert('An error occurred: ' + err.message);
      });
  });
});
