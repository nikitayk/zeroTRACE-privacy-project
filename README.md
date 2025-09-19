zeroTRACE — Privacy-First AI & DSA Problem Solver 🔐⚡

Hackathon-ready • Privacy-first • Zero-Trace browsing + DSA problem solver
A polished, production-minded extension and platform that blends privacy-by-design with a high-performance DSA/AI solver. Made to win judges’ hearts — crisp UX, auditable pipelines, and strict privacy defaults.

<!-- Badges (Shields) -->






✨ Hero / Visuals

A single glance should tell the whole story. Below are the three official project screenshots (only these three images are used, as requested). Place these images in the repo root with the exact filenames included below.

<table> <tr> <td><img src="./WhatsApp Image 2025-09-19 at 14.11.53 (1).jpeg" alt="zeroTRACE - Dashboard" width="360"/></td> <td><img src="./WhatsApp Image 2025-09-19 at 14.22.26.jpeg" alt="zeroTRACE - Welcome" width="360"/></td> <td><img src="./WhatsApp Image 2025-09-19 at 14.22.50.jpeg" alt="zeroTRACE - Problem Solver" width="360"/></td> </tr> </table>
TL;DR — What is zeroTRACE?

zeroTRACE is a privacy-first browser extension + web app designed for:

Secure, ephemeral AI assistance that leaves zero trace on servers or local history.

A DSA Problem Solver with code-generation and test scaffolding for competitive programming.

Usable offline-first patterns where possible and strict privacy defaults (no tracking, minimal telemetry, on-device caching only when permitted).

This project was built for a hackathon with the goal to showcase an end-to-end privacy-first AI experience for learners and competitive programmers.

Why it wins (judge-friendly bullets)

Privacy-first architecture — minimal data flows, optional encryption, ephemeral contexts. Judges appreciate risk-aware designs.

Instant value for users — built-in DSA solver + test generation dramatically speeds up learning and interview prep.

Polished UI/UX — professional dark aesthetic, intuitive workspace for both beginners and advanced users (see screenshots).

Clear team roles + ownership — each core area assigned to specialists (see Contributors).

Reproducible setup & CI-friendly — clear runbook for judges to try locally in <5 minutes.

Features (short)

Ephemeral session AI: model interactions do not persist unless explicitly saved.

DSA Problem Solver: paste problems, select difficulty, generate code & tests.

Browser extension for privacy-first sessions.

Modular backend AI pipeline for custom LLMs / local inference.

Fine-grained user controls for telemetry and local caching.

Architecture Overview — High Level
[Browser Extension] <---> [Frontend App: future-GPT] <---> [Backend: GPT-backend]
       |                                         |
       |-------- optional local cache ---------->|
       |                                         |
User Browser                                 AI Pipeline (server-side)
                                              - Request Sanitizer
                                              - Differential privacy layer (optional)
                                              - Model orchestrator -> Private LLM / Engine
                                              - Response sanitizer -> Frontend


Key pipelines

Inference pipeline: Input -> Sanitizer -> (Optional local obfuscation) -> Model Orchestrator -> Post-processor -> User

DSA solver pipeline: Problem + constraints -> Problem Parser -> Algorithm Selector -> Code Generator -> Test Generator -> Run & Validate

Privacy controls: Toggle telemetry, data retention, encryption on/off via UI.

Tech Stack (core)

Frontend: React (future-GPT folder) — modern componentized UI

Backend: Node.js (GPT-backend folder) — express + orchestration

AI: Adapter modules to local or remote LLMs, with safety hooks

Other: npm/Yarn, manifest v3 (for extension), optional Docker for reproducibility

Contributors

Nikita Chaurasia — UI/UX Designer & Team Leader

Ali Razvi — Backend Engineer (model orchestration, infra)

Raj Vardhan — AI Architect (model design, solver logic)

Installation & Quick Start (copy-paste)

Important — I used the exact folder names you specified. If your folders are named differently update commands accordingly.

Clone repo

git clone https://github.com/nikitayk/zeroTRACE-privacy-project.git
cd zeroTRACE-privacy-project


Frontend (named future-GPT in repo)

# install & run frontend
cd future-GPT
npm install
# dev mode
npm run dev
# or build for production
npm run build
# frontend will typically run on http://localhost:3000


Backend (named GPT-backend in repo)

cd ../GPT-backend
npm install

# create .env (example)
cat > .env <<EOF
PORT=8080
MODEL_ENDPOINT=<your-private-model-or-api>
JWT_SECRET=<strong-secret>
ALLOW_TELEMETRY=false
EOF

# start backend
node server.js
# or for dev:
npm run dev


Run the extension (if included)

Load the extension in Chrome/Edge via chrome://extensions → Load unpacked → point to /extension (or whichever folder contains the manifest).

Confirm extension permissions and privacy toggles.

Environment variables & security notes

Keep MODEL_ENDPOINT private. Prefer local LLMs or VPN'd endpoints for hackathon demos.

ALLOW_TELEMETRY=false by default — explicitly opt-in for any telemetry.

For production, always use HTTPS and enable server-side encryption-at-rest for saved user preferences.

API / Endpoints (example)

Basic endpoints implemented by GPT-backend:

POST /api/v1/infer — send sanitized prompt → returns response

POST /api/v1/dsa/solve — send problem text + language + difficulty → returns code, tests

GET /api/v1/status — health & model status

(See GPT-backend/routes for exact signatures and sample payloads.)

Testing & Local validation

Unit tests: cd GPT-backend && npm test

Frontend tests: cd future-GPT && npm test

DSA test harness: cd GPT-backend && npm run generate-tests (generates and runs sample test cases for the DSA solver)

Demo / Judges PPT

I have uploaded the presentation draft for judges; see the project PPT for the final pitch and slides: 

final draft

Security & Privacy Design (short)

Data minimization: only required inputs are transmitted.

Ephemeral sessions: default no persistence; users must opt-in to save sessions.

Sanitization & obfuscation: user input goes through a sanitizer before any external calls.

Local-first patterns: where possible compute results locally or using user-chosen model endpoints.

How to evaluate during the demo

Show privacy toggle: enable/disable telemetry — explain differences.

Paste a DSA problem in the solver UI and generate code + tests (demonstrate Generate Tests).

Open extension → start ephemeral session → show no stored logs (prove privacy).

Walk judges through architecture diagram and call out security controls and model orchestration.

Judging checklist (what to emphasize)

Privacy by design — minimal data retention (✅)

Technical complexity — on-device / pipeline orchestration (✅)

Student value — DSA solver improves learning speed (✅)

UX polish — screenshots + demo ready (✅)

Team cohesion and role clarity (✅)

License

MIT — please attribute the team when using any code or assets.

Contact & Next steps

Repository owner: Nikita Chaurasia

Backend: Ali Razvi

AI Architecture: Raj Vardhan
