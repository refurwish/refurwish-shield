document.addEventListener('DOMContentLoaded', function () {
  const warrantyForm = document.getElementById('warrantyForm');
  const loading = document.getElementById('loading');
  const successContainer = document.getElementById('successContainer');
  const errorMessage = document.getElementById('errorMessage');
  const qrcodeDiv = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadLink');
  const pdfLinkSection = document.getElementById('pdfLinkSection');
  const storeIdInput = document.getElementById('storeId');

  const loginForm = document.getElementById('loginForm');
  const loginSection = document.getElementById('loginSection');
  const warrantySection = document.getElementById('warrantySection');
  const mainApp = document.getElementById('mainApp');
  const loginLoading = document.getElementById('loginLoading');
  const loginError = document.getElementById('loginError');
  const logoutButton = document.getElementById('logoutButton');
  const logoutButtonDrawer = document.getElementById('logoutButtonDrawer');
  const displayedStoreId = document.getElementById('displayedStoreId');

  // Handle login
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginLoading.classList.remove('hidden');
    loginError.classList.add('hidden');

    const storeId = document.getElementById('loginStoreId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (storeId && password) {
      // Example hardcoded check - replace with real validation
      if (password === 'admin123') {
        localStorage.setItem('storeId', storeId);
        storeIdInput.value = storeId;
        displayedStoreId.textContent = storeId;

        loginSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
        warrantySection.classList.remove('hidden');
      } else {
        loginError.classList.remove('hidden');
      }
    }

    loginLoading.classList.add('hidden');
  });

  // Handle logout (both buttons)
  function handleLogout() {
    localStorage.clear();
    loginForm.reset();
    warrantyForm.reset();
    document.getElementById('sidebar').classList.add('hidden');
    loginSection.classList.remove('hidden');
    mainApp.classList.add('hidden');
    successContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    pdfLinkSection.classList.add('hidden');
  }

  logoutButton.addEventListener('click', handleLogout);
  logoutButtonDrawer.addEventListener('click', handleLogout);

  // Handle warranty form submission
  warrantyForm.addEventListener('submit', function (e) {
    e.preventDefault();

    loading.classList.remove('hidden');
    successContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    pdfLinkSection.classList.add('hidden');

    const formData = new FormData(warrantyForm);

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
          warrantyForm.reset();

          const storeId = localStorage.getItem('storeId');
          if (storeId) {
            storeIdInput.value = storeId;
          }

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

  // Sidebar Navigation
  window.toggleSidebar = function () {
    document.getElementById("sidebar").classList.toggle("hidden");
  };

  window.showPage = function (pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.getElementById("sidebar").classList.add("hidden");
  };

  // Fetch Submitted Data
  window.fetchSubmittedData = function () {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    google.script.run.withSuccessHandler(displaySubmittedData).getSubmittedData(fromDate, toDate);
  };

  window.displaySubmittedData = function (data) {
    const container = document.getElementById('submittedData');
    if (data && data.length > 0) {
      let tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Product Name</th>
              <th>IMEI Number</th>
              <th>Phone Purchase Date</th>
              <th>Plan Option</th>
              <th>Date Registered</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.forEach(row => {
        tableHtml += `
          <tr>
            <td>${row.customerName}</td>
            <td>${row.productName}</td>
            <td>${row.imeiNumber}</td>
            <td>${row.purchaseDate}</td>
            <td>${row.planOption}</td>
            <td>${row.dateRegistered}</td>
          </tr>
        `;
      });
      tableHtml += `</tbody></table>`;
      container.innerHTML = tableHtml;
    } else {
      container.innerHTML = "<p>No data found for the selected date range.</p>";
    }
  };

  // Fetch Financial Report
  window.fetchFinancialReport = function () {
    const fromDate = document.getElementById('fromDateReport').value;
    const toDate = document.getElementById('toDateReport').value;
    google.script.run.withSuccessHandler(displayFinancialReport).getFinancialReport(fromDate, toDate);
  };

  window.displayFinancialReport = function (data) {
    const container = document.getElementById('financialReport');
    if (data && data.length > 0) {
      let tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Store ID</th>
              <th>Total Sales</th>
              <th>Total Warranty Fees</th>
              <th>Revenue</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.forEach(row => {
        tableHtml += `
          <tr>
            <td>${row.storeId}</td>
            <td>${row.totalSales}</td>
            <td>${row.totalWarrantyFees}</td>
            <td>${row.revenue}</td>
            <td>${row.date}</td>
          </tr>
        `;
      });
      tableHtml += `</tbody></table>`;
      container.innerHTML = tableHtml;
    } else {
      container.innerHTML = "<p>No financial data found for the selected date range.</p>";
    }
  };

  // On page load, check if the user is already logged in
  const storedStoreId = localStorage.getItem('storeId');
  if (storedStoreId) {
    storeIdInput.value = storedStoreId;
    displayedStoreId.textContent = storedStoreId;
    loginSection.classList.add('hidden');
    mainApp.classList.remove('hidden');
    warrantySection.classList.remove('hidden');
  }
});
