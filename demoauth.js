document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const warrantySection = document.getElementById('warrantySection');
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');
    const loginButton = loginForm.querySelector('.submit-button');
    const displayedStoreId = document.getElementById('displayedStoreId');
    const storeIdInput = document.getElementById('storeId');
    const logoutButton = document.getElementById('logoutButton'); // This is the logout button on the form
    const warrantyForm = document.getElementById('warrantyForm');

    // Function to handle showing/hiding sections with animations
    function showSection(sectionToShow, sectionToHide) {
        if (sectionToHide) {
            sectionToHide.classList.remove('visible');
            // Give CSS time to run fade-out animation before hiding completely
            setTimeout(() => {
                sectionToHide.classList.add('hidden');
                sectionToShow.classList.remove('hidden');
                setTimeout(() => sectionToShow.classList.add('visible'), 10); // Animate in
            }, 400); // Match CSS transition duration
        } else {
            // Initial load case for login section if no session
            sectionToShow.classList.remove('hidden');
            setTimeout(() => sectionToShow.classList.add('visible'), 10);
        }
    }

    // Restore session if storeId is saved
    const savedStoreId = sessionStorage.getItem('storeId');
    if (savedStoreId) {
        loginSection.classList.add('hidden'); // Immediately hide login section on initial load
        warrantySection.classList.remove('hidden');
        warrantySection.classList.add('visible'); // Show warranty section with animation
        storeIdInput.value = savedStoreId;
        displayedStoreId.textContent = savedStoreId;

        // ***** ADD THIS LINE *****
        if (window.postLoginSetup) {
            window.postLoginSetup(savedStoreId);
        }
        // *************************

    } else {
        // If no saved session, ensure login section is visible on load
        showSection(loginSection);
    }

    // Handle login
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        loginError.classList.remove('visible'); // Hide any previous error
        loginError.classList.add('hidden');

        loginLoading.classList.remove('hidden'); // Show loading
        setTimeout(() => loginLoading.classList.add('visible'), 10);
        loginButton.classList.add('hidden'); // Hide button

        const formData = new FormData(loginForm);
        formData.append('action', 'verifyLogin');

        fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', { // <-- MAKE SURE THIS IS YOUR login script URL
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loginLoading.classList.remove('visible'); // Hide loading
                loginLoading.classList.add('hidden');
                loginButton.classList.remove('hidden'); // Show button again in case of error

                if (data.status === 'success') {
                    const storeId = formData.get('storeId');
                    sessionStorage.setItem('storeId', storeId);

                    storeIdInput.value = storeId;
                    displayedStoreId.textContent = storeId;

                    showSection(warrantySection, loginSection); // Animate transition

                    // ***** ADD THIS LINE *****
                    if (window.postLoginSetup) {
                        window.postLoginSetup(storeId);
                    }
                    // *************************

                } else {
                    loginError.textContent = 'Invalid Store ID or Password';
                    loginError.classList.remove('hidden');
                    setTimeout(() => loginError.classList.add('visible'), 10); // Animate error in
                }
            })
            .catch(err => {
                loginLoading.classList.remove('visible');
                loginLoading.classList.add('hidden');
                loginButton.classList.remove('hidden');
                loginError.textContent = 'An error occurred: ' + err.message;
                loginError.classList.remove('hidden');
                setTimeout(() => loginError.classList.add('visible'), 10);
            });
    });

    // Handle logout
    logoutButton.addEventListener('click', () => { // This is the logout button in your original form
        // Clear session storage
        sessionStorage.removeItem('storeId');

        // Reset forms (manual reset for mobile autofill issues)
        loginForm.reset();
        warrantyForm.reset();

        // Manually clear the form fields to prevent autofill issues on mobile
        document.getElementById('loginStoreId').value = '';
        document.getElementById('loginPassword').value = '';
        storeIdInput.value = '';
        displayedStoreId.textContent = '';

        // Switch views with animation
        showSection(loginSection, warrantySection);
        // Ensure login form is in its initial state (no loading/error messages)
        loginError.classList.add('hidden');
        loginError.classList.remove('visible');
        loginLoading.classList.add('hidden');
        loginLoading.classList.remove('visible');
        loginButton.classList.remove('hidden'); // Ensure login button is visible

        // ***** ADD THIS BLOCK if the drawer's logout button is DIFFERENT than this one in demoauth.js ******
        // This is necessary if you have two logout buttons and want them both to trigger the same logic.
        // If the drawer's logout button has a different ID or is handled separately,
        // you might need to ensure its click also resets the UI state here.
        // For simplicity, let's assume the drawer's logout button `id="logoutButton"` now.
        // The demoscript.js will add its own listener to this same ID.
        // If your original logout button for `demoauth.js` had a different ID than the one in the drawer,
        // you would need to adjust the HTML or unify the IDs.
        // In the HTML I provided, the *only* logout button is the one in the drawer with `id="logoutButton"`.
        // So, this listener in demoauth.js will now fire when the drawer button is clicked.
        // ****************************************************************************************************
    });
});
