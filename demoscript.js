document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('warrantyForm');
    const loading = document.getElementById('loading');
    const successContainer = document.getElementById('successContainer');
    const errorMessage = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const storeIdInput = document.getElementById('storeId');

    const phonePriceGroup = document.getElementById('phonePriceGroup');
    const phonePriceInput = document.getElementById('phonePrice');
    const confirmedPhonePriceDisplay = document.getElementById('confirmedPhonePrice');
    const showPlanPricesButton = document.getElementById('showPlanPricesButton');
    const planSelectionSection = document.getElementById('planSelectionSection');
    const generateCertificateButton = document.getElementById('generateCertificateButton');
    const planOptionsContainer = document.getElementById('planOptionsContainer');
    const selectedPlanValueInput = document.getElementById('selectedPlanValue');
    const selectedPlanPriceInput = document.getElementById('selectedPlanPrice');
    const selectedPlanTypeInput = document.getElementById('selectedPlanType');
    const selectedPlanDetailsInput = document.getElementById('selectedPlanDetails');
    const backToPhonePriceButton = document.getElementById('backToPhonePriceButton');

    // --- New Elements for Drawer and Tracking ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const drawerMenu = document.getElementById('drawerMenu');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerItems = document.querySelectorAll('.drawer-item');
    const logoutButton = document.getElementById('logoutButton'); // Relocated

    const loginSection = document.getElementById('loginSection');
    const loggedInContent = document.getElementById('loggedInContent'); // New wrapper for logged-in UI

    // Sections to manage visibility
    const sections = {
        warrantySection: document.getElementById('warrantySection'),
        submissionsSection: document.getElementById('submissionsSection'),
        commissionSection: document.getElementById('commissionSection'),
        paymentsSection: document.getElementById('paymentsSection'),
        totalAmountSection: document.getElementById('totalAmountSection')
    };

    // Tracking section elements (dynamic access)
    const trackingDatePickers = {
        submissions: { from: document.getElementById('submissionsFromDate'), to: document.getElementById('submissionsToDate') },
        commission: { from: document.getElementById('commissionFromDate'), to: document.getElementById('commissionToDate') },
        payments: { from: document.getElementById('paymentsFromDate'), to: document.getElementById('paymentsToDate') },
        totalAmount: { from: document.getElementById('totalAmountFromDate'), to: document.getElementById('totalAmountToDate') }
    };

    const trackingResultAreas = {
        submissions: {
            summary: document.getElementById('totalSubmissionsValue'),
            tableBody: document.querySelector('#submissionsTable tbody'),
            table: document.getElementById('submissionsTable'),
            loading: document.querySelector('#submissionsResult .tracking-loading'),
            error: document.querySelector('#submissionsResult .tracking-error'),
            noData: document.querySelector('#submissionsResult .no-data-message')
        },
        commission: {
            summary: document.getElementById('totalCommissionValue'),
            tableBody: document.querySelector('#commissionTable tbody'),
            table: document.getElementById('commissionTable'),
            loading: document.querySelector('#commissionResult .tracking-loading'),
            error: document.querySelector('#commissionResult .tracking-error'),
            noData: document.querySelector('#commissionResult .no-data-message')
        },
        payments: {
            summary: document.getElementById('totalPaymentsValue'),
            tableBody: document.querySelector('#paymentsTable tbody'),
            table: document.getElementById('paymentsTable'),
            loading: document.querySelector('#paymentsResult .tracking-loading'),
            error: document.querySelector('#paymentsResult .tracking-error'),
            noData: document.querySelector('#paymentsResult .no-data-message')
        },
        totalAmount: {
            summary: document.getElementById('overallTotalAmountValue'),
            tableBody: document.querySelector('#totalAmountTable tbody'),
            table: document.getElementById('totalAmountTable'),
            loading: document.querySelector('#totalAmountResult .tracking-loading'),
            error: document.querySelector('#totalAmountResult .tracking-error'),
            noData: document.querySelector('#totalAmountResult .no-data-message')
        }
    };


    // Define extended warranty base prices
    const extendedWarrantyPrices = [
        { maxPrice: 15000, planText: 'Under ₹15,000', price: 699 },
        { maxPrice: 25000, planText: '₹15,001 - ₹25,000', price: 799 },
        { maxPrice: 35000, planText: '₹25,001 - ₹35,000', price: 899 },
        { maxPrice: 45000, planText: '₹35,001 - ₹45,000', price: 999 },
        { maxPrice: 60000, planText: '₹45,001 - ₹60,000', price: 1299 },
        { maxPrice: 75000, planText: '₹60,001 - ₹75,000', price: 1599 },
        { maxPrice: 100000, planText: '₹75,001 - ₹1,00,000', price: 1999 },
        { maxPrice: 150000, planText: '₹1,00,001 - ₹1,50,000', price: 2499 },
        { maxPrice: 200000, planText: '₹1,50,001 - ₹2,00,000', price: 2999 },
        { maxPrice: 250000, planText: '₹2,00,001 - ₹2,50,000', price: 3499 },
    ];

    function getExtendedWarrantyPrice(phonePrice) {
        for (const plan of extendedWarrantyPrices) {
            if (phonePrice <= plan.maxPrice) {
                return plan.price;
            }
        }
        return extendedWarrantyPrices[extendedWarrantyPrices.length - 1].price;
    }

    function populatePlanOptions(phonePrice) {
        planOptionsContainer.innerHTML = '';

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        const allPlans = [
            { value: 'extended_warranty', name: 'Extended Warranty', price: extendedPrice, internalType: 'extended', periodText: '12 Months Extended' },
            { value: 'screen_protection', name: 'Screen Protection Plan', price: screenDamagePrice, internalType: 'screen_protection', periodText: '12 Months' },
            { value: 'total_damage_protection', name: 'Total Damage Protection', price: totalDamagePrice, internalType: 'total_damage', periodText: '12 Months' },
            { value: 'combo_screen_extended', name: 'Combo (Screen Damage + Extended Warranty)', price: Math.round(screenDamagePrice + (extendedPrice * 0.5)), internalType: 'combo_screen_extended', periodText: '24 Months Total' },
            { value: 'combo_total_extended', name: 'Combo (Total Damage Protection + Extended Warranty)', price: Math.round(totalDamagePrice + (extendedPrice * 0.5)), internalType: 'combo_total_extended', periodText: '24 Months Total' }
        ];

        allPlans.forEach(plan => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('plan-button');
            button.innerHTML = `<span class="plan-text">${plan.name}</span><span class="plan-price">₹${plan.price}</span>`;

            button.setAttribute('data-value', plan.value);
            button.setAttribute('data-price', plan.price);
            button.setAttribute('data-plantype', plan.internalType);
            button.setAttribute('data-details', `${plan.name} (${plan.periodText})`);

            button.addEventListener('click', function() {
                const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }
                button.classList.add('selected');

                selectedPlanValueInput.value = plan.value;
                selectedPlanPriceInput.value = plan.price;
                selectedPlanTypeInput.value = plan.internalType;
                selectedPlanDetailsInput.value = button.getAttribute('data-details');

                planOptionsContainer.classList.remove('error');
            });

            planOptionsContainer.appendChild(button);
        });

        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
    }

    function validateCustomerAndPhoneDetails() {
        let isValid = true;
        const requiredFields = [
            'customerName', 'customerEmail', 'customerPhone',
            'productName', 'imeiNumber', 'purchaseDate', 'phonePrice'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        const email = document.getElementById('customerEmail');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            email.classList.add('error');
            isValid = false;
        }

        const phonePrice = parseFloat(phonePriceInput.value);
        if (isNaN(phonePrice) || phonePrice <= 0) {
            phonePriceInput.classList.add('error');
            isValid = false;
        } else {
            phonePriceInput.classList.remove('error');
        }

        const imeiNumber = document.getElementById('imeiNumber');
        if (imeiNumber.value.trim().length !== 15 || !/^[0-9]+$/.test(imeiNumber.value.trim())) {
            imeiNumber.classList.add('error');
            isValid = false;
        }

        const customerPhone = document.getElementById('customerPhone');
        if (customerPhone.value.trim().length !== 10 || !/^[0-9]+$/.test(customerPhone.value.trim())) {
            customerPhone.classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    showPlanPricesButton.addEventListener('click', function (e) {
        e.preventDefault();

        if (validateCustomerAndPhoneDetails()) {
            const phonePrice = parseFloat(phonePriceInput.value);
            populatePlanOptions(phonePrice);
            confirmedPhonePriceDisplay.textContent = `₹${phonePrice.toLocaleString('en-IN')}`;

            phonePriceGroup.classList.remove('visible');
            phonePriceGroup.classList.add('hidden');

            showPlanPricesButton.classList.remove('visible');
            showPlanPricesButton.classList.add('hidden');

            successContainer.classList.remove('visible');
            successContainer.classList.add('hidden');
            pdfLinkSection.classList.remove('visible');
            pdfLinkSection.classList.add('hidden');

            planSelectionSection.classList.remove('hidden');
            setTimeout(() => {
                planSelectionSection.classList.add('visible');
            }, 10);

            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert('Please fill in all required details correctly before proceeding to plan selection.');
            const firstErrorField = document.querySelector('.form-group input.error, .form-group select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    backToPhonePriceButton.addEventListener('click', function() {
        planSelectionSection.classList.remove('visible');
        setTimeout(() => {
            planSelectionSection.classList.add('hidden');
        }, 400);

        phonePriceGroup.classList.remove('hidden');
        setTimeout(() => phonePriceGroup.classList.add('visible'), 400);

        showPlanPricesButton.classList.remove('hidden');
        setTimeout(() => showPlanPricesButton.classList.add('visible'), 400);

        const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        planOptionsContainer.classList.remove('error');

        phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!selectedPlanValueInput.value) {
            alert('Please select a Plan.');
            planOptionsContainer.classList.add('error');
            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            planOptionsContainer.classList.remove('error');
        }

        successContainer.classList.remove('visible');
        successContainer.classList.add('hidden');
        errorMessage.classList.remove('visible');
        errorMessage.classList.add('hidden');
        pdfLinkSection.classList.remove('visible');
        pdfLinkSection.classList.add('hidden');

        loading.classList.remove('hidden');
        setTimeout(() => loading.classList.add('visible'), 10);

        const formData = new FormData(form);
        // No 'action' parameter needed here for the main doPost, it's the default submission.
        // The URL is the direct deployment URL of code.gs.
        fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loading.classList.remove('visible');
                loading.classList.add('hidden');

                if (data.status === 'success') {
                    document.getElementById('successMessage').textContent = 'Warranty certificate generated successfully!';
                    downloadLink.href = data.url;
                    qrcodeDiv.innerHTML = '';
                    new QRCode(qrcodeDiv, {
                        text: data.url,
                        width: 150,
                        height: 150,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });

                    pdfLinkSection.classList.remove('hidden');
                    successContainer.classList.remove('hidden');
                    setTimeout(() => {
                        pdfLinkSection.classList.add('visible');
                        successContainer.classList.add('visible');
                    }, 10);

                    form.reset();
                    const storeId = sessionStorage.getItem('storeId');
                    if (storeId) {
                        storeIdInput.value = storeId;
                    }
                    
                    planSelectionSection.classList.remove('visible');
                    planSelectionSection.classList.add('hidden');

                    phonePriceGroup.classList.remove('hidden');
                    phonePriceGroup.classList.add('visible');
                    
                    showPlanPricesButton.classList.remove('hidden');
                    showPlanPricesButton.classList.add('visible');

                    const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedPlanValueInput.value = '';
                    selectedPlanPriceInput.value = '';
                    selectedPlanTypeInput.value = '';
                    selectedPlanDetailsInput.value = '';

                    pdfLinkSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            })
            .catch(error => {
                errorMessage.textContent = 'An error occurred: ' + error.message;
                errorMessage.classList.remove('hidden');
                setTimeout(() => errorMessage.classList.add('visible'), 10);
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
    });

    // --- Authentication and Section Management (from demoauth.js, integrated and enhanced) ---

    // Function to handle showing/hiding sections with animations
    // Modified to handle the new main-wrapper and its child containers
    function showSection(sectionToShowId) {
        // Hide all main content sections
        for (const key in sections) {
            sections[key].classList.remove('active-content-section');
        }
        
        // Hide all tracking result areas and reset them
        for (const key in trackingResultAreas) {
            trackingResultAreas[key].table.classList.add('hidden');
            trackingResultAreas[key].tableBody.innerHTML = ''; // Clear table
            // Reset summary to 0 for numbers, or to '0' for submissions count
            if (key === 'submissions') {
                trackingResultAreas[key].summary.innerHTML = 'Total Submissions: <strong id="totalSubmissionsValue">0</strong>';
            } else {
                trackingResultAreas[key].summary.innerHTML = `Total ${key.charAt(0).toUpperCase() + key.slice(1)}: ₹<strong id="total${key.charAt(0).toUpperCase() + key.slice(1)}Value">0</strong>`;
            }
            trackingResultAreas[key].noData.classList.add('hidden');
            trackingResultAreas[key].loading.classList.add('hidden');
            trackingResultAreas[key].error.classList.add('hidden');
        }


        // Show the requested section
        const sectionToShow = sections[sectionToShowId];
        if (sectionToShow) {
            sectionToShow.classList.add('active-content-section');
            // Scroll to top of the new section
            sectionToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }


    // Login success callback from demoauth.js
    window.handleLoginSuccess = function(storeId) {
        sessionStorage.setItem('storeId', storeId);

        storeIdInput.value = storeId;
        document.getElementById('displayedStoreId').textContent = storeId;
        document.getElementById('drawerDisplayedStoreId').textContent = storeId; // Update drawer's store ID

        // Hide login, show main content wrapper
        loginSection.classList.remove('visible');
        loginSection.classList.add('hidden');
        
        loggedInContent.classList.remove('hidden');
        setTimeout(() => loggedInContent.classList.add('visible'), 400); // Animate in

        showSection('warrantySection'); // Default to warranty form on login
    };

    // Login failure callback from demoauth.js
    window.handleLoginFailure = function(message) {
        // demoauth.js already handles displaying loginError
        // No change needed here, just ensure login form is visible
        loginSection.classList.remove('hidden');
        loginSection.classList.add('visible');
        loggedInContent.classList.add('hidden');
        loggedInContent.classList.remove('visible');
    };

    // Restore session if storeId is saved (on page load)
    const savedStoreId = sessionStorage.getItem('storeId');
    if (savedStoreId) {
        loginSection.classList.add('hidden');
        loginSection.classList.remove('visible'); // Ensure hidden
        loggedInContent.classList.remove('hidden'); // Show the new main-wrapper
        loggedInContent.classList.add('visible');
        storeIdInput.value = savedStoreId;
        document.getElementById('displayedStoreId').textContent = savedStoreId;
        document.getElementById('drawerDisplayedStoreId').textContent = savedStoreId; // Update drawer's store ID
        showSection('warrantySection'); // Default to warranty form on login
    } else {
        // If no saved session, ensure login section is visible on load
        loginSection.classList.remove('hidden');
        loginSection.classList.add('visible');
        loggedInContent.classList.add('hidden'); // Ensure main-wrapper is hidden
    }


    // Handle logout (now attached to the drawer's logout button)
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('storeId');
        // Clear login form fields
        document.getElementById('loginStoreId').value = '';
        document.getElementById('loginPassword').value = '';

        // Clear warranty form fields and reset UI
        form.reset();
        storeIdInput.value = ''; // Ensure hidden storeId is cleared
        document.getElementById('displayedStoreId').textContent = '';
        document.getElementById('drawerDisplayedStoreId').textContent = '';

        // Hide main content wrapper, show login
        loggedInContent.classList.remove('visible');
        setTimeout(() => {
            loggedInContent.classList.add('hidden');
            loginSection.classList.remove('hidden');
            loginSection.classList.add('visible');
        }, 400);

        // Reset login form messages (these are also handled by demoauth.js but good to ensure)
        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('loginError').classList.remove('visible');
        document.getElementById('loginLoading').classList.add('hidden');
        document.getElementById('loginLoading').classList.remove('visible');
        // The submit button is revealed by demoauth.js on failure/hide loading

        // Close drawer if open
        drawerMenu.classList.remove('open');
        drawerOverlay.classList.remove('active');

        // Reset warranty form UI to initial state after logout
        planSelectionSection.classList.remove('visible');
        planSelectionSection.classList.add('hidden'); // Immediately hide for faster reset
        phonePriceGroup.classList.remove('hidden');
        phonePriceGroup.classList.add('visible');
        showPlanPricesButton.classList.remove('hidden');
        showPlanPricesButton.classList.add('visible');
        const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
    });

    // --- Drawer Menu Logic ---
    hamburgerMenu.addEventListener('click', () => {
        drawerMenu.classList.toggle('open');
        drawerOverlay.classList.toggle('active');
    });

    drawerOverlay.addEventListener('click', () => {
        drawerMenu.classList.remove('open');
        drawerOverlay.classList.remove('active');
    });

    drawerItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSectionId = this.dataset.section;

            // Remove active class from all drawer items
            drawerItems.forEach(di => di.classList.remove('active'));
            // Add active class to the clicked item
            this.classList.add('active');

            // Close the drawer
            drawerMenu.classList.remove('open');
            drawerOverlay.classList.remove('active');

            // Show the selected section
            showSection(targetSectionId);
        });
    });

    // --- Tracking Functionality ---

    document.querySelectorAll('.track-button').forEach(button => {
        button.addEventListener('click', function() {
            const reportType = this.dataset.reportType;
            const fromDateInput = trackingDatePickers[reportType.toLowerCase()].from;
            const toDateInput = trackingDatePickers[reportType.toLowerCase()].to;
            const resultArea = trackingResultAreas[reportType.toLowerCase()];

            const fromDate = fromDateInput.value; // YYYY-MM-DD
            const toDate = toDateInput.value;   // YYYY-MM-DD

            // Simple validation
            if (!fromDate || !toDate) {
                resultArea.error.textContent = 'Please select both From and To dates.';
                resultArea.error.classList.remove('hidden');
                setTimeout(() => resultArea.error.classList.add('visible'), 10);
                return;
            }
            if (new Date(fromDate) > new Date(toDate)) {
                resultArea.error.textContent = 'From Date cannot be after To Date.';
                resultArea.error.classList.remove('hidden');
                setTimeout(() => resultArea.error.classList.add('visible'), 10);
                return;
            }

            // Clear previous results and show loading
            resultArea.error.classList.add('hidden');
            resultArea.error.classList.remove('visible');
            resultArea.table.classList.add('hidden');
            resultArea.tableBody.innerHTML = '';
            resultArea.noData.classList.add('hidden');
            
            // Reset summary text content
            if (reportType === 'Submissions') {
                resultArea.summary.innerHTML = 'Total Submissions: <strong id="totalSubmissionsValue">0</strong>';
            } else {
                resultArea.summary.innerHTML = `Total ${reportType}: ₹<strong id="total${reportType.replace(/\s/g, '')}Value">0</strong>`;
            }
            
            resultArea.loading.classList.remove('hidden');
            setTimeout(() => resultArea.loading.classList.add('visible'), 10);


            const storeId = sessionStorage.getItem('storeId');
            if (!storeId) {
                resultArea.error.textContent = 'Store ID not found. Please log in again.';
                resultArea.error.classList.remove('hidden');
                setTimeout(() => resultArea.error.classList.add('visible'), 10);
                resultArea.loading.classList.add('hidden');
                resultArea.loading.classList.remove('visible');
                return;
            }

            // Use google.script.run for calling Apps Script functions directly
            google.script.run
                .withSuccessHandler(function(data) {
                    resultArea.loading.classList.add('hidden');
                    resultArea.loading.classList.remove('visible');

                    if (data.status === 'success') {
                        if (data.records && data.records.length > 0) {
                            let totalValue = 0;
                            data.records.forEach(record => {
                                const row = resultArea.tableBody.insertRow();
                                const dateCell = row.insertCell();
                                const valueCell = row.insertCell();
                                dateCell.textContent = record.date; // Date already dd-MM-yyyy
                                if (reportType === 'Submissions') {
                                    valueCell.textContent = record.value;
                                    totalValue += parseInt(record.value);
                                } else {
                                    valueCell.textContent = `₹${parseFloat(record.value).toLocaleString('en-IN')}`;
                                    totalValue += parseFloat(record.value);
                                }
                            });
                            resultArea.table.classList.remove('hidden');
                            resultArea.table.classList.add('visible'); // Animate table in

                            if (reportType === 'Submissions') {
                                resultArea.summary.innerHTML = `Total Submissions: <strong>${totalValue}</strong>`;
                            } else {
                                resultArea.summary.innerHTML = `Total ${reportType}: ₹<strong>${totalValue.toLocaleString('en-IN')}</strong>`;
                            }
                        } else {
                            resultArea.noData.classList.remove('hidden');
                            resultArea.noData.classList.add('visible');
                        }
                    } else {
                        resultArea.error.textContent = data.message || 'Error fetching data.';
                        resultArea.error.classList.remove('hidden');
                        setTimeout(() => resultArea.error.classList.add('visible'), 10);
                    }
                })
                .withFailureHandler(function(error) {
                    resultArea.loading.classList.add('hidden');
                    resultArea.loading.classList.remove('visible');
                    resultArea.error.textContent = 'Script error: ' + error.message;
                    resultArea.error.classList.remove('hidden');
                    setTimeout(() => resultArea.error.classList.add('visible'), 10);
                })
                .getTrackingData(storeId, reportType, fromDate, toDate); // Call new Apps Script function
        });
    });

});
