import base64
import queue
import threading
import tempfile
import time

import requests
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from config import BACKEND_URL
from detector import Detector

app = FastAPI(title="ThreatWatch AI Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = Detector()
jobs = queue.Queue()
status = {"processing": False, "current": None, "detections": 0}


def report(camera_id, threat_type, confidence, frame_jpeg=None):
    payload = {
        "cameraId": camera_id,
        "threatType": threat_type,
        "confidence": round(confidence, 3),
    }
    if frame_jpeg is not None:
        payload["image"] = "data:image/jpeg;base64," + base64.b64encode(frame_jpeg).decode()
    try:
        requests.post(f"{BACKEND_URL}/api/ingest", json=payload, timeout=5)
        status["detections"] += 1
    except requests.RequestException as exc:
        print(f"Failed to report detection: {exc}")


def process_video(path, camera_id):
    import cv2

    capture = cv2.VideoCapture(path)
    frame_index = 0
    # Only analyse roughly two frames per second to keep the queue moving.
    stride = max(int(capture.get(cv2.CAP_PROP_FPS) or 30) // 2, 1)
    last_reported = {}

    while True:
        ok, frame = capture.read()
        if not ok:
            break
        frame_index += 1
        if frame_index % stride != 0:
            continue

        for det in detector.process_frame(frame, camera_id):
            threat = det["threat_type"]
            # Avoid spamming the same threat more than once every few seconds.
            now = time.time()
            if now - last_reported.get(threat, 0) < 3:
                continue
            last_reported[threat] = now

            ok, buffer = cv2.imencode(".jpg", frame)
            report(camera_id, threat, det["confidence"], buffer.tobytes() if ok else None)

    capture.release()


def worker():
    while True:
        path, camera_id = jobs.get()
        status.update(processing=True, current=path)
        try:
            process_video(path, camera_id)
        except Exception as exc:
            print(f"Error processing {path}: {exc}")
        finally:
            status.update(processing=False, current=None)
            jobs.task_done()


threading.Thread(target=worker, daemon=True).start()


@app.get("/health")
def health():
    return {"status": "ok", "modelLoaded": detector.available(), "queued": jobs.qsize()}


@app.get("/status")
def get_status():
    return status


@app.post("/process")
async def process(camera_id: int = Form(...), file: UploadFile = File(...)):
    suffix = "." + (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "mp4")
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        path = tmp.name

    jobs.put((path, camera_id))
    return {"queued": True, "position": jobs.qsize(), "camera": camera_id}


@app.post("/process-stream")
def process_stream(camera_id: int = Form(...), url: str = Form(...)):
    # RTSP/HTTP streams are opened by OpenCV the same way as a file.
    jobs.put((url, camera_id))
    return {"queued": True, "stream": url, "camera": camera_id}
