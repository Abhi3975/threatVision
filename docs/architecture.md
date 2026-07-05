# Architecture

ThreatWatch-AI is split into three services that each do one job.

## 1. Frontend (Next.js)

The dashboard is a Next.js App Router project. Pages fetch data from the backend REST
API and open a Socket.IO connection for live alerts. The alert hook (`lib/useAlerts.js`)
keeps a rolling list of the latest detections, plays a short beep, and raises a browser
notification for anything above low severity.

Pages:

- `/` – camera grid, live alert feed, and session stats
- `/events` – filterable event log with CSV export
- `/analytics` – detection breakdowns and a 24-hour activity chart
- `/cameras` – add, remove, and toggle cameras
- `/evidence` – gallery of captured frames

## 2. Backend (Node.js / Express)

The backend owns the database and the WebSocket server. It exposes a REST API for the
dashboard and an `/api/ingest` endpoint that the AI service posts detections to. Every
new detection is stored in SQLite and broadcast to connected dashboards through
Socket.IO.

When `DEMO_MODE` is on, a simulator generates believable detections on a timer so the
system is fully demoable without any camera hardware.

### Data model

**cameras** – `id, name, location, stream_url, status, created_at`

**events** – `id, camera_id, threat_type, severity, confidence, snapshot, acknowledged, created_at`

Severity is derived from the threat type: weapon, knife, and fire are critical;
intrusion is high; crowd and running are medium; a plain person is low.

## 3. AI Service (Python / FastAPI)

The detection service reads frames from an uploaded video or an RTSP stream with OpenCV
and runs them through YOLOv8. Uploaded jobs go onto a queue that a background worker
drains one at a time, so several clips can be submitted without blocking the API.

Threat mapping:

- `person` and `knife` come straight from the YOLO COCO classes
- `crowd` is raised when enough people appear in one frame
- `running` is inferred from how far a person's centre moves between frames
- `intrusion` is raised when a person appears on a camera marked as restricted
- `weapon` and `fire` require custom-trained weights (set `MODEL_PATH`)

Each reported threat includes a JPEG of the frame, which the backend saves as evidence.

## Request flow for a live detection

1. AI service detects a threat in a frame
2. It POSTs `{ cameraId, threatType, confidence, image }` to `/api/ingest`
3. Backend stores the event and saves the frame
4. Backend emits an `alert` over Socket.IO
5. Every open dashboard updates instantly and notifies the operator
