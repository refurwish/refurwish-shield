document.addEventListener('DOMContentLoaded', function () {
    const warrantyForm = document.getElementById('warrantyForm');
    const loading = document.getElementById('loading');
    const successContainer = document.getElementById('successContainer');
    const errorMessage = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const storeIdInput = document.getElementById('storeId');

    // Date range form and input fields in the side drawer
    const dateRangeForm = document.getElementById('dateRangeForm');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');

    // Event listener for the warranty form submission
    warrantyForm.addEventListener('submit', function (e) {
        e.preventDefault();

        loading.classList.remove('hidden');
        successContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        pdfLinkSection.classList.add('hidden');

        const formData = new FormData(warrantyForm);

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
                warrantyForm.reset();

                // Re-apply store ID after reset
                const storeId = sessionStorage.getItem('storeId');
                if (storeId) {
                    storeIdInput.value = storeId;
                }

                // Scroll into view
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

    // Event listener for the date range form submission in the side drawer
    dateRangeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        fetchReportData(); // Call the function to fetch and display the report
        closeSideDrawer(); // Close the side drawer after submitting the date range
    });

    // Function to fetch and display data based on date range
    function fetchReportData() {
        const storeId = storeIdInput.value; // Assuming store ID is still relevant for reports
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;

        if (!storeId || !fromDate || !toDate) {
            errorMessage.classList.remove('hidden');
            errorMessage.textContent = 'Please provide all required inputs (store ID, from date, and to date).';
            return;
        }

        // Collect data to send in the request
        const formData = new FormData();
        formData.append('storeId', storeId);
        formData.append('fromDate', fromDate);
        formData.append('toDate', toDate);

        // Make a POST request to fetch data for the date range
        fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec?action=getReport', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Process and display the report data here (for example, in a table or list)
                console.log("Report Data:", data.reportData); // Assuming your backend returns reportData
                // You will need to update your UI to display this data.
                // For example, you might create a new div in your HTML to show the report.
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        })
        .catch(error => {
            errorMessage.classList.remove('hidden');
            errorMessage.textContent = 'An error occurred while fetching the report: ' + error.message;
        });
    }

    // The open and close side drawer functions are now in the HTML
});

function openSideDrawer() {
    document.getElementById("sideDrawer").style.width = "250px";
}

function closeSideDrawer() {
    document.getElementById("sideDrawer").style.width = "0";
}
