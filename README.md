# Twitter Clone UI 🎨

A modern, responsive single-page application (SPA) built to serve as the user interface for the Twitter Clone ecosystemn. This frontend securely communicates with the [Twitter Clone API](https://github.com/Isaac3924/twitter_clone) to deliver a real-time, personalized social media feed.

## 🛠 Tech Stack
* **Framework:** React 18
* **Build Tool:** Vite
* **Language:** TypeScript
* **Authentication:** Google Firebase Auth
* **Deployment:** Firebase Hosting (via GitHub Actions)

## 🚀 Local Development Setup

To run this frontend locally, you will need Node.js (v20 or v22) installed.

### 1. Clone the repository
```bash
git clone https://github.com/Isaac3924/twitter-clone-ui.git
cd twitter-clone-ui
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
To connect the Firebase authentication servers, create a `.env.local` file in the root directory and add your Firebase Web API key:
```env
VITE_FIREBASE_API_KEY="your_api_key_here"
```
*(Note: Do not commit this file to version control. It is ignored by default in Vite).*

### 4. Run the development server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

*Important:* For full functionality (posting tweets, loading feeds), ensure the backend FastAPI server is concurrently running on `http://127.0.0.1:8000`.