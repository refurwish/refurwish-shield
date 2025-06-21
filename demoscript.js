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

    const planOptionsGrid = document.getElementById('planOptionsGrid'); // Changed ID here
    const selectedPlanValueInput = document.getElementById('selectedPlanValue');
    const selectedPlanPriceInput = document.getElementById('selectedPlanPrice');
    const selectedPlanTypeInput = document.getElementById('selectedPlanType');
    const selectedPlanDetailsInput = document.getElementById('selectedPlanDetails');
    const backToPhonePriceButton = document.getElementById('backToPhonePriceButton');

    const termsAndConditionsSection = document.getElementById('termsAndConditionsSection');
    const termsAndConditionsContent = document.getElementById('termsAndConditionsContent');
    const selectedPlanNameForTNC = document.getElementById('selectedPlanNameForTNC');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const generateCertificateButton = document.getElementById('generateCertificateButton');
    const viewFullTermsLink = document.getElementById('viewFullTermsLink');

    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mainDrawer = document.getElementById('mainDrawer');
    const drawerCloseButton = document.getElementById('drawerCloseButton');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const logoutButtonDrawer = document.getElementById('logoutButtonDrawer');
    const openTrackingButton = document.getElementById('openTrackingButton');
    const trackingSection = document.getElementById('trackingSection');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const filterTrackingDataButton = document.getElementById('filterTrackingDataButton');
    const trackingLoading = document.getElementById('trackingLoading');
    const trackingError = document.getElementById('trackingError');
    const trackingResults = document.getElementById('trackingResults');
    const trackingDateRangeDisplay = document.getElementById('trackingDateRange');
    const totalSubmissionsDisplay = document.getElementById('totalSubmissions');
    const totalCommissionDisplay = document.getElementById('totalCommission');
    const totalPaymentDisplay = document.getElementById('totalPayment');
    const totalAmountDisplay = document.getElementById('totalAmount');

    const loginPasswordInput = document.getElementById('loginPassword');
    const showPasswordToggle = document.getElementById('showPasswordToggle');

    const extendedWarrantyPrices = [
        { maxPrice: 10000, planText: '₹5,000 - ₹10,000', price: 449 },
        { maxPrice: 15000, planText: '₹10,001 - ₹15,000', price: 649 },
        { maxPrice: 20000, planText: '₹15,001 - ₹20,000', price: 899 },
        { maxPrice: 25000, planText: '₹20,001 - ₹25,000', price: 1199 },
        { maxPrice: 30000, planText: '₹25,001 - ₹30,000', price: 1499 },
        { maxPrice: 40000, planText: '₹30,001 - ₹40,000', price: 1899 },
        { maxPrice: 50000, planText: '₹40,001 - ₹50,000', price: 2199 },
        { maxPrice: 70000, planText: '₹50,001 - ₹70,000', price: 2999 },
        { maxPrice: 80000, planText: '₹70,001 - ₹80,000', price: 3799 },
        { maxPrice: 100000, planText: '₹80,001 - ₹1,00,000', price: 4499 },
        { maxPrice: 120000, planText: '₹1,00,001 - ₹1,20,000', price: 5999 },
        { maxPrice: 150000, planText: '₹1,20,001 - ₹1,50,000', price: 6999 },
        { maxPrice: 175000, planText: '₹1,50,001 - ₹1,75,000', price: 8499 },
        { maxPrice: 200000, planText: '₹1,75,001 - ₹2,00,000', price: 9499 },
        { maxPrice: 250000, planText: '₹2,00,001 - ₹2,50,000', price: 9999 },
    ];

    function getExtendedWarrantyPrice(phonePrice) {
        for (const plan of extendedWarrantyPrices) {
            if (phonePrice <= plan.maxPrice) {
                return plan.price;
            }
        }
        return extendedWarrantyPrices[extendedWarrantyPrices.length - 1].price;
    }

    const termsAndConditionsData = {
        "Extended Warranty": {
            content: "<p>These are the **Terms and Conditions for Extended Warranty** plan.</p><p>This plan covers manufacturing defects and functional issues beyond the standard manufacturer's warranty for 12 months. Please refer to the full document for exclusions and claim procedures.</p><p>This content should ideally come from your Google Doc.</p>",
            fullLink: "https://drive.google.com/uc?export=download&id=1sv9svRqkP2JW7hig9Lh2gUdedDhPZv_r"
        },
        "Screen Damage Protection": {
            content: "<p>These are the **Terms and Conditions for Screen Damage Protection** plan.</p><p>This plan covers physical damage to the screen for 12 months. Coverage includes screen repair or replacement as per policy limits. Accidental damage to other parts of the device is not covered.</p>",
            fullLink: "https://drive.google.com/uc?export=download&id=1styeSFp0T8lF3FYL6tU69xWk29t81snd"
        },
        "Total Damage Protection": {
            content: "<p>These are the **Terms and Conditions for Total Damage Protection** plan.</p><p>This comprehensive plan covers accidental physical damage, liquid damage, and other specified perils for 12 months. Limits and exclusions apply, detailed in the full terms.</p>",
            fullLink: "https://drive.google.com/uc?export=download&id=1sqXoSiJvHSfYoSqJjPqZzXAfg41Yiqar"
        },
        "Combo (Screen Damage Protection + Extended Warranty)": {
            content: "<p>These are the **Terms and Conditions for Combo (Screen Damage Protection + Extended Warranty)** plan.</p><p>This combo offers both screen damage protection (12 months) and extended warranty (12 months after manufacturer's warranty, totaling 24 months coverage). Refer to individual plan terms for specific details.</p>",
            fullLink: "https://drive.google.com/uc?export=download&id=1t3WJbGXiiyWOaaSCVjsk2u7RYLom0_B7"
        },
        "Combo (Total Damage Protection + Extended Warranty)": {
            content: "<p>These are the **Terms and Conditions for Combo (Total Damage Protection + Extended Warranty)** plan.</p><p>This combo provides comprehensive total damage protection (12 months) and extended warranty (12 months after manufacturer's warranty, totaling 24 months coverage). Review both individual plan terms for complete understanding.</p>",
            fullLink: "https://drive.google.com/uc?export=download&id=1t0z5Dx_8jXqBL3kqxksgYfez8pzANOU8"
        }
    };

    function loadTermsAndConditions(planName) {
        const tnc = termsAndConditionsData[planName];
        if (tnc) {
            selectedPlanNameForTNC.textContent = planName;
            termsAndConditionsContent.innerHTML = tnc.content;
            viewFullTermsLink.href = tnc.fullLink;
            viewFullTermsLink.target = "_blank"; // Ensure it opens in a new tab

            termsAndConditionsSection.classList.remove('hidden');
            setTimeout(() => {
                termsAndConditionsSection.classList.add('visible');
            }, 10);

            agreeTermsCheckbox.checked = false;
            toggleGenerateButton();
            termsAndConditionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            termsAndConditionsContent.innerHTML = "<p>No specific terms found for this plan. Please select a different plan.</p>";
            selectedPlanNameForTNC.textContent = "Selected Plan";
            viewFullTermsLink.href = "#";
            viewFullTermsLink.target = ""; // Clear target attribute if no valid link
            termsAndConditionsSection.classList.remove('visible');
            setTimeout(() => {
                termsAndConditionsSection.classList.add('hidden');
            }, 10);

            agreeTermsCheckbox.checked = false;
            toggleGenerateButton();
        }
    }

    function toggleGenerateButton() {
        generateCertificateButton.disabled = !agreeTermsCheckbox.checked;
    }

    if (agreeTermsCheckbox && generateCertificateButton) {
        agreeTermsCheckbox.addEventListener('change', toggleGenerateButton);
        toggleGenerateButton();
    } else {
        console.error("Error: Could not find 'agreeTerms' checkbox or 'generateCertificateButton'. Please check your HTML IDs.");
    }

    function populatePlanOptions(phonePrice) {
        planOptionsGrid.innerHTML = '';

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.06);
        const totalDamagePrice = Math.round(phonePrice * 0.1);

        const allPlans = [
            { value: 'extended_warranty', name: 'Extended Warranty', price: extendedPrice, internalType: 'extended', periodText: '12 Months Extended', icon: 'extension', description: 'Covers manufacturing defects beyond standard warranty.' },
            { value: 'screen_protection', name: 'Screen Damage Protection', price: screenDamagePrice, internalType: 'screen_protection', periodText: '12 Months', icon: 'smartphone', description: 'Protects against accidental screen damage.' },
            { value: 'total_damage_protection', name: 'Total Damage Protection', price: totalDamagePrice, internalType: 'total_damage', periodText: '12 Months', icon: 'security', description: 'Comprehensive coverage for accidental and liquid damage.' },
            { value: 'combo_screen_extended', name: 'Combo (Screen Damage Protection + Extended Warranty)', price: Math.round(screenDamagePrice + (extendedPrice * 0.3)), internalType: 'combo_screen_extended', periodText: '24 Months Total', icon: 'devices', description: 'Screen protection and extended warranty combined.', isCombo: true },
            { value: 'combo_total_extended', name: 'Combo (Total Damage Protection + Extended Warranty)', price: Math.round(totalDamagePrice + (extendedPrice * 0.3)), internalType: 'combo_total_extended', periodText: '24 Months Total', icon: 'verified_user', description: 'Total damage protection and extended warranty combined.', isCombo: true }
        ];

        allPlans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.classList.add('plan-card');
            
            let comboRibbonHtml = '';
            let comboOfferTextHtml = '';

            if (plan.isCombo) {
                planCard.classList.add('combo-plan-card');
                comboRibbonHtml = '<div class="best-value-ribbon">BEST VALUE</div>';
                comboOfferTextHtml = '<p class="combo-offer-text">70% off on Extended Warranty</p>'; // New text
            }
            
            planCard.setAttribute('data-value', plan.value);
            planCard.setAttribute('data-price', plan.price);
            planCard.setAttribute('data-plantype', plan.internalType);
            planCard.setAttribute('data-details', `${plan.name} (${plan.periodText})`);

            planCard.innerHTML = `
                ${comboRibbonHtml}
                <p class="plan-name">${plan.name}</p>
                <p class="plan-description">${plan.description}</p>
                ${comboOfferTextHtml} <div class="plan-price">₹${plan.price.toLocaleString('en-IN')}</div>
                <div class="plan-period">${plan.periodText}</div>
            `;

            planCard.addEventListener('click', function() {
                const currentSelected = planOptionsGrid.querySelector('.plan-card.selected');
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }
                planCard.classList.add('selected');

                selectedPlanValueInput.value = plan.value;
                selectedPlanPriceInput.value = plan.price;
                selectedPlanTypeInput.value = plan.internalType;
                selectedPlanDetailsInput.value = planCard.getAttribute('data-details');

                planOptionsGrid.classList.remove('error');

                loadTermsAndConditions(plan.name);
            });

            planOptionsGrid.appendChild(planCard);
        });

        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        termsAndConditionsSection.classList.remove('visible');
        termsAndConditionsSection.classList.add('hidden');
        agreeTermsCheckbox.checked = false;
        toggleGenerateButton();
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

        if (!validateCustomerAndPhoneDetails()) {
            alert('Please fill in all required details correctly before proceeding to plan selection.');
            const firstErrorField = document.querySelector('.form-group input.error, .form-group select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const phonePrice = parseFloat(phonePriceInput.value);
        if (phonePrice < 5000 || phonePrice > 250000) {
            alert('Please enter phone price between ₹5,000 to ₹2,50,000.');
            phonePriceInput.classList.add('error');
            phonePriceInput.focus();
            phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            phonePriceInput.classList.remove('error');
        }

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

        planOptionsGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

        const currentSelected = planOptionsGrid.querySelector('.plan-card.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        planOptionsGrid.classList.remove('error');

        termsAndConditionsSection.classList.remove('visible');
        termsAndConditionsSection.classList.add('hidden');
        agreeTermsCheckbox.checked = false;
        toggleGenerateButton();
        phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!agreeTermsCheckbox.checked) {
            alert('Please agree to the Terms and Conditions before generating the certificate.');
            agreeTermsCheckbox.focus();
            termsAndConditionsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!selectedPlanValueInput.value) {
            alert('Please select a Plan.');
            planOptionsGrid.classList.add('error');
            planOptionsGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            planOptionsGrid.classList.remove('error');
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
        const appScriptWarrantyURL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec';

        fetch(appScriptWarrantyURL, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loading.classList.remove('visible');
                loading.classList.add('hidden');

                if (data.status === 'success') {
                    document.getElementById('successMessage').textContent = 'Certificate generated successfully!';
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

                    const currentSelected = planOptionsGrid.querySelector('.plan-card.selected');
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedPlanValueInput.value = '';
                    selectedPlanPriceInput.value = '';
                    selectedPlanTypeInput.value = '';
                    selectedPlanDetailsInput.value = '';

                    termsAndConditionsSection.classList.remove('visible');
                    termsAndConditionsSection.classList.add('hidden');
                    agreeTermsCheckbox.checked = false;
                    toggleGenerateButton();

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

    function openDrawer() {
        mainDrawer.classList.add('open');
        drawerOverlay.classList.remove('hidden');
        setTimeout(() => drawerOverlay.classList.add('visible'), 10);
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mainDrawer.classList.remove('open');
        drawerOverlay.classList.remove('visible');
        setTimeout(() => drawerOverlay.classList.add('hidden'), 300);
        document.body.style.overflow = '';
        trackingSection.classList.remove('visible');
        trackingSection.classList.add('hidden');
        trackingResults.classList.remove('visible');
        trackingResults.classList.add('hidden');
        trackingError.classList.remove('visible');
        trackingError.classList.add('hidden');
        trackingLoading.classList.remove('visible');
        trackingLoading.classList.add('hidden');
    }

    hamburgerMenu.addEventListener('click', openDrawer);
    drawerCloseButton.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    logoutButtonDrawer.addEventListener('click', () => {
        sessionStorage.removeItem('storeId');

        document.getElementById('loginForm').reset();
        form.reset();

        document.getElementById('loginStoreId').value = '';
        document.getElementById('loginPassword').value = '';
        storeIdInput.value = '';
        document.getElementById('displayedStoreId').textContent = '';

        document.getElementById('warrantySection').classList.remove('visible');
        document.getElementById('warrantySection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
        setTimeout(() => document.getElementById('loginSection').classList.add('visible'), 10);

        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('loginError').classList.remove('visible');
        document.getElementById('loginLoading').classList.add('hidden');
        document.getElementById('loginLoading').classList.remove('visible');
        document.getElementById('loginForm').querySelector('.submit-button').classList.remove('hidden');

        closeDrawer();

        fromDateInput.value = '';
        toDateInput.value = '';

        termsAndConditionsSection.classList.remove('visible');
        termsAndConditionsSection.classList.add('hidden');
        agreeTermsCheckbox.checked = false;
        toggleGenerateButton();
    });

    openTrackingButton.addEventListener('click', () => {
        trackingSection.classList.toggle('hidden');
        setTimeout(() => {
            trackingSection.classList.toggle('visible');
        }, 10);

        if (!fromDateInput.value || !toDateInput.value) {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
            toDateInput.value = today.toISOString().split('T')[0];
        }

        trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    filterTrackingDataButton.addEventListener('click', fetchTrackingData);

    async function fetchTrackingData() {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const storeId = sessionStorage.getItem('storeId');

        if (!storeId) {
            trackingError.textContent = 'Store ID not found. Please log in again.';
            trackingError.classList.remove('hidden');
            setTimeout(() => trackingError.classList.add('visible'), 10);
            return;
        }

        if (!fromDate || !toDate) {
            trackingError.textContent = 'Please select both From and To dates.';
            trackingError.classList.remove('hidden');
            setTimeout(() => trackingError.classList.add('visible'), 10);
            return;
        }

        trackingError.classList.remove('visible');
        trackingError.classList.add('hidden');
        trackingResults.classList.remove('visible');
        trackingResults.classList.add('hidden');
        trackingLoading.classList.remove('hidden');
        setTimeout(() => trackingLoading.classList.add('visible'), 10);

        const appScriptURL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec';

        const queryParams = new URLSearchParams({
            action: 'getTrackingData',
            storeId: storeId,
            fromDate: fromDate,
            toDate: toDate
        });

        try {
            const response = await fetch(`${appScriptURL}?${queryParams.toString()}`, {
                method: 'GET'
            });
            const data = await response.json();

            trackingLoading.classList.remove('visible');
            trackingLoading.classList.add('hidden');

            if (data.status === 'success') {
                totalSubmissionsDisplay.textContent = data.submissions;
                totalCommissionDisplay.textContent = `₹${data.commission.toLocaleString('en-IN')}`;
                totalPaymentDisplay.textContent = `₹${data.payment.toLocaleString('en-IN')}`;
                totalAmountDisplay.textContent = `₹${data.totalAmount.toLocaleString('en-IN')}`;
                trackingDateRangeDisplay.textContent = `${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`;

                trackingResults.classList.remove('hidden');
                setTimeout(() => trackingResults.classList.add('visible'), 10);
            } else {
                trackingError.textContent = data.message || 'Failed to fetch tracking data.';
                trackingError.classList.remove('hidden');
                setTimeout(() => trackingError.classList.add('visible'), 10);
            }
        } catch (error) {
            trackingLoading.classList.remove('visible');
            trackingLoading.classList.add('hidden');
            trackingError.textContent = 'An error occurred while fetching tracking data: ' + error.message;
            trackingError.classList.remove('hidden');
            setTimeout(() => trackingError.classList.add('visible'), 10);
        }
    }

    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    if (showPasswordToggle && loginPasswordInput) {
        showPasswordToggle.addEventListener('change', () => {
            if (showPasswordToggle.checked) {
                loginPasswordInput.type = 'text';
            } else {
                loginPasswordInput.type = 'password';
            }
        });
    }

    toggleGenerateButton();
    termsAndConditionsSection.classList.add('hidden');
});
