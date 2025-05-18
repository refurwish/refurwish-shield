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
    const getReportButton = document.getElementById('getReportButton'); // Get the "Get Report" button

    // Event listener for the warranty form submission (Generate Warranty)
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

    // Event listener for the date range form submission (Get Report)
    if (getReportButton) {
        getReportButton.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent the default form submission
            fetchReportData();
            closeSideDrawer();
        });
    }

    // Function to fetch and display data based on date range
    function fetchReportData() {
        const storeId = storeIdInput.value;
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;

        if (!storeId || !fromDate || !toDate) {
            errorMessage.classList.remove('hidden');
            errorMessage.textContent = 'Please provide all required inputs (store ID, from date, and to date).';
            return;
        }

        // Construct the URL with query parameters
        const url = `https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec?action=getReport&storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`;

        // Make a GET request to fetch data for the date range
        fetch(url, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Process and display the report data here
                console.log("Report Data:", data.reportData);
                //  Update the UI to display the report data.  For example:
                //  1. Create a new <div> in your HTML (e.g., <div id="reportContainer"></div>)
                //  2.  Then, in this function, update that div's content:
                //     document.getElementById('reportContainer').innerHTML = generateReportHTML(data.reportData);
                //  3.  Create a function generateReportHTML() to format the data as HTML (table, list, etc.)
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        })
        .catch(error => {
            errorMessage.classList.remove('hidden');
            errorMessage.textContent = 'An error occurred while fetching the report: ' + error.message;
        });
    }

    //  The openSideDrawer and closeSideDrawer functions are called from HTML.
    window.openSideDrawer = function() {
        document.getElementById("sideDrawer").style.width = "250px";
    };

    window.closeSideDrawer = function() {
        document.getElementById("sideDrawer").style.width = "0";
    };
});
