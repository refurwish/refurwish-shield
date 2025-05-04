// ✅ Define these variables AFTER DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('warrantyForm');
  const loadingDiv = document.getElementById('loading');
  const successContainerDiv = document.getElementById('successContainer');
  const successMessageDiv = document.getElementById('successMessage');
  const pdfLinkSectionDiv = document.getElementById('pdfLinkSection');
  const errorMessageDiv = document.getElementById('errorMessage');
  const qrcodeDiv = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadLink');

  // ✏️ Your script URL
  const targetUrl = "https://script.google.com/macros/s/AKfycbxeRlLUiZ4wIrqZ-5vfK1yqC2SWKLPk5Em0XC_sUrg6px9mEiYVt-yW7o12UrLBBMDw/exec";

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    loadingDiv.classList.remove('hidden');
    successContainerDiv.classList.add('hidden');
    errorMessageDiv.classList.add('hidden');
    pdfLinkSectionDiv.classList.add('hidden');

    // Convert form data to a plain object
    const formData = new FormData(form);
    const formDataObject = Object.fromEntries(formData.entries());

    // Send the POST request to the Apps Script endpoint
    fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formDataObject),
    })
      .then(response => {
        if (response.ok) {
          return response.json(); // Parse the response as JSON if it's a valid response
        } else {
          return response.text(); // If it's not JSON, return it as text (likely an error message)
        }
      })
      .then(data => {
        loadingDiv.classList.add('hidden');

        // If the response was a string (HTML error message), show it as an error
        if (typeof data === 'string') {
          throw new Error(`Error: ${data}`);
        }

        // Handle the response if it's a JSON object
        if (data.status === 'success') {
          successContainerDiv.classList.remove('hidden');
          successMessageDiv.textContent = "Warranty certificate generated successfully!";

          downloadLink.href = data.url;
          downloadLink.target = "_blank";
          downloadLink.textContent = "View PDF Certificate";

          qrcodeDiv.innerHTML = '';
          new QRCode(qrcodeDiv, {
            text: data.url,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });

          pdfLinkSectionDiv.classList.remove('hidden');
          form.reset();
        } else {
          throw new Error(data.message || 'Unknown error occurred.');
        }
      })
      .catch(error => {
        // Handle fetch errors
        console.error('Error:', error);
        loadingDiv.classList.add('hidden');
        errorMessageDiv.classList.remove('hidden');
        errorMessageDiv.textContent = `An error occurred: ${error.message}`;
      });
  });
});
