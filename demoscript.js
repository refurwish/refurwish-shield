document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('warrantyForm');
  const loading = document.getElementById('loading');
  const successContainer = document.getElementById('successContainer');
  const errorMessage = document.getElementById('errorMessage');
  const qrcodeDiv = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadLink');
  const pdfLinkSection = document.getElementById('pdfLinkSection');
  const storeIdInput = document.getElementById('storeId');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

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
