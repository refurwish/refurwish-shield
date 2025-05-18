   /**
    * auth.js
    *
    * This file handles user authentication (login and logout) using Google Apps Script.
    */

   const appsScriptUrl = 'YOUR_APPS_SCRIPT_URL'; // Replace with your Apps Script URL

   // --- Helper Functions ---

   /**
    * Displays a message in the specified container.
    */
   function showMessage(containerId, message, type = null) {
     const container = document.getElementById(containerId);
     if (!container) return;
     container.textContent = message;
     container.className = 'status-message';
     if (type) {
       container.classList.add(type);
     }
     container.classList.remove('hidden');
   }

   /**
    * Hides the specified message container.
    */
   function hideMessage(containerId) {
     const container = document.getElementById(containerId);
     if (!container) return;
     container.classList.add('hidden');
   }

   // --- Fetch Helper Function ---
   /**
    * Makes an asynchronous request to the Google Apps Script web app.
    * @param {string} action - The name of the function to call in code.gs.
    * @param {object} params - The parameters to pass to the function.
    * @returns {Promise<object>} - A promise that resolves with the response data.
    */
   async function fetchData(action, params = {}) {
     const url = `${appsScriptUrl}?action=${action}`;
     const options = {
       method: 'GET', // Or 'POST' if you're sending a lot of data
       //contentType: 'application/json',  // Removed:  fetch handles this automatically in most cases.
       //body: JSON.stringify(params), //  Removed:  Use URL parameters for GET
     };
      let queryParams = new URLSearchParams(params).toString();
      const fullUrl = queryParams ? `${url}&${queryParams}` : url;
     const response = await fetch(fullUrl, options);

     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     return await response.json();
   }

   // --- Event Handlers ---

   /**
    * Handles the login form submission.
    */
   async function handleLoginFormSubmit(event) {
     event.preventDefault();

     const form = event.target;
     const storeId = form.loginStoreId.value;
     const password = form.loginPassword.value;

     hideMessage('loginError');
     showMessage('loginLoading', 'Logging in, please wait...');

     try {
       const response = await fetchData('login', { storeId, password });
       hideMessage('loginLoading');
       if (response && response.loggedIn) {
         window.storeId = response.storeId;
         document.getElementById('displayedStoreId').textContent = response.storeId;
         document.getElementById('loginSection').classList.add('hidden');
         document.getElementById('warrantySection').classList.remove('hidden');
         if (typeof initializeQRCode === 'function') {
           initializeQRCode();
         }
         form.reset();
       } else {
         showMessage('loginError', response.error || 'Invalid Store ID or Password');
       }
     } catch (error) {
       hideMessage('loginLoading');
       showMessage('loginError', error.message || 'An error occurred during login.');
       console.error(error);
     }
   }

   /**
    * Logs the user out.
    */
   async function logout() {
     try {
       const response = await fetchData('logout');
       if (response && !response.loggedIn) {
         window.storeId = null;
         document.getElementById('loginSection').classList.remove('hidden');
         document.getElementById('warrantySection').classList.add('hidden');
         document.getElementById('viewDataSection').classList.add('hidden');
         document.getElementById('financialReportSection').classList.add('hidden');
         const loginForm = document.getElementById('loginForm');
         if (loginForm) {
           loginForm.reset();
         }
       }
     } catch (error) {
       alert('Failed to log out. Please try again.');
       console.error(error);
     }
   }

   /**
    * Initializes the application.
    */
   async function init() {
     try {
       const response = await fetchData('getUser');
       if (response && response.loggedIn) {
         window.storeId = response.storeId;
         document.getElementById('displayedStoreId').textContent = response.storeId;
         document.getElementById('loginSection').classList.add('hidden');
         document.getElementById('warrantySection').classList.remove('hidden');
         if (typeof initializeQRCode === 'function') {
           initializeQRCode();
         }
         const warrantyForm = document.getElementById('warrantyForm');
         if (warrantyForm) {
           warrantyForm.addEventListener('submit', handleWarrantyFormSubmit);
         }
       } else {
         document.getElementById('loginSection').classList.remove('hidden');
         const loginForm = document.getElementById('loginForm');
         if (loginForm) {
           loginForm.addEventListener('submit', handleLoginFormSubmit);
         }
       }
     } catch (error) {
       showMessage('loginError', error.message || 'Failed to initialize application.');
       console.error(error);
     }
   }

   // --- Event Listeners ---
   window.onload = init;
   
