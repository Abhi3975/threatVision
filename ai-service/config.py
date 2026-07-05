import os

# Backend endpoint that receives detections.
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")

# YOLO model weights. Defaults to the small pretrained COCO model.
# Point this at custom weights to enable weapon/fire detection.
MODEL_PATH = os.getenv("MODEL_PATH", "yolov8n.pt")

# Minimum confidence before a detection is reported.
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.5"))

# Number of people in one frame before it counts as a crowd.
CROWD_SIZE = int(os.getenv("CROWD_SIZE", "3"))

# Pixel distance a person's centre must move between frames to count as running.
RUNNING_SPEED = int(os.getenv("RUNNING_SPEED", "60"))

# Cameras listed here raise an intrusion alert on any person detection.
RESTRICTED_CAMERAS = [c for c in os.getenv("RESTRICTED_CAMERAS", "3").split(",") if c]
