

// You MUST replace this with your actual Apps Script Web App URL
// Deploy your code.gs as a Web App (Execute as: Me, Who has access: Anyone)
// Copy the URL provided after deployment and paste it here.
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec'; 

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const storeIdInput = document.getElementById('storeIdInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginMessage = document.getElementById('loginMessage');
    const loginSection = document.getElementById('loginSection');
    const warrantySection = document.getElementById('warrantySection');
    const currentStoreIdSpan = document.getElementById('currentStoreId');
    const drawerStoreIdSpan = document.getElementById('drawerStoreId');
    const logoutButton = document.getElementById('logoutButton');

    // Hamburger menu toggle (repeated from demoscript for direct access if JS loads differently)
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const appDrawer = document.getElementById('appDrawer');
    const overlay = document.getElementById('overlay');

    // Function to show/hide sections with transitions
    function showSection(sectionToShow, sectionToHide) {
        // Hide old section first
        sectionToHide.classList.remove('active-content-section');
        sectionToHide.classList.remove('visible'); // Ensure it hides properly
        sectionToHide.addEventListener('transitionend', function handler() {
            sectionToHide.classList.add('hidden');
            sectionToHide.removeEventListener('transitionend', handler);

            // Then show new section
            sectionToShow.classList.remove('hidden');
            sectionToShow.classList.add('active-content-section');
            setTimeout(() => sectionToShow.classList.add('visible'), 10); // Small delay for transition
        }, { once: true });
    }

    // Function to handle login success
    function handleLoginSuccess(storeId) {
        // Store session in sessionStorage
        sessionStorage.setItem('loggedInStoreId', storeId);

        // Update displayed store IDs
        currentStoreIdSpan.textContent = storeId;
        drawerStoreIdSpan.textContent = storeId;

        // Transition to warranty section
        // Check if demoscript.js's postLoginSetup is available
        // This is the core fix for the blank page: ensure demoscript.js has loaded
        if (typeof window.postLoginSetup === 'function') {
            console.log('demoscript.js is ready, calling postLoginSetup immediately.');
            showSection(warrantySection, loginSection);
            window.postLoginSetup(storeId);
        } else {
            console.log('demoscript.js not ready, waiting for scriptsLoaded event.');
            // Listen for the custom event from demoscript.js
            document.addEventListener('scriptsLoaded', function handler() {
                console.log('scriptsLoaded event received, calling postLoginSetup.');
                showSection(warrantySection, loginSection);
                window.postLoginSetup(storeId);
                document.removeEventListener('scriptsLoaded', handler); // Remove listener after first call
            }, { once: true }); // Ensure this listener only fires once
        }
    }

    // Check login status on page load
    const storedStoreId = sessionStorage.getItem('loggedInStoreId');
    if (storedStoreId) {
        // User is already logged in, show warranty section directly
        // Delay this slightly to ensure demoscript.js has a chance to load
        // This is a safety measure, combined with the event listener.
        const checkDemoscriptReady = setInterval(() => {
            if (typeof window.postLoginSetup === 'function') {
                clearInterval(checkDemoscriptReady);
                handleLoginSuccess(storedStoreId);
            }
        }, 50); // Check every 50ms
        setTimeout(() => {
            if (typeof window.postLoginSetup !== 'function') {
                console.warn('demoscript.js did not load in time for initial login check.');
                // Fallback: Show login section and let user re-login
                loginSection.classList.add('active-content-section');
                loginSection.classList.remove('hidden');
                loginSection.classList.add('visible');
            }
        }, 2000); // Give it up to 2 seconds
    } else {
        // Not logged in, ensure login section is visible and warranty is hidden
        loginSection.classList.add('active-content-section');
        loginSection.classList.remove('hidden');
        loginSection.classList.add('visible');
        warrantySection.classList.remove('active-content-section'); // Ensure it's not active
        warrantySection.classList.add('hidden'); // Ensure it's hidden
    }


    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const storeId = storeIdInput.value.trim();
            const password = passwordInput.value.trim();

            loginMessage.classList.remove('visible', 'error');
            loginMessage.classList.add('hidden');
            loginMessage.textContent = ''; // Clear previous messages

            if (!storeId || !password) {
                loginMessage.textContent = 'Please enter both Store ID and Password.';
                loginMessage.classList.add('visible', 'error');
                return;
            }

            loginMessage.innerHTML = '<span class="loader"></span> Logging in...';
            loginMessage.classList.remove('error');
            loginMessage.classList.add('visible');

            try {
                const response = await fetch(APP_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'verifyLogin', storeId: storeId, password: password }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Login response:', result);

                if (result.status === 'success') {
                    loginMessage.textContent = 'Login successful!';
                    loginMessage.classList.remove('error');
                    // Add a small delay for the user to see the success message
                    setTimeout(() => handleLoginSuccess(storeId), 500);
                } else {
                    loginMessage.textContent = result.message || 'Login failed.';
                    loginMessage.classList.remove('visible'); // Hide loader message
                    loginMessage.classList.add('visible', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                loginMessage.textContent = 'An error occurred: ' + error.message;
                loginMessage.classList.remove('visible'); // Hide loader message
                loginMessage.classList.add('visible', 'error');
            }
        });
    }

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('loggedInStoreId'); // Clear session
            // Hide drawer if open
            appDrawer.classList.remove('open');
            overlay.classList.remove('active');

            // Reset active drawer item to Registration
            document.querySelectorAll('.drawer-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector('.drawer-item[data-section-id="registrationFormSection"]').classList.add('active');

            // Call reset function in demoscript.js if it exists
            if (window.resetDemoscriptState) {
                window.resetDemoscriptState();
            }
            showSection(loginSection, warrantySection); // Show login
            storeIdInput.value = ''; // Clear login form
            passwordInput.value = '';
            loginMessage.classList.remove('visible', 'error');
            loginMessage.classList.add('hidden');
        });
    }

    // Hamburger menu toggle
    if (hamburgerMenu && appDrawer && overlay) {
        hamburgerMenu.addEventListener('click', () => {
            appDrawer.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            appDrawer.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
});
