document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('warrantyForm');
    const loadingDiv = document.getElementById('loading');
    const successContainerDiv = document.getElementById('successContainer');
    const successMessageDiv = document.getElementById('successMessage');
    const pdfLinkSectionDiv = document.getElementById('pdfLinkSection');
    const errorMessageDiv = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Show loading, hide everything else
        loadingDiv.classList.remove('hidden');
        successContainerDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
        pdfLinkSectionDiv.classList.add('hidden');

        // Get form data
        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        // Send POST request to Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbyLNJL-QbCPOAiCoyTJlMEZBZmuHo1w7loBatD5V6FviELPVcTtLY2KrZxnxxxOIwGG/exec', {
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
                // Show success message
                successContainerDiv.classList.remove('hidden');
                successMessageDiv.textContent = "Warranty certificate generated successfully!";

                // Set PDF download link
                downloadLink.href = data.url;
                downloadLink.target = "_blank"; // Open in new tab
                downloadLink.textContent = "View PDF Certificate";

                // Clear and regenerate QR code
                qrcodeDiv.innerHTML = '';
                new QRCode(qrcodeDiv, {
                    text: data.url,
                    width: 150,
                    height: 150,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // Show link and QR
                pdfLinkSectionDiv.classList.remove('hidden');

                // Reset the form
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
