import os
import numpy as np
import cv2
from model import TumorDetector
from visualization import create_tumor_report, image_to_base64

class OfflineProcessor:
    """
    Class for offline processing of CT scan images
    """
    def __init__(self):
        # Initialize the tumor detector
        self.tumor_detector = TumorDetector()
        
        # Create cache directory for offline results
        os.makedirs('cache', exist_ok=True)
    
    def process_image(self, image_path):
        """
        Process an image file in offline mode
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with processing results
        """
        # Read the image
        img = cv2.imread(image_path)
        if img is None:
            return {'error': 'Invalid image file'}
        
        # Detect and segment tumor
        result_img, has_tumor, tumor_area = self.tumor_detector.detect_and_segment(img)
        
        # Create a detailed report
        report_img = create_tumor_report(
            result_img, 
            has_tumor, 
            tumor_area,
            confidence=0.85 if has_tumor else 0.15  # Placeholder confidence
        )
        
        # Convert to base64 for display
        img_str = image_to_base64(report_img)
        
        # Cache the result
        filename = os.path.basename(image_path)
        cache_path = os.path.join('cache', f"processed_{filename}")
        cv2.imwrite(cache_path, report_img)
        
        return {
            'image': img_str,
            'has_tumor': bool(has_tumor),
            'tumor_area': float(tumor_area) if has_tumor else 0,
            'filename': filename,
            'cache_path': cache_path
        }
    
    def get_cached_results(self):
        """
        Get list of cached results
        
        Returns:
            List of cached result filenames
        """
        if not os.path.exists('cache'):
            return []
        
        return [f for f in os.listdir('cache') if f.startswith('processed_')]