// --- IMPORTANT: REPLACE WITH YOUR DEPLOYED APPS SCRIPT WEB APP URL ---
// This is the URL you get after deploying your Google Apps Script as a web app (e.g., https://script.google.com/macros/s/AKfy.../exec)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec'; // <--- REPLACE THIS LINE

// --- Event Listeners for Hamburger Menu ---
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const drawer = document.getElementById('drawer');
    const mainContent = document.querySelector('main'); // Assuming your main content is within a <main> tag or similar

    if (hamburger && drawer && mainContent) {
        hamburger.addEventListener('click', function() {
            drawer.classList.toggle('open');
            mainContent.classList.toggle('shifted'); // Add/remove class to shift main content
        });

        // Close drawer when clicking on main content (or anywhere outside drawer/hamburger)
        mainContent.addEventListener('click', function(event) {
            if (drawer.classList.contains('open') && !drawer.contains(event.target) && !hamburger.contains(event.target)) {
                drawer.classList.remove('open');
                mainContent.classList.remove('shifted');
            }
        });
    } else {
        console.error("Hamburger, drawer, or main content element not found.");
    }

    // --- Form Submission (unchanged in logic, but using fetch now) ---
    const warrantyForm = document.getElementById('warrantyForm');
    if (warrantyForm) {
        warrantyForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const formData = new FormData(warrantyForm);
            formData.append('action', 'submitWarranty'); // Add action parameter

            try {
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: formData // FormData object automatically sets Content-Type header
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Server response:', result);

                if (result.status === 'success') {
                    alert('Warranty submitted successfully!');
                    // Optionally open PDF in new tab
                    if (result.url) {
                        window.open(result.url, '_blank');
                    }
                    warrantyForm.reset(); // Clear form
                    // Trigger data refresh for the drawer if it's open
                    const currentStoreId = sessionStorage.getItem('loggedInStoreId');
                    if (currentStoreId) {
                        fetchAndDisplayTrackingData(currentStoreId);
                    }
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Submission failed:', error);
                alert('An error occurred during submission: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Warranty';
            }
        });
    }

    // --- Dynamic Plan Price Update (UNCHANGED) ---
    const planTypeSelect = document.getElementById('planType');
    const phonePriceInput = document.getElementById('phonePrice');
    const planPriceDisplay = document.getElementById('planPriceDisplay');
    const planOptionSelect = document.getElementById('planOption'); // Assuming this exists for specific details

    function updatePlanPrice() {
        const planType = planTypeSelect.value;
        const phonePrice = parseFloat(phonePriceInput.value) || 0;
        let price = 0;
        let details = '';

        if (phonePrice >= 15000 && phonePrice <= 25000) {
            switch (planType) {
                case 'extended': price = 799; details = 'Extended Warranty (₹799)'; break;
                case 'screen_protection': price = 899; details = 'Screen Protection Plan (₹899)'; break;
                case 'total_damage': price = 1099; details = 'Total Damage Protection (₹1099)'; break;
                case 'combo_screen_extended': price = 1299; details = 'Combo (Screen Damage + Extended Warranty) (₹1299)'; break;
                case 'combo_total_extended': price = 1599; details = 'Combo (Total Damage Protection + Extended Warranty) (₹1599)'; break;
                default: price = 0; details = 'Select Plan'; break;
            }
        } else if (phonePrice > 25000) {
            switch (planType) {
                case 'extended': price = 1099; details = 'Extended Warranty (₹1099)'; break;
                case 'screen_protection': price = 1199; details = 'Screen Protection Plan (₹1199)'; break;
                case 'total_damage': price = 1499; details = 'Total Damage Protection (₹1499)'; break;
                case 'combo_screen_extended': price = 1699; details = 'Combo (Screen Damage + Extended Warranty) (₹1699)'; break;
                case 'combo_total_extended': price = 1999; details = 'Combo (Total Damage Protection + Extended Warranty) (₹1999)'; break;
                default: price = 0; details = 'Select Plan'; break;
            }
        } else {
            price = 0;
            details = 'Phone price must be ₹15,000 or more';
        }
        planPriceDisplay.textContent = `₹${price}`;
        document.getElementById('planPrice').value = price; // Hidden input to submit price
        document.getElementById('selectedPlanDetails').value = details; // Hidden input to submit details
    }

    if (planTypeSelect) planTypeSelect.addEventListener('change', updatePlanPrice);
    if (phonePriceInput) phonePriceInput.addEventListener('input', updatePlanPrice);
    updatePlanPrice(); // Initial call

    // --- Tracking Data Function (MODIFIED to use fetch) ---
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const trackingDataTable = document.getElementById('trackingDataTable');
    const totalSubmissionsSpan = document.getElementById('totalSubmissions');
    const totalCommissionSpan = document.getElementById('totalCommission');
    const totalPaymentsSpan = document.getElementById('totalPayments');
    const totalRevenueSpan = document.getElementById('totalRevenue');

    async function fetchAndDisplayTrackingData(storeId) {
        if (!storeId) {
            console.warn("No store ID found for tracking data.");
            return;
        }

        const fromDate = fromDateInput ? fromDateInput.value : '';
        const toDate = toDateInput ? toDateInput.value : '';

        // Clear existing table and totals
        trackingDataTable.innerHTML = '<tr><th>Timestamp</th><th>Customer Name</th><th>Product</th><th>IMEI</th><th>Plan Type</th><th>Total Amount</th></tr>';
        totalSubmissionsSpan.textContent = '0';
        totalCommissionSpan.textContent = '₹0';
        totalPaymentsSpan.textContent = '₹0';
        totalRevenueSpan.textContent = '₹0';

        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.style.display = 'block'; // Show loading

        const requestData = new URLSearchParams();
        requestData.append('action', 'getTrackingData'); // Important: action for doPost
        requestData.append('storeId', storeId);
        requestData.append('fromDate', fromDate);
        requestData.append('toDate', toDate);

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: requestData // URLSearchParams automatically sets Content-Type
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Tracking data response:', result);

            if (result.status === 'success' && result.data) {
                let totalSubmissions = 0;
                let totalCommission = 0;
                let totalPayments = 0;
                let totalRevenue = 0;

                result.data.forEach(row => {
                    const tr = document.createElement('tr');
                    // Assuming column order based on code.gs appendRow
                    // 0:timestamp, 1:customerName, 2:customerEmail, 3:customerPhone, 4:storeId,
                    // 5:productName, 6:imeiNumber, 7:sheetStartDateValue, 8:sheetEndDateValue,
                    // 9:purchaseDate, 10:phonePrice, 11:planPeriodDescription, 12:selectedPlanDetails,
                    // 13:pdfUrl, 14:commission, 15:ourAmount, 16:totalAmount

                    tr.innerHTML = `
                        <td>${row[0] || ''}</td>
                        <td>${row[1] || ''}</td>
                        <td>${row[5] || ''}</td>
                        <td>${row[6] || ''}</td>
                        <td>${row[11] || ''}</td>
                        <td>₹${(row[16] || 0).toLocaleString('en-IN')}</td>
                    `;
                    trackingDataTable.appendChild(tr);

                    totalSubmissions++;
                    totalCommission += (row[14] || 0);
                    totalPayments += (row[15] || 0);
                    totalRevenue += (row[16] || 0);
                });

                totalSubmissionsSpan.textContent = totalSubmissions.toString();
                totalCommissionSpan.textContent = `₹${totalCommission.toLocaleString('en-IN')}`;
                totalPaymentsSpan.textContent = `₹${totalPayments.toLocaleString('en-IN')}`;
                totalRevenueSpan.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;

            } else {
                alert('Error fetching tracking data: ' + result.message);
                console.error('Error fetching tracking data:', result.message);
            }
        } catch (error) {
            console.error('Failed to fetch tracking data:', error);
            alert('An error occurred while fetching tracking data: ' + error.message);
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide loading
        }
    }

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            const currentStoreId = sessionStorage.getItem('loggedInStoreId');
            if (currentStoreId) {
                fetchAndDisplayTrackingData(currentStoreId);
            } else {
                alert("Please log in to view tracking data.");
            }
        });
    }

    // --- Initial Load of Tracking Data (after login) ---
    const currentStoreId = sessionStorage.getItem('loggedInStoreId');
    if (currentStoreId) {
        // Assuming your login flow sets 'loggedInStoreId' in sessionStorage
        fetchAndDisplayTrackingData(currentStoreId);
    } else {
        // Optionally redirect to login page or show login prompt
        console.log("Not logged in. Tracking data not loaded.");
        // Example: Redirect if not logged in
        // window.location.href = 'login.html';
    }
});
