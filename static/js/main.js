// Main JavaScript for Liver Tumor Detection App

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview');
    const previewImage = document.getElementById('preview-image');
    const uploadButton = document.getElementById('upload-button');
    const cancelButton = document.getElementById('cancel-button');
    const resultsSection = document.getElementById('results-section');
    const resultImage = document.getElementById('result-image');
    const tumorStatus = document.getElementById('tumor-status');
    const tumorDetails = document.getElementById('tumor-details');
    const downloadButton = document.getElementById('download-button');
    const newScanButton = document.getElementById('new-scan-button');

    // Event Listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);
    uploadButton.addEventListener('click', uploadImage);
    cancelButton.addEventListener('click', cancelUpload);
    downloadButton.addEventListener('click', downloadResults);
    newScanButton.addEventListener('click', resetApp);

    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect() {
        const files = fileInput.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                displayPreview(file);
            } else {
                alert('Please upload a valid image file (JPG, PNG, or DICOM)');
            }
        }
    }

    function validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/dicom'];
        return validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.dcm');
    }

    function displayPreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        
        reader.readAsDataURL(file);
    }

    function uploadImage() {
        // Show loading state
        uploadButton.disabled = true;
        uploadButton.textContent = 'Analyzing...';
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                uploadButton.disabled = false;
                uploadButton.textContent = 'Analyze Image';
            } else {
                displayResults(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during analysis. Please try again.');
            uploadButton.disabled = false;
            uploadButton.textContent = 'Analyze Image';
        });
    }

    function displayResults(data) {
        // Display the result image
        resultImage.src = 'data:image/png;base64,' + data.image;
        
        // Update tumor status
        if (data.has_tumor) {
            tumorStatus.textContent = 'Tumor Detected';
            tumorStatus.className = 'status-box status-positive';
            
            // Add tumor details
            tumorDetails.innerHTML = `
                <p><strong>Tumor Area:</strong> ${data.tumor_area.toFixed(2)}% of liver</p>
                <p><strong>File:</strong> ${data.filename}</p>
                <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Note:</strong> This is an automated analysis. Please consult with a medical professional for diagnosis.</p>
            `;
        } else {
            tumorStatus.textContent = 'No Tumor Detected';
            tumorStatus.className = 'status-box status-negative';
            
            tumorDetails.innerHTML = `
                <p><strong>File:</strong> ${data.filename}</p>
                <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Note:</strong> This is an automated analysis. Please consult with a medical professional for diagnosis.</p>
            `;
        }
        
        // Show results section
        previewContainer.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Reset upload button
        uploadButton.disabled = false;
        uploadButton.textContent = 'Analyze Image';
    }

    function cancelUpload() {
        fileInput.value = '';
        previewContainer.classList.add('hidden');
    }

    function downloadResults() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement('a');
            link.download = 'tumor_analysis_result.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        img.src = resultImage.src;
    }

    function resetApp() {
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        resultsSection.classList.add('hidden');
    }
});