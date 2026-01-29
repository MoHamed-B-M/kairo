# KAIRO

![KAIRO Banner](https://kairo-focus.com/og-image.jpg)

> **Minimalist Focus & Flow Timer**
>
> Seize the moment with a unique dial interface, AI-powered insights, and ambient soundscapes.

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

</div>

---

## ✨ Overview

**KAIRO** is a productivity application designed to induce flow state through calm technology. Moving away from standard digital inputs, KAIRO utilizes a **tactile dial interface** for selecting time, mimics mechanical haptics, and integrates **Generative AI** to provide zen-like focus tips and post-session insights.

It follows a **Material Minimalist** design philosophy—distraction-free, aesthetically pleasing, and functionally deep.

## 🚀 Features

| Component | Description |
| :--- | :--- |
| **🌀 Analog Dial** | A gesture-based time selector supporting inertia scrolling and touch swiping. |
| **🤖 AI Insights** | Powered by Google Gemini to generate dynamic focus tips and post-session philosophical summaries. |
| **🎧 Sonic Layer** | Built-in generative soundscapes (*Deep Space, Serene Flow*) utilizing the Web Audio API for seamless loops. |
| **✅ Task Flow** | Integrated floating task list with Focus/Break tagging to keep context without clutter. |
| **🌗 Adaptive UI** | Deep customization with Light/Dark modes and Material-inspired color palettes (Carbon, Oxygen, Midnight). |
| **📊 Analytics** | Local persistence of session logs to track your daily productivity journey. |

## 🛠️ Tech Stack

*   **Core:** React 19, TypeScript
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **Build & Deploy:** Vite, Netlify

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18+)
*   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/kairo.git
    cd kairo
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your API key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🎨 Design System

KAIRO relies on a semantic color variable system allowing for instant theming.

*   **Typography:** *Inter* (UI) & *Space Grotesk* (Display numbers).
*   **Motion:** Spring-like animations for the dial and fade transitions for views.
*   **Sound:** Custom oscillators for UI interactions (ticks, alarms) to avoid external asset dependencies.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License.

---

<div align="center">
  <sub>Designed & Built by Hama</sub>
</div>
