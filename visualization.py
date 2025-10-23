import cv2
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

def overlay_segmentation(image, mask, alpha=0.5, color=(0, 0, 255)):
    """
    Overlay segmentation mask on the original image
    
    Args:
        image: Original image
        mask: Binary segmentation mask
        alpha: Transparency factor
        color: RGB color for the overlay
    
    Returns:
        Overlaid image
    """
    # Create a colored mask
    colored_mask = np.zeros_like(image)
    colored_mask[mask > 0] = color
    
    # Blend the original image with the colored mask
    blended = cv2.addWeighted(image, 1, colored_mask, alpha, 0)
    
    # Draw contour around the segmentation
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(blended, contours, -1, (0, 255, 0), 2)
    
    return blended

def add_text_overlay(image, text_items):
    """
    Add text overlay to the image
    
    Args:
        image: Input image
        text_items: List of (text, position, color, font_scale) tuples
    
    Returns:
        Image with text overlay
    """
    result = image.copy()
    
    for text, position, color, font_scale in text_items:
        cv2.putText(
            result, 
            text, 
            position, 
            cv2.FONT_HERSHEY_SIMPLEX, 
            font_scale, 
            color, 
            2
        )
    
    return result

def create_tumor_report(image, has_tumor, tumor_area=None, confidence=None):
    """
    Create a comprehensive visualization report for tumor detection
    
    Args:
        image: Processed image with segmentation
        has_tumor: Boolean indicating tumor presence
        tumor_area: Percentage of tumor area (if tumor present)
        confidence: Detection confidence score
    
    Returns:
        Report image with all visualizations
    """
    # Create a larger canvas for the report
    h, w = image.shape[:2]
    report = np.ones((h + 150, w, 3), dtype=np.uint8) * 255
    
    # Add the processed image to the report
    report[:h, :w] = image
    
    # Add a separator line
    cv2.line(report, (0, h), (w, h), (200, 200, 200), 2)
    
    # Add report text
    status_text = "TUMOR DETECTED" if has_tumor else "NO TUMOR DETECTED"
    status_color = (0, 0, 255) if has_tumor else (0, 255, 0)
    
    text_items = [
        (status_text, (20, h + 40), status_color, 0.8)
    ]
    
    if confidence is not None:
        text_items.append((f"Confidence: {confidence:.2f}", (20, h + 80), (0, 0, 0), 0.7))
    
    if has_tumor and tumor_area is not None:
        text_items.append((f"Tumor Area: {tumor_area:.2f}%", (20, h + 120), (0, 0, 0), 0.7))
    
    # Add warning text
    text_items.append(("For research purposes only. Consult a medical professional.", (w//2 - 180, h + 120), (100, 100, 100), 0.5))
    
    # Add text to the report
    report = add_text_overlay(report, text_items)
    
    return report

def image_to_base64(image):
    """
    Convert an image to base64 string
    
    Args:
        image: Input image
    
    Returns:
        Base64 encoded string
    """
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

def plot_segmentation_3d(mask, spacing=(1.0, 1.0, 1.0)):
    """
    Create a 3D visualization of the segmentation mask
    This is a placeholder function that would be implemented
    with actual 3D visualization in a production environment
    
    Args:
        mask: 3D segmentation mask
        spacing: Voxel spacing
    
    Returns:
        Base64 encoded string of the 3D visualization
    """
    # In a real implementation, this would create a 3D visualization
    # using libraries like plotly or matplotlib's 3D plotting
    
    # For demonstration, we'll create a simple 2D visualization
    plt.figure(figsize=(8, 6))
    plt.imshow(mask, cmap='jet')
    plt.colorbar(label='Tumor Probability')
    plt.title('Tumor Segmentation (2D Slice)')
    plt.axis('off')
    
    # Save the plot to a buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    
    # Convert to base64
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return img_str