document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('warrantyForm');
    const loading = document.getElementById('loading');
    const successContainer = document.getElementById('successContainer');
    const errorMessage = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const storeIdInput = document.getElementById('storeId');

    const phonePriceInput = document.getElementById('phonePrice');
    const showPlanPricesButton = document.getElementById('showPlanPricesButton');
    const planSelectionSection = document.getElementById('planSelectionSection');
    const generateCertificateButton = document.getElementById('generateCertificateButton');

    // New element references for direct plan selection
    const planOptionsContainer = document.getElementById('planOptionsContainer');
    const selectedPlanValueInput = document.getElementById('selectedPlanValue');
    const selectedPlanPriceInput = document.getElementById('selectedPlanPrice');
    const selectedPlanTypeInput = document.getElementById('selectedPlanType');
    const selectedPlanDetailsInput = document.getElementById('selectedPlanDetails');

    // NEW: Back button element
    const backToPhonePriceButton = document.createElement('button');
    backToPhonePriceButton.textContent = '← Change Phone Price';
    backToPhonePriceButton.classList.add('submit-button'); // Reusing some styling, adjust as needed
    backToPhonePriceButton.style.marginTop = '10px';
    backToPhonePriceButton.style.backgroundColor = '#6c757d'; // A greyish color for a back button
    backToPhonePriceButton.style.borderColor = '#6c757d';
    backToPhonePriceButton.style.color = 'white';
    backToPhonePriceButton.style.cursor = 'pointer';
    backToPhonePriceButton.style.display = 'none'; // Initially hidden
    // Insert it after the "Show Plan Prices" button for better UX
    showPlanPricesButton.parentNode.insertBefore(backToPhonePriceButton, showPlanPricesButton.nextSibling);


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

    // Function to calculate extended warranty price based on phone price
    function getExtendedWarrantyPrice(phonePrice) {
        for (const plan of extendedWarrantyPrices) {
            if (phonePrice <= plan.maxPrice) {
                return plan.price;
            }
        }
        // If phone price exceeds max defined range, return price of the highest slab
        return extendedWarrantyPrices[extendedWarrantyPrices.length - 1].price;
    }

    // Function to populate plan options as buttons
    function populatePlanOptions(phonePrice) {
        planOptionsContainer.innerHTML = ''; // Clear existing buttons

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        const allPlans = [
            {
                value: 'extended_warranty',
                text: `Extended Warranty (₹${extendedPrice})`,
                price: extendedPrice,
                internalType: 'extended',
                periodText: '12 Months Extended'
            },
            {
                value: 'screen_protection',
                text: `Screen Protection Plan (₹${screenDamagePrice})`,
                price: screenDamagePrice,
                internalType: 'screen_protection',
                periodText: '12 Months'
            },
            {
                value: 'total_damage_protection',
                text: `Total Damage Protection (₹${totalDamagePrice})`,
                price: totalDamagePrice,
                internalType: 'total_damage',
                periodText: '12 Months'
            },
            {
                value: 'combo_screen_extended',
                text: `Combo (Screen Damage + Extended Warranty) (₹${Math.round(screenDamagePrice + (extendedPrice * 0.5))})`,
                price: Math.round(screenDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_screen_extended',
                periodText: '24 Months Total'
            },
            {
                value: 'combo_total_extended',
                text: `Combo (Total Damage Protection + Extended Warranty) (₹${Math.round(totalDamagePrice + (extendedPrice * 0.5))})`,
                price: Math.round(totalDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_total_extended',
                periodText: '24 Months Total'
            }
        ];

        allPlans.forEach(plan => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('plan-button');
            button.textContent = plan.text;

            button.setAttribute('data-value', plan.value);
            button.setAttribute('data-price', plan.price);
            button.setAttribute('data-plantype', plan.internalType);
            button.setAttribute('data-details', plan.text);

            button.addEventListener('click', function() {
                const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }
                button.classList.add('selected');

                selectedPlanValueInput.value = plan.value;
                selectedPlanPriceInput.value = plan.price;
                selectedPlanTypeInput.value = plan.internalType;
                selectedPlanDetailsInput.value = plan.text;

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
            'customerName',
            'customerEmail',
            'customerPhone',
            'productName',
            'imeiNumber',
            'purchaseDate',
            'phonePrice'
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

        return isValid;
    }

    showPlanPricesButton.addEventListener('click', function (e) {
        e.preventDefault();

        if (validateCustomerAndPhoneDetails()) {
            const phonePrice = parseFloat(phonePriceInput.value);
            populatePlanOptions(phonePrice);
            planSelectionSection.classList.remove('hidden');
            showPlanPricesButton.classList.add('hidden');
            backToPhonePriceButton.style.display = 'block'; // Show the back button
            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            alert('Please fill in all customer and phone details correctly before proceeding to plan selection.');
        }
    });

    // NEW: Event listener for the "Back to Phone Price" button
    backToPhonePriceButton.addEventListener('click', function() {
        planSelectionSection.classList.add('hidden'); // Hide plan selection
        showPlanPricesButton.classList.remove('hidden'); // Show "Show Plan Prices" button
        backToPhonePriceButton.style.display = 'none'; // Hide back button
        // Optional: clear selected plan to force re-selection if user goes back
        const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        // Scroll back to the phone price input
        phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!selectedPlanValueInput.value) {
            alert('Please select a Plan.');
            planOptionsContainer.classList.add('error');
            return;
        } else {
            planOptionsContainer.classList.remove('error');
        }

        loading.classList.remove('hidden');
        successContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        pdfLinkSection.classList.add('hidden');

        const formData = new FormData(form);

        fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
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
                    form.reset();

                    const storeId = sessionStorage.getItem('storeId');
                    if (storeId) {
                        storeIdInput.value = storeId;
                    }
                    planSelectionSection.classList.add('hidden');
                    showPlanPricesButton.classList.remove('hidden');
                    backToPhonePriceButton.style.display = 'none'; // Hide back button after successful submission

                    const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedPlanValueInput.value = '';
                    selectedPlanPriceInput.value = '';
                    selectedPlanTypeInput.value = '';
                    selectedPlanDetailsInput.value = '';

                    pdfLinkSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            })
            .catch(error => {
                errorMessage.classList.remove('hidden');
                errorMessage.textContent = 'An error occurred: ' + error.message;
            })
            .finally(() => {
                loading.classList.add('hidden');
            });
    });
});
