document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('warrantyForm');
  const loading = document.getElementById('loading');
  const successContainer = document.getElementById('successContainer');
  const errorMessage = document.getElementById('errorMessage');
  const qrcodeDiv = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadLink');
  const pdfLinkSection = document.getElementById('pdfLinkSection');
  const storeIdInput = document.getElementById('storeId');
  
  // Date range input fields
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');

  // Make sure to include the fromDate and toDate inputs in your form HTML
  // <input type="date" id="fromDate" name="fromDate" required />
  // <input type="date" id="toDate" name="toDate" required />

  // Handle opening and closing of the date range drawer
  document.getElementById("openDrawerButton").addEventListener("click", function() {
    document.getElementById("dateRangeDrawer").style.display = "flex";
  });

  document.getElementById("closeDrawerButton").addEventListener("click", function() {
    document.getElementById("dateRangeDrawer").style.display = "none";
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    loading.classList.remove('hidden');
    successContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    pdfLinkSection.classList.add('hidden');

    const formData = new FormData(form);

    // Collecting fromDate and toDate from input fields
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    // Add these dates into the form data
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);

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

  // Function to fetch and display data based on date range
  function fetchReportData() {
    const storeId = storeIdInput.value;
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    if (!storeId || !fromDate || !toDate) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Please provide all required inputs (store ID, from date, and to date).';
      return;
    }

    // Collect data to send in the request
    const formData = new FormData();
    formData.append('storeId', storeId);
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);

    // Make a POST request to fetch data for the date range
    fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec?action=getReport', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Process and display the report data here (for example, in a table or list)
          console.log(data); // Displaying data in the console for now
          // You can display the data here based on your UI design
          // For example, display the data in a table or another UI component
        } else {
          throw new Error(data.message || 'Unknown error');
        }
      })
      .catch(error => {
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = 'An error occurred while fetching the report: ' + error.message;
      });
  }

  // Trigger fetching report data when the user selects the date range
  const reportButton = document.getElementById('getReportButton');
  if (reportButton) {
    reportButton.addEventListener('click', fetchReportData);
  }
});
