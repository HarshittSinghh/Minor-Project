import cv2
import numpy as np
# from deepface import DeepFace

def recognize_face(image, name):
    """Recognize face using DeepFace verification"""
    try:
        stored_image_path = f"../public/uploads/{name}.jpg" 
        result = DeepFace.verify(image, stored_image_path, model_name='Facenet')
        return result['verified']
    except Exception as e:
        print("Face recognition error:", e)
        return False
