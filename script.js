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

        loadingDiv.classList.remove('hidden');
        successContainerDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
        pdfLinkSectionDiv.classList.add('hidden');

        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        fetchhttps://script.google.com/macros/s/AKfycbyzBmvuwzh2aytqz6WipjCnnGVa1bS13YlNpWQol3dfvV6Y3IrS8Urw7ZQTIeCxSF2jVw/exec', {
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
                downloadLink.href = data.url;
                qrcodeDiv.innerHTML = '';
                new QRCode(qrcodeDiv, data.url);
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

    });
});
