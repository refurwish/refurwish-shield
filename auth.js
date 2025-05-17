document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginButton = loginForm.querySelector('.submit-button'); // Get the login button
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Hide any previous error
        loginError.classList.add('hidden');
        loginError.textContent = '';

        // Show the loading animation and hide the login button
        loginLoading.classList.remove('hidden');
        loginButton.classList.add('hidden'); // Hide the login button

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
            // Hide loading animation and show the login button again on completion
            loginLoading.classList.add('hidden');
            loginButton.classList.remove('hidden'); // Show the button again

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
            // Hide loading animation and show the login button again on error
            loginLoading.classList.add('hidden');
            loginButton.classList.remove('hidden'); // Show the button again

            // Show error message
            loginError.textContent = 'An error occurred: ' + err.message;
            loginError.classList.remove('hidden');
        });
    });
});
