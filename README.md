# CodeAlpha_AskAI

**AskAI** is a scalable, modern chatbot platform that leverages a dynamic architecture to provide intelligent, contextual conversations. The application seamlessly bridges a sleek, high-performance user interface with a robust, AI-orchestrating backend.

## 🚀 Technology Stack

### Frontend (User Interface)
*   **Framework:** Next.js 16 (App Router) with React 19
*   **Styling:** Tailwind CSS with dynamic spotlight/glassmorphic UI components
*   **3D Graphics:** Spline 3D Integration for interactive visual elements
*   **Testing:** Vitest & Testing Library

### Backend (API & AI Orchestration)
*   **Framework:** FastAPI (Python 3.12)
*   **AI Routing:** OpenRouter API (Fallback cascade: Llama 3.3 70B -> Gemma 2 9B -> Llama 3.1 8B)
*   **Database & Auth:** Supabase (PostgreSQL & JWT Authentication)
*   **Testing:** Pytest with async support

---

## 🛠️ Local Development Setup

To run this application locally, you will need to set up both the backend API and the frontend web server.

### 1. Database Setup
Make sure you have a Supabase project created. You will need your `SUPABASE_URL` and `SUPABASE_KEY` for the environment files.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file (you can copy `.env.example` if available) and add your API keys:
   ```env
   OPENROUTER_API_KEY="your_key"
   SUPABASE_URL="your_url"
   SUPABASE_KEY="your_key"
   ```
5. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file (you can copy `.env.example`) and add your public keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### 4. Usage
Once both servers are running, open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to interact with AskAI!
