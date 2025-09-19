# zeroTRACE — Privacy-First AI & DSA Problem Solver

**Hackathon Project | Built for the Future of Privacy and AI**

---

## 📖 Overview

`zeroTRACE` is a **privacy-first AI extension and problem-solving platform**.  
It empowers developers, learners, and enterprises to use **AI pipelines securely** with zero trace left behind.  

- **Zero-trace browsing extension** → secure, ephemeral sessions.  
- **DSA Solver Engine** → parse problems, generate solutions, auto-create test cases.  
- **Modular architecture** → scalable from student projects to enterprise use.  

---

## 🖼️ Screenshots

<p align="center">
  <img src="./WhatsApp Image 2025-09-19 at 14.11.53 (1).jpeg" width="280"/>
  <img src="./WhatsApp Image 2025-09-19 at 14.22.26.jpeg" width="280"/>
  <img src="./WhatsApp Image 2025-09-19 at 14.22.50.jpeg" width="280"/>
</p>

---

## ⚙️ Architecture

```mermaid
flowchart TD

A[Browser User<br/>(zeroTRACE Extension)] --> B[Frontend: React<br/>(future-GPT)]
B --> C[Backend: Node.js<br/>(GPT-backend)]

C --> D[Privacy Layer<br/>(input/output sanitization)]
C --> E[Model Orchestrator<br/>(routes to local/remote LLMs)]
C --> F[DSA Solver Engine<br/>(parse → algo → code → tests)]
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
# → Runs at http://localhost:3000
3. Backend (GPT-backend)
bash
Copy code
cd ../GPT-backend
npm install
node server.js
# → Runs at http://localhost:8080
4. Extension
Open chrome://extensions

Enable Developer Mode

Click Load unpacked → select /extension folder

🔬 Technical Pipelines
Privacy Layer

Sanitizes and obfuscates input.

Default: no logging, no telemetry.

Model Orchestrator

Routes requests to local or external LLMs.

Abstracted for portability across providers.

DSA Solver Engine

Parses problem statements.

Selects algorithms dynamically.

Generates optimized code + test cases.

👥 Team
Nikita Chaurasia — UI/UX Design & Team Leader

Ali Razvi — Backend Engineering & Infrastructure

Raj Vardhan — AI Architecture & Solver Logic

🏆 Why It Wins
Privacy-first design → zero-trace guarantee.

DSA solver automation → time-saving + educational.

Enterprise scalability → modular, secure architecture.

Polish → product-level execution in a hackathon timeline.

📜 License
MIT License. Free for academic, research, and dev
