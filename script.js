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
  const targetUrl = "https://script.google.com/macros/s/AKfycbxeIQVJHnFuL50VpWKuaPuFtYkFVipvBEMjUlMKBH5zYuRxDLPopryDu3XnONOHE5K6/exec";
  
  // Using CORS proxy
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    loadingDiv.classList.remove('hidden');
    successContainerDiv.classList.add('hidden');
    errorMessageDiv.classList.add('hidden');
    pdfLinkSectionDiv.classList.add('hidden');

    // Convert form data to a plain object
    const formData = new FormData(form);
    const formDataObject = Object.fromEntries(formData.entries());

    // Send the POST request to the Apps Script endpoint through the CORS proxy
    fetch(proxyUrl + targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formDataObject)
    })
    .then(response => response.json())  // Expecting a JSON response
    .then(data => {
      loadingDiv.classList.add('hidden');

      if (data.status === 'success') {
        // Display success message and download link
        successContainerDiv.classList.remove('hidden');
        successMessageDiv.textContent = "Warranty certificate generated successfully!";

        // Set the PDF download link
        downloadLink.href = data.url;
        downloadLink.target = "_blank";
        downloadLink.textContent = "View PDF Certificate";

        // Generate a QR code for the PDF link
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
        form.reset();  // Reset the form after successful submission
      } else {
        // Handle error from the response
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
