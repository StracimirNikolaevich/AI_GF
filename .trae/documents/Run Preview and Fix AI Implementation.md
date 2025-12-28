# Plan to Run Preview, Fix Bugs, and Enable AI

## 1. Analysis and Preparation
I have analyzed the codebase and identified the following:
- **Project Type**: Python FastAPI backend with a Vue.js frontend (served as static files).
- **Current State**: 
    - The backend `server.py` expects a frontend build in `../frontend/dist` which appears to be missing or misconfigured, as the static files are actually in `backend/static`.
    - The AI configuration (`settings_template.json`) is empty, meaning the "AI" will not work out of the box (it will return a "NoModelProvidersConfigured" error).
    - The system relies on external LLM providers (OpenAI, Ollama, etc.) or local models which are not yet configured.

## 2. Bug Fixes
I will perform the following fixes to ensure the application runs and satisfies the "actual AI" request within the constraints:
1.  **Fix Static File Serving**: Modify `backend/server.py` to serve the frontend from the correct `static` directory instead of `../frontend/dist`.
2.  **Fix "No AI" Error**: Modify `backend/server.py` to include a **fallback "Echo/Mock" AI** mode.
    - If no model provider is configured, instead of crashing or returning a 500 error, the system will gracefully degrade to a mock mode that echoes user input or provides a friendly setup guide.
    - This allows you to preview the chat interface and interaction flow immediately.
3.  **Dependency Handling**: I will assume necessary Python packages are installed. If not, I will report missing dependencies.

## 3. "Actual AI" Implementation
To fulfill the request for "actual AI" without requiring you to input API keys immediately:
1.  **Ollama Integration Check**: I will check if `ollama` is available in the environment.
    - If available, I will attempt to auto-configure the system to use a local Ollama model (if present).
2.  **Mock/Echo Fallback**: If no local AI is found, the fallback mode will serve as a functional placeholder, allowing you to interact with the UI. I will add a system message guiding you on how to connect a real API key (OpenAI, DeepSeek, etc.) or local model via the settings interface.

## 4. Execution Steps
1.  **Modify `backend/server.py`**: Apply the fixes for static files and the AI fallback logic.
2.  **Start Server**: Run the backend server (`python server.py`) from the `backend` directory.
3.  **Preview**: Provide you with the URL (`http://127.0.0.1:3456`) to open the application.
