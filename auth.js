document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');

    // Hide any previous error
    loginError.classList.add('hidden');
    loginError.textContent = '';

    // Show the loading animation
    loginLoading.classList.remove('hidden');

    // Create a new FormData object from the form
    const formData = new FormData(this); // `this` refers to the form being submitted

    // Add the 'action' to the FormData (required by backend)
    formData.append('action', 'verifyLogin');

    // Perform the fetch request using the POST method
    fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading animation
        loginLoading.classList.add('hidden');

        if (data.status === 'success') {
            // Login successful
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('warrantySection').classList.remove('hidden');

            // Auto-fill Store ID in warranty form
            const storeId = formData.get('storeId');
            document.getElementById('storeId').value = storeId;
        } else {
            // Login failed
            loginError.textContent = 'Invalid Store ID or Password';
            loginError.classList.remove('hidden');
        }
    })
    .catch(err => {
        // Hide loading animation
        loginLoading.classList.add('hidden');

        // Show error message
        loginError.textContent = 'An error occurred: ' + err.message;
        loginError.classList.remove('hidden');
    });
});
