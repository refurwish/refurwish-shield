document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('warrantyForm');
    const loadingDiv = document.getElementById('loading');
    const successMessageDiv = document.getElementById('successMessage');
    const errorMessageDiv = document.getElementById('errorMessage');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        loadingDiv.classList.remove('hidden');
        successMessageDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');

        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        // Send data to Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbxKKXrVemMkJ2zc0VkWlZ37JSyWIxqML6aDCBCMmzg/dev', {
            method: 'POST',
            mode: 'no-cors', // Required for POST requests to Google Apps Script from a different origin
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => {
            // Google Apps Script will handle the response, no need to parse here for this setup
            loadingDiv.classList.add('hidden');
            successMessageDiv.classList.remove('hidden');
            form.reset(); // Clear the form after successful submission
        })
        .catch(error => {
            console.error('Error sending data:', error);
            loadingDiv.classList.add('hidden');
            errorMessageDiv.classList.remove('hidden');
        });
    });
});
