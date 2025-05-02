document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('warrantyForm');
    const loadingDiv = document.getElementById('loading');
    const successContainerDiv = document.getElementById('successContainer');
    const successMessageDiv = document.getElementById('successMessage');
    const pdfLinkSectionDiv = document.getElementById('pdfLinkSection');
    const errorMessageDiv = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        loadingDiv.classList.remove('hidden');
        successContainerDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
        pdfLinkSectionDiv.classList.add('hidden');

        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        // Send data to Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbyzBmvuwzh2aytqz6WipjCnnGVa1bS13YlNpWQol3dfvV6Y3IrS8Urw7ZQTIeCxSF2jVw/exec', {
           
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => {
            // Google Apps Script will handle the response, no need to parse here for this setup
            loadingDiv.classList.add('hidden');
            successContainerDiv.classList.remove('hidden');
            form.reset(); // Clear the form after successful submission
            // We'll handle the PDF link in the doPost function's response
        })
        .catch(error => {
            console.error('Error sending data:', error);
            loadingDiv.classList.add('hidden');
            errorMessageDiv.classList.remove('hidden');
        });
    });

    // Listen for the message from the iframe (simulating the Apps Script response)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.status === 'success' && event.data.url) {
            const pdfUrl = event.data.url;
            downloadLink.href = pdfUrl;
            qrcodeDiv.innerHTML = ''; // Clear previous QR code
            new QRCode(qrcodeDiv, pdfUrl);
            pdfLinkSectionDiv.classList.remove('hidden');
        } else if (event.data && event.data.status === 'error') {
            loadingDiv.classList.add('hidden');
            errorMessageDiv.classList.remove('hidden');
            errorMessageDiv.textContent = `An error occurred: ${event.data.message}`;
        }
    });
});
