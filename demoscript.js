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

    // NEW ELEMENTS FOR DRAWER DATA DISPLAY
    const mainDrawer = document.getElementById('mainDrawer'); // Reference to the drawer
    const drawerNavButtons = document.querySelectorAll('.drawer-nav-button');
    const drawerViews = document.querySelectorAll('.drawer-view');
    const filterFromDate = document.getElementById('filterFromDate');
    const filterToDate = document.getElementById('filterToDate');
    const applyDateFilterButton = document.getElementById('applyDateFilterButton');
    const clearDateFilterButton = document.getElementById('clearDateFilterButton');
    const drawerLoading = document.getElementById('drawerLoading');
    const drawerError = document.getElementById('drawerError');

    // References for specific data tables/summaries
    const allDetailsTableBody = document.querySelector('#allDetailsTable tbody');
    const allDetailsCount = document.getElementById('allDetailsCount');
    const allDetailsEmptyMessage = document.getElementById('allDetailsEmptyMessage');

    const commissionTableBody = document.querySelector('#commissionTable tbody');
    const commissionCount = document.getElementById('commissionCount');
    const totalCommissionValue = document.getElementById('totalCommissionValue');
    const commissionEmptyMessage = document.getElementById('commissionEmptyMessage');

    const paymentsTableBody = document.querySelector('#paymentsTable tbody');
    const paymentsCount = document.getElementById('paymentsCount');
    const totalPaymentsValue = document.getElementById('totalPaymentsValue');
    const paymentsEmptyMessage = document.getElementById('paymentsEmptyMessage');

    const totalAmountTableBody = document.querySelector('#totalAmountTable tbody');
    const totalAmountCount = document.getElementById('totalAmountCount');
    const totalAmountValue = document.getElementById('totalAmountValue');
    const totalAmountEmptyMessage = document.getElementById('totalAmountEmptyMessage');


    // Define extended warranty base prices (unchanged)
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
            confirmedPhonePriceDisplay.textContent = `₹${phonePrice.toLocaleString('en-IN')}`; // Display formatted price

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
        }, 400); // Match CSS transition duration

        phonePriceGroup.classList.remove('hidden');
        setTimeout(() => phonePriceGroup.classList.add('visible'), 400); // Appear after plans hide

        showPlanPricesButton.classList.remove('hidden');
        setTimeout(() => showPlanPricesButton.classList.add('visible'), 400); // Appear after plans hide

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
        // Ensure action is explicitly set for the doPost in Google Apps Script
        formData.append('action', 'submitWarranty');

        // IMPORTANT: Update this URL if your deployment changes
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
                    
                    // Reset UI to initial state:
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


    // ------------------------------------------------ */
    // NEW: DRAWER DATA FETCHING AND DISPLAY FUNCTIONS
    // ------------------------------------------------ */

    // Helper to show/hide loading/error in drawer
    function showDrawerStatus(type, message = '') {
        drawerLoading.classList.add('hidden');
        drawerError.classList.add('hidden');
        drawerLoading.classList.remove('visible');
        drawerError.classList.remove('visible');

        if (type === 'loading') {
            drawerLoading.classList.remove('hidden');
            setTimeout(() => drawerLoading.classList.add('visible'), 10);
        } else if (type === 'error') {
            drawerError.textContent = 'Error: ' + message;
            drawerError.classList.remove('hidden');
            setTimeout(() => drawerError.classList.add('visible'), 10);
        }
    }

    // Helper to format currency
    function formatCurrency(amount) {
        return `₹${parseFloat(amount).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    }

    // Helper to show/hide empty messages
    function toggleEmptyMessage(tableBody, emptyMessageElement, dataArray) {
        if (!dataArray || dataArray.length === 0) {
            tableBody.innerHTML = ''; // Clear table
            emptyMessageElement.classList.remove('hidden');
            emptyMessageElement.classList.add('visible');
        } else {
            emptyMessageElement.classList.remove('visible');
            emptyMessageElement.classList.add('hidden');
        }
    }


    async function fetchAndDisplayAllData(storeId, fromDate, toDate) {
        showDrawerStatus('loading');
        // Hide all tables before loading
        drawerViews.forEach(view => view.classList.add('hidden'));

        // Show the active view
        document.getElementById('allDetailsView').classList.remove('hidden');
        document.getElementById('allDetailsView').classList.add('visible');


        try {
            const data = await google.script.run
                .withSuccessHandler(response => {
                    showDrawerStatus('none'); // Hide loading
                    if (response.status === 'success') {
                        populateAllDetailsTable(response.data);
                        populateCommissionTable(response.commissionData);
                        populatePaymentsTable(response.paymentsData);
                        populateTotalAmountTable(response.totalAmountData);
                    } else {
                        showDrawerStatus('error', response.message);
                    }
                })
                .withFailureHandler(error => {
                    showDrawerStatus('error', error.message || 'Failed to fetch data.');
                })
                .getStoreTrackingData(storeId, fromDate, toDate);

        } catch (e) {
            showDrawerStatus('error', e.message || 'An unexpected error occurred during data fetch.');
        }
    }

    function populateAllDetailsTable(data) {
        allDetailsTableBody.innerHTML = '';
        let count = 0;
        if (data && data.length > 0) {
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row[0]}</td> <td>${row[1]}</td> <td>${row[5]}</td> <td>${row[6]}</td> <td>${row[12]}</td><td>${formatCurrency(row[16])}</td> `;
                allDetailsTableBody.appendChild(tr);
                count++;
            });
        }
        allDetailsCount.textContent = count;
        toggleEmptyMessage(allDetailsTableBody, allDetailsEmptyMessage, data);
    }

    function populateCommissionTable(data) {
        commissionTableBody.innerHTML = '';
        let totalCommission = 0;
        let count = 0;
        if (data && data.length > 0) {
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row[0]}</td> <td>${row[1]}</td> <td>${row[12]}</td><td>${formatCurrency(row[14])}</td> `;
                commissionTableBody.appendChild(tr);
                totalCommission += parseFloat(row[14]);
                count++;
            });
        }
        totalCommissionValue.textContent = formatCurrency(totalCommission);
        commissionCount.textContent = count;
        toggleEmptyMessage(commissionTableBody, commissionEmptyMessage, data);
    }

    function populatePaymentsTable(data) {
        paymentsTableBody.innerHTML = '';
        let totalPayments = 0;
        let count = 0;
        if (data && data.length > 0) {
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row[0]}</td> <td>${row[1]}</td> <td>${row[12]}</td><td>${formatCurrency(row[15])}</td> `;
                paymentsTableBody.appendChild(tr);
                totalPayments += parseFloat(row[15]);
                count++;
            });
        }
        totalPaymentsValue.textContent = formatCurrency(totalPayments);
        paymentsCount.textContent = count;
        toggleEmptyMessage(paymentsTableBody, paymentsEmptyMessage, data);
    }

    function populateTotalAmountTable(data) {
        totalAmountTableBody.innerHTML = '';
        let totalSales = 0;
        let count = 0;
        if (data && data.length > 0) {
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row[0]}</td> <td>${row[1]}</td> <td>${row[12]}</td><td>${formatCurrency(row[16])}</td> `;
                totalAmountTableBody.appendChild(tr);
                totalSales += parseFloat(row[16]);
                count++;
            });
        }
        totalAmountValue.textContent = formatCurrency(totalSales);
        totalAmountCount.textContent = count;
        toggleEmptyMessage(totalAmountTableBody, totalAmountEmptyMessage, data);
    }


    // Event listeners for drawer navigation
    drawerNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'selected' from all buttons
            drawerNavButtons.forEach(btn => btn.classList.remove('selected'));
            // Add 'selected' to the clicked button
            this.classList.add('selected');

            // Hide all views
            drawerViews.forEach(view => view.classList.add('hidden'));

            // Show the selected view
            const viewId = this.dataset.view;
            document.getElementById(viewId + 'View').classList.remove('hidden');
            document.getElementById(viewId + 'View').classList.add('visible'); // Ensure visible class for animation if any
        });
    });

    // Event listener for hamburger icon to trigger data fetch
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', () => {
            const currentStoreId = sessionStorage.getItem('storeId');
            if (currentStoreId) {
                // Set default dates if not already set or invalid
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                if (!filterFromDate.value) {
                    filterFromDate.value = "2024-01-01"; // Default start for historical data
                }
                if (!filterToDate.value) {
                    filterToDate.value = today;
                }
                // Automatically fetch data for the default/selected view when drawer opens
                fetchAndDisplayAllData(
                    currentStoreId,
                    filterFromDate.value,
                    filterToDate.value
                );
            }
        });
    }

    // Event listeners for date filtering
    applyDateFilterButton.addEventListener('click', () => {
        const currentStoreId = sessionStorage.getItem('storeId');
        if (!currentStoreId) {
            showDrawerStatus('error', 'Store ID not found. Please log in again.');
            return;
        }

        const fromDate = filterFromDate.value;
        const toDate = filterToDate.value;

        if (!fromDate || !toDate) {
            showDrawerStatus('error', 'Please select both From and To dates.');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            showDrawerStatus('error', 'From date cannot be after To date.');
            return;
        }

        fetchAndDisplayAllData(currentStoreId, fromDate, toDate);
    });

    clearDateFilterButton.addEventListener('click', () => {
        filterFromDate.value = "";
        filterToDate.value = "";
        const currentStoreId = sessionStorage.getItem('storeId');
        if (currentStoreId) {
            // Re-fetch with no date filter (or default to today's range)
            fetchAndDisplayAllData(currentStoreId, "", ""); // Pass empty strings to get all data
        }
    });

    // Initial data fetch when drawer opens (handled by hamburgerIcon click listener)
    // No need for direct call here, as it's triggered by hamburger click.
});
