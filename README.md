# ExplainIt 🎓
### Explaining every topic, simply.

> An AI-powered study companion for Nigerian secondary school students — built for the **3MTT NextGen Knowledge Showcase (Special Edition)**.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [3MTT Programme](#3mtt-programme)
- [License](#license)

---

## Overview

**ExplainIt** is a free, AI-powered web application designed to help Nigerian secondary school students (JSS1 – SS3) understand difficult topics across all subjects. Students can type or speak any question and instantly receive a clear, simple explanation — like having a personal tutor available 24/7.

### Screenshots:

- [Desktop View](./public/explainit-ng.netlify.app_.png)
- [Mobile View](./public/explainit-ng.netlify.app_(iPhone%20SE).png)
---

## Problem Statement

Many secondary school students in Nigeria struggle to understand difficult topics because:

- Textbook explanations are too complex and technical
- Teachers are overloaded and unavailable for one-on-one help outside school hours
- Private tutoring is expensive and inaccessible for low-income families
- Students in rural areas have limited access to quality learning resources

---

## Solution

ExplainIt bridges this gap by providing:

- Instant AI-generated explanations in plain, simple language
- Interactive quizzes to reinforce understanding after every explanation
- Voice input for students who struggle with typing
- Text-to-speech so students can listen to explanations
- Visual illustrations to support different learning styles
- Offline access to previously saved explanations
- Zero cost — completely free for every student

---

## Features

| Feature | Description |
|---|---|
| 🤖 **AI Explanations** | Type or speak any topic and get a simple, clear explanation instantly |
| 🎯 **Multiple Choice Quiz** | 10 auto-generated questions after every explanation to test understanding |
| ✍️ **Descriptive Questions** | 3 Open-ended questions to encourage deeper thinking |
| 🎤 **Voice Input** | Speak your question instead of typing using Web Speech API |
| 🔊 **Text-to-Speech** | Listen to any explanation read aloud using built-in browser speech |
| 🖼️ **Visual Illustrations** | AI-generated images to support visual learners |
| 📶 **Offline Mode (PWA)** | Install the app and access saved explanations without internet |
| 📊 **Usage Analytics** | Live stats showing total questions asked and most popular topics |
| 🌙 **Dark Mode** | Comfortable reading experience for night-time studying |
| 📱 **Mobile Friendly** | Fully responsive design optimised for Android phones |

---

## Technologies Used

- **React** — Frontend framework
- **TypeScript** — Type-safe JavaScript
- **Vite** — Fast build tool
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — UI component library
- **Lovable Cloud** — Backend, database, and edge functions
- **Web Speech API** — Voice input and text-to-speech (no API key required)
- **Pollinations.ai** — Free AI image generation for visual illustrations
- **PWA / Service Worker** — Offline access and home screen installation

---

## Live Demo

🔗 **[View Live App](https://explainit-ng.netlify.app/)**

> To test the app:
> 1. Select your class level (JSS1 – SS3)
> 2. Choose a subject category
> 3. Type or speak your question
> 4. Get an instant explanation, quiz, and illustration

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/yourusername/explainit.git

# Step 2: Navigate into the project directory
cd explainit

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The app will run locally at `http://localhost:8080`

### Build for Production

```sh
npm run build
```

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your GitHub repo to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Click **Deploy site**

---

## Project Structure

```
explainit/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # App pages (Home, Saved, About)
│   ├── hooks/             # Custom React hooks
│   └── main.tsx           # App entry point
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icons/             # App icons
├── index.html
├── vite.config.ts
└── README.md
```

---

## 3MTT Programme

This project was built as part of the **3 Million Technical Talent (3MTT) Programme** by the **Federal Ministry of Communications, Innovation and Digital Economy**, under the **NextGen Cohort Knowledge Showcase — Special Edition.**

**Challenge Pillar:** Education

> The 3MTT programme is a key part of Nigeria's commitment to building digital talent and creating a foundation for technology-led growth.

---

## 👤 Author

**Sani Ismail**
3MTT NextGen Fellow | [Kano State]
- GitHub: [Profile](https://github.com/AbbanMuhammad)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for every Nigerian student | © 2026 ExplainIt
</p>
