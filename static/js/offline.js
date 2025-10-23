// Offline Mode JavaScript for Liver Tumor Detection App

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview');
    const previewImage = document.getElementById('preview-image');
    const processButton = document.getElementById('process-button');
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
    processButton.addEventListener('click', processImageOffline);
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

    function processImageOffline() {
        // Show loading state
        processButton.disabled = true;
        processButton.textContent = 'Processing...';
        
        // In a real implementation, this would use TensorFlow.js to run the model in the browser
        // For this demo, we'll simulate processing with a timeout
        setTimeout(() => {
            // Simulate random results for demo purposes
            const hasTumor = Math.random() > 0.5;
            const tumorArea = hasTumor ? (Math.random() * 15 + 5).toFixed(2) : 0;
            const filename = fileInput.files[0].name;
            
            // Create a simulated result image (in a real app, this would be processed by TensorFlow.js)
            simulateProcessedImage(previewImage.src, hasTumor, tumorArea, (processedImageSrc) => {
                displayResults({
                    image: processedImageSrc,
                    has_tumor: hasTumor,
                    tumor_area: parseFloat(tumorArea),
                    filename: filename
                });
            });
        }, 2000);
    }

    function simulateProcessedImage(imageSrc, hasTumor, tumorArea, callback) {
        // Create a canvas to manipulate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // If tumor detected, add a simulated tumor region
            if (hasTumor) {
                // Draw a red circle to represent tumor
                const centerX = canvas.width * (0.3 + Math.random() * 0.4);
                const centerY = canvas.height * (0.3 + Math.random() * 0.4);
                const radius = Math.min(canvas.width, canvas.height) * (0.05 + Math.random() * 0.1);
                
                // Semi-transparent red overlay
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Green contour
                ctx.globalAlpha = 1.0;
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Add text
                ctx.font = '20px Arial';
                ctx.fillStyle = 'white';
                ctx.fillRect(10, 10, 200, 30);
                ctx.fillStyle = 'red';
                ctx.fillText('Tumor Detected', 20, 30);
            } else {
                // Add text for no tumor
                ctx.font = '20px Arial';
                ctx.fillStyle = 'white';
                ctx.fillRect(10, 10, 200, 30);
                ctx.fillStyle = 'green';
                ctx.fillText('No Tumor Detected', 20, 30);
            }
            
            // Return the processed image
            callback(canvas.toDataURL('image/png').split(',')[1]);
        };
        
        img.src = imageSrc;
    }

    function displayResults(data) {
        // Display the result image
        resultImage.src = 'data:image/png;base64,' + data.image;
        
        // Update tumor status
        if (data.has_tumor) {
            tumorStatus.textContent = 'Tumor Detected (Offline Analysis)';
            tumorStatus.className = 'status-box status-positive';
            
            // Add tumor details
            tumorDetails.innerHTML = `
                <p><strong>Tumor Area:</strong> ${data.tumor_area.toFixed(2)}% of liver</p>
                <p><strong>File:</strong> ${data.filename}</p>
                <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Mode:</strong> Offline (Local Processing)</p>
                <p><strong>Note:</strong> This is an automated analysis. Please consult with a medical professional for diagnosis.</p>
            `;
        } else {
            tumorStatus.textContent = 'No Tumor Detected (Offline Analysis)';
            tumorStatus.className = 'status-box status-negative';
            
            tumorDetails.innerHTML = `
                <p><strong>File:</strong> ${data.filename}</p>
                <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Mode:</strong> Offline (Local Processing)</p>
                <p><strong>Note:</strong> This is an automated analysis. Please consult with a medical professional for diagnosis.</p>
            `;
        }
        
        // Show results section
        previewContainer.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Reset process button
        processButton.disabled = false;
        processButton.textContent = 'Process Locally';
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
            link.download = 'tumor_analysis_offline_result.png';
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