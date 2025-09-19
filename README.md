<h3 align="center"> ⚡ Built to leave <b><i>ZERO TRACE</i></b>. ⚡ </h3> ```
# zeroTRACE — Privacy-First AI & DSA Problem Solver

**A Hackathon Project | Built for the Future of Privacy and AI**

---

## 📖 Overview

`zeroTRACE` is a **privacy-first AI extension and problem-solving platform**.  
It is designed for developers, learners, and enterprises that want to leverage **AI problem-solving pipelines** without leaving a digital footprint.

This project combines:

- A **zero-trace browser extension** ensuring user inputs are sanitized and never stored.  
- A **DSA Solver Engine** that parses problems, selects algorithms, generates solutions, and produces test cases.  
- A **modular backend + frontend architecture** that can be scaled for individuals, teams, and organizations.  

It is more than a demo — it is a **deployable privacy-by-design product** built for hackathons, startups, and investors evaluating real-world impact.

---

## 🔑 Why zeroTRACE?

- **Privacy-first architecture** → data obfuscation, ephemeral sessions, and optional local inference.  
- **Developer-first** → AI-powered DSA solver that accelerates learning and competitive programming.  
- **Hackathon-ready polish** → clearly defined setup, reproducible pipeline, and immediate demo value.  
- **Scalable vision** → from students to enterprises, ensuring secure, auditable AI interactions.  

---

## 🖼️ Screenshots

<p align="center">
  <img src="./WhatsApp Image 2025-09-19 at 14.11.53 (1).jpeg" width="280"/>
  <img src="./WhatsApp Image 2025-09-19 at 14.22.26.jpeg" width="280"/>
  <img src="./WhatsApp Image 2025-09-19 at 14.22.50.jpeg" width="280"/>
</p>

---

## ⚙️ Architecture

```text
               ┌────────────────────┐
               │   Browser User      │
               │ (zeroTRACE Ext.)    │
               └─────────┬───────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Frontend: React   │
                │ (future-GPT)      │
                └─────────┬────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Backend: Node.js  │
                │ (GPT-backend)     │
                └─────────┬────────┘
                          │
          ┌───────────────┼─────────────────┐
          ▼               ▼                 ▼
   Privacy Layer   Model Orchestrator   DSA Solver Engine
   (input/output   (routes to local or  (parse → algo → 
   sanitization)   remote LLMs)         code → tests)
🚀 Installation & Setup
1. Clone repository
bash
Copy code
git clone https://github.com/nikitayk/zeroTRACE-privacy-project.git
cd zeroTRACE-privacy-project
2. Frontend (future-GPT)
bash
Copy code
cd future-GPT
npm install
npm run dev
# Runs at http://localhost:3000
3. Backend (GPT-backend)
bash
Copy code
cd ../GPT-backend
npm install
node server.js
# Runs at http://localhost:8080
4. Extension
Open chrome://extensions

Enable Developer Mode

Click Load unpacked and select the /extension folder

🔬 Technical Pipelines
Privacy Layer

Sanitizes input and strips sensitive data.

Default = no logging, no telemetry.

Optional local caching for offline use.

Model Orchestrator

Manages connections to LLM APIs or local models.

Abstracted layer for portability across providers.

DSA Solver Engine

Parses problem statements.

Selects optimal algorithms.

Generates clean, executable code.

Produces test cases for validation.

👥 Team
Nikita Chaurasia — UI/UX Design & Team Leader

Ali Razvi — Backend Engineering & Infrastructure

Raj Vardhan — AI Architecture & Solver Logic

🏆 Why It Wins Hackathons & Attracts Investors
Clear value proposition → solves privacy + AI adoption challenge.

Technical depth → modular architecture, security-first design.

Scalable impact → from students to enterprises.

Execution → polished product, not a prototype.

📜 License
MIT License. Free for academic, research, and development use with attribution.
