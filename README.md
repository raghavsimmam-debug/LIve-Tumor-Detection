# Real-Time Liver Tumor Detection and Segmentation WebApp

A lightweight, real-time liver tumor detection and segmentation application leveraging TensorFlow Lite and FastAI frameworks.

## Features

- **Instantaneous tumor detection and visualization** from CT scan images
- **Offline capability** for use in rural/low-internet areas
- **Lightweight design** optimized for low-end mobile devices
- **Interactive web interface** for easy upload and analysis
- **Detailed visualization** of tumor segmentation results

## Installation

1. Clone this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
python app.py
```

## Usage

1. Open your web browser and navigate to `http://localhost:5000`
2. Upload a CT scan image using the interface
3. View the tumor detection and segmentation results
4. Download the analysis report

## Offline Mode

For areas with limited internet connectivity:

1. Navigate to the offline mode page
2. Upload images for local processing
3. Results are cached locally for future reference

## Project Structure

- `app.py` - Main Flask application
- `model.py` - TensorFlow Lite model implementation
- `model_training.py` - Script for training the detection model
- `segmentation_training.py` - Script for training the segmentation model
- `visualization.py` - Visualization utilities
- `offline.py` - Offline processing functionality
- `templates/` - HTML templates
- `static/` - CSS, JavaScript, and static assets
- `models/` - Directory for storing trained models

## Technical Details

- **Backend**: Python Flask
- **Deep Learning**: TensorFlow Lite, FastAI
- **Frontend**: HTML, CSS, JavaScript
- **Image Processing**: OpenCV, NumPy

## Development

To train the models with your own data:

1. Place your training data in a suitable directory
2. Modify the training scripts as needed
3. Run the training scripts:

```bash
python model_training.py
python segmentation_training.py
```

## License

This project is for educational and research purposes only. Not for clinical use.

## Disclaimer

This application is intended for research and educational purposes only. It should not be used for medical diagnosis. Always consult with a qualified healthcare professional for medical advice.