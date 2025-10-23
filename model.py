import numpy as np
import cv2
import os
from fastai.vision.all import *
import tensorflow as tf

class TumorDetector:
    def __init__(self):
        self.model_path = os.path.join('models', 'tumor_model.tflite')
        self.segmentation_model_path = os.path.join('models', 'segmentation_model.pkl')
        
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Initialize TFLite model for detection
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        
        # Load models if they exist, otherwise use placeholder logic
        self._load_models()
    
    def _load_models(self):
        """Load TFLite and FastAI models if they exist, otherwise use placeholder logic"""
        try:
            # Try to load TFLite model
            if os.path.exists(self.model_path):
                self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                print("TFLite model loaded successfully")
            else:
                print("TFLite model not found, using placeholder detection")
            
            # Try to load FastAI segmentation model
            if os.path.exists(self.segmentation_model_path):
                self.segmentation_model = load_learner(self.segmentation_model_path)
                print("Segmentation model loaded successfully")
            else:
                print("Segmentation model not found, using placeholder segmentation")
                
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Using placeholder detection and segmentation")
    
    def preprocess_image(self, image):
        """Preprocess the image for model input"""
        # Resize to model input size
        img_resized = cv2.resize(image, (224, 224))
        
        # Normalize pixel values
        img_normalized = img_resized / 255.0
        
        # Convert to float32 and add batch dimension
        img_processed = np.expand_dims(img_normalized.astype(np.float32), axis=0)
        
        return img_processed, img_resized
    
    def detect_tumor(self, image):
        """Detect if tumor is present in the image"""
        # If model is loaded, use it for inference
        if self.interpreter is not None:
            # Preprocess image
            img_processed, _ = self.preprocess_image(image)
            
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], img_processed)
            
            # Run inference
            self.interpreter.invoke()
            
            # Get output tensor
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            # Process output (assuming binary classification)
            has_tumor = output_data[0][0] > 0.5
            confidence = float(output_data[0][0])
            
            return has_tumor, confidence
        else:
            # Placeholder logic for demo purposes
            # This would be replaced with actual model inference in production
            # For demo, we'll randomly detect tumors in 30% of images
            has_tumor = np.random.random() < 0.3
            confidence = np.random.random() * 0.5 + 0.5 if has_tumor else np.random.random() * 0.3
            
            return has_tumor, confidence
    
    def segment_tumor(self, image, has_tumor):
        """Segment tumor in the image if present"""
        if not has_tumor:
            return image, 0
        
        # If segmentation model is loaded, use it
        if hasattr(self, 'segmentation_model'):
            # Use FastAI model for segmentation
            # This would be implemented with the actual model in production
            pass
        
        # Placeholder segmentation logic for demo purposes
        # In a real implementation, this would use the FastAI model
        h, w = image.shape[:2]
        
        # Create a mask (simulating tumor segmentation)
        mask = np.zeros((h, w), dtype=np.uint8)
        
        # Simulate a tumor region (circular shape)
        center_x = np.random.randint(w//4, 3*w//4)
        center_y = np.random.randint(h//4, 3*h//4)
        radius = np.random.randint(w//10, w//5)
        
        cv2.circle(mask, (center_x, center_y), radius, 255, -1)
        
        # Calculate tumor area
        tumor_area = np.sum(mask > 0) / (h * w) * 100  # as percentage of image
        
        # Apply mask to create segmentation visualization
        segmented_img = image.copy()
        segmented_img[mask > 0] = [0, 0, 255]  # Highlight tumor in red
        
        # Create a blended visualization
        alpha = 0.6
        result = cv2.addWeighted(image, 1-alpha, segmented_img, alpha, 0)
        
        # Draw contour around tumor
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(result, contours, -1, (0, 255, 0), 2)
        
        return result, tumor_area
    
    def detect_and_segment(self, image):
        """Detect and segment tumor in the image"""
        # Make a copy of the image
        img_copy = image.copy()
        
        # Detect tumor
        has_tumor, confidence = self.detect_tumor(img_copy)
        
        # Segment tumor if detected
        result_img, tumor_area = self.segment_tumor(img_copy, has_tumor)
        
        # Add text with detection results
        text = f"Tumor: {'Yes' if has_tumor else 'No'}"
        confidence_text = f"Confidence: {confidence:.2f}"
        area_text = f"Area: {tumor_area:.2f}%" if has_tumor else ""
        
        cv2.putText(result_img, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(result_img, confidence_text, (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        if has_tumor:
            cv2.putText(result_img, area_text, (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        return result_img, has_tumor, tumor_area