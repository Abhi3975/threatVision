import math
from config import MODEL_PATH, CONF_THRESHOLD, CROWD_SIZE, RUNNING_SPEED, RESTRICTED_CAMERAS

# Model class names mapped to the threat categories the dashboard understands.
CLASS_MAP = {
    "person": "person",
    "knife": "knife",
    "gun": "weapon",
    "pistol": "weapon",
    "rifle": "weapon",
    "weapon": "weapon",
    "fire": "fire",
}


class Detector:
    def __init__(self):
        self.model = None
        self.prev_centroids = []
        try:
            from ultralytics import YOLO
            self.model = YOLO(MODEL_PATH)
            print(f"Loaded YOLO model: {MODEL_PATH}")
        except Exception as exc:
            print(f"YOLO unavailable ({exc}); running without a model.")

    def available(self):
        return self.model is not None

    def process_frame(self, frame, camera_id=None):
        if self.model is None:
            return []

        results = self.model(frame, verbose=False)[0]
        names = results.names
        detections = []
        centroids = []
        people = 0

        for box in results.boxes:
            confidence = float(box.conf[0])
            if confidence < CONF_THRESHOLD:
                continue

            label = names[int(box.cls[0])]
            threat = CLASS_MAP.get(label)
            if threat is None:
                continue

            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]

            if threat == "person":
                people += 1
                centroids.append(((x1 + x2) / 2, (y1 + y2) / 2))
                if self._is_running(centroids[-1]):
                    detections.append({"threat_type": "running", "confidence": confidence})
                if str(camera_id) in RESTRICTED_CAMERAS:
                    detections.append({"threat_type": "intrusion", "confidence": confidence})

            detections.append({"threat_type": threat, "confidence": confidence})

        if people >= CROWD_SIZE:
            detections.append({"threat_type": "crowd", "confidence": 0.9})

        self.prev_centroids = centroids
        return detections

    def _is_running(self, centroid):
        # A person is "running" if their centre moved far from the nearest
        # centre in the previous frame.
        if not self.prev_centroids:
            return False
        nearest = min(
            math.dist(centroid, prev) for prev in self.prev_centroids
        )
        return nearest > RUNNING_SPEED
