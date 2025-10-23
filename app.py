from flask import Flask, render_template, request, jsonify
import os
import numpy as np
from PIL import Image
import cv2
import io
import base64
from model import TumorDetector

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize model
tumor_detector = TumorDetector()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Save the uploaded file
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        
        # Process the image
        try:
            # Read the image
            img = cv2.imread(filename)
            if img is None:
                return jsonify({'error': 'Invalid image file'}), 400
            
            # Detect and segment tumor
            result_img, has_tumor, tumor_area = tumor_detector.detect_and_segment(img)
            
            # Convert result image to base64 for display
            _, buffer = cv2.imencode('.png', result_img)
            img_str = base64.b64encode(buffer).decode('utf-8')
            
            return jsonify({
                'image': img_str,
                'has_tumor': bool(has_tumor),
                'tumor_area': float(tumor_area) if has_tumor else 0,
                'filename': file.filename
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/offline_mode')
def offline_mode():
    return render_template('offline.html')

if __name__ == '__main__':
    app.run(debug=True)