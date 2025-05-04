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
  const targetUrl = "https://script.google.com/macros/s/AKfycbzZ3yk7IRwEoqAZzMq4vO14f8uGOhl6DPzTxb3JlyKbP95Lbr0i3ZyN3l_Akoon2YCC/exec";
  const proxyUrl = "https://corsproxy.io/?";

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    loadingDiv.classList.remove('hidden');
    successContainerDiv.classList.add('hidden');
    errorMessageDiv.classList.add('hidden');
    pdfLinkSectionDiv.classList.add('hidden');

    const formData = new FormData(form);
    const formDataObject = Object.fromEntries(formData.entries());

    fetch(proxyUrl + encodeURIComponent(targetUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataObject)
    })
    .then(response => response.json())
    .then(data => {
      loadingDiv.classList.add('hidden');

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
      console.error('Error:', error);
      loadingDiv.classList.add('hidden');
      errorMessageDiv.classList.remove('hidden');
      errorMessageDiv.textContent = `An error occurred: ${error.message}`;
    });
  });
});
