<div align="center">
  <img src="https://i.ibb.co/your-logo.png" alt="Nova AI Logo" width="120" />
  
  # 🚀 Nova AI
  
  **Your Personal, Self-Hosted AI Assistant**
  
  [![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
  [![Ollama](https://img.shields.io/badge/Ollama-0.1.6-000000?logo=ollama)](https://ollama.ai/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
  [✨ Features](#-features) • [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) • [🚀 Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing)
</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Chat** | Powered by Mistral 7B via Ollama – fully local, no API costs |
| 🔐 **Secure Authentication** | JWT-based login & registration with auto-login |
| 💬 **Conversation History** | All chats saved to database – never lose a conversation |
| 🎭 **6 Personalities** | Switch between Default, Pirate, Yoda, Sarcastic, Scientific, and Cheerful |
| 🌐 **Web Search** | Search the web directly from chat using `/search` |
| ⚡ **Code Execution** | Run Python code inline with `/run` – perfect for developers |
| 📥 **Export Chats** | Export conversations as PDF, JSON, or TXT |
| 🎨 **Cyberpunk UI** | Dark theme with glass-morphism, gradients, and smooth animations |
| 📱 **Mobile Responsive** | Fully responsive with slide-in sidebar on mobile |
| 🧠 **Long-Term Memory** | All conversations stored in SQLite database |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** – UI framework
- **Tailwind CSS** – Styling
- **Framer Motion** – Animations
- **React Router** – Navigation
- **React Markdown** – Message rendering
- **React Syntax Highlighter** – Code blocks
- **React Hot Toast** – Notifications
- **Vite** – Build tool

### Backend
- **FastAPI** – REST API framework
- **SQLite** – Database (PostgreSQL ready)
- **JWT** – Authentication
- **Python** – Core language
- **Ollama** – Local AI model runner

### AI Model
- **Mistral 7B** – Default model (can be swapped)
- **Ollama** – Model management

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** – [Download](https://www.python.org/downloads/)
- **Node.js 18+** – [Download](https://nodejs.org/)
- **Ollama** – [Download](https://ollama.ai/download)
- **Git** – [Download](https://git-scm.com/downloads)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/nova-ai.git
cd nova-ai