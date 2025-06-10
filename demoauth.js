document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const warrantySection = document.getElementById('warrantySection');
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');
    const loginButton = loginForm.querySelector('.submit-button');
    const displayedStoreId = document.getElementById('displayedStoreId'); // Main section store ID display
    const storeIdInput = document.getElementById('storeId');
    const warrantyForm = document.getElementById('warrantyForm');

    // NEW ELEMENTS FOR HAMBURGER MENU & DRAWER (IDs updated to match demoindex.html)
    const hamburgerMenu = document.getElementById('hamburgerMenu'); // Corrected ID
    const mainDrawer = document.getElementById('mainDrawer');
    const drawerCloseButton = document.getElementById('drawerCloseButton'); // Corrected ID
    const logoutButtonDrawer = document.getElementById('logoutButtonDrawer'); // Corrected ID for logout button in drawer
    const drawerDisplayedStoreId = document.getElementById('drawerDisplayedStoreId'); // New: To display store ID in drawer
    const drawerOverlay = document.getElementById('drawerOverlay'); // Reference to the overlay

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
        drawerDisplayedStoreId.textContent = savedStoreId; // Set store ID in drawer
        hamburgerMenu.style.display = 'block'; // Show hamburger icon after successful session restore
    } else {
        // If no saved session, ensure login section is visible on load
        showSection(loginSection);
        hamburgerMenu.style.display = 'none'; // Ensure hidden on login page
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
        formData.append('action', 'verifyStoreLogin'); // <-- RENAMED HERE!

        // IMPORTANT: This URL is for your separate login App Script.
        fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
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
                    drawerDisplayedStoreId.textContent = storeId; // Set store ID in drawer

                    showSection(warrantySection, loginSection); // Animate transition
                    hamburgerMenu.style.display = 'block'; // Show hamburger icon after successful login
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

    // Handle logout (moved to drawer and using its ID)
    logoutButtonDrawer.addEventListener('click', () => {
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
        drawerDisplayedStoreId.textContent = ''; // Clear store ID in drawer

        // Close drawer if open (this should ideally be handled by demoscript's closeDrawer function)
        // For simplicity, we directly hide here for immediate effect
        mainDrawer.classList.remove('open'); 
        drawerOverlay.classList.remove('visible');
        drawerOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // Allow body scrolling again

        // Hide hamburger icon
        hamburgerMenu.style.display = 'none';

        // Switch views with animation
        showSection(loginSection, warrantySection);
        // Ensure login form is in its initial state (no loading/error messages)
        loginError.classList.add('hidden');
        loginError.classList.remove('visible');
        loginLoading.classList.add('hidden');
        loginLoading.classList.remove('visible');
        loginButton.classList.remove('hidden'); // Ensure login button is visible
    });

    // Removed the drawer open/close event listeners from here.
    // This logic is now handled in demoscript.js for better separation of concerns.
});
