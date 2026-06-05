# Frontend System Architecture

This document outlines the architectural decisions and component structure for the Twitter Clone UI.

## Design Philosophy
The primary goal of this architecture was to build lightweight, strictly-typed client that delegates heavy lifting to the backend API. By utilizing Vite and TypeScript, the development environment enforces strict type safety, catching data-shape errors before they hit the browser.

## 1. Authentication Flow & State Management
**The Challenge:** Securely authenticating users without managing sensitive passwords or session cookies locally.
**The Solution:** The frontend leverages Firebase Authentication as an Identity Provider (IdP).
* The `Login.tsx` component handles the initial handshake with Google's servers.
* A global `onAuthStateChanged` listener in `App.tsx` acts as the traffic controller, instantly updating the UI state when a user logs in or out.
* Upon a successful login/signup, the frontend extracts a secure JWT (JSON Web Token) from Firebase. This token is attached as an `Authorization: Bearer` header to all subsequent `fetch()` requests to the Python backend, ensuring secure, stateless API communication.

## 2. Component Structure
The UI is divided into modular, single-responsibility components:
* **`Dashboard.tsx`:** The master layout wrapper, utilizing CSS Flexbox to maintain the classic three-column social media structure.
* **`ComposeTweet.tsx`:** Manages local form state and character limits before dispatching the payload to the API.
* **`Feed.tsx`:** A data-fetching component that utilizes React's `useEffect` hook to pull the personalized timeline on component mount. It uses a TypeScript interface to strictly define the expected Postgres database tuple shapes returned by the backend.
* **`Profile.tsx`:** A dynamic routing component that securely fetches targeted user data. It features interactive UI states (editing bios, toggling follow/unfollow) that immediately sync with the backend via secure `PATCH`, `POST`, and `DELETE` requests.
* **`SearchUsers.tsx`:** Implements real-time Postgres `ILIKE` pattern matching to discover users by name or handle.

## 3. Deployment Pipeline
The application is deployed to Firebase Hosting. A continuous deployment (CI/CD) pipeline is managed via GitHub Actions. Upon a push to the `main` branch, the action builds the static assets and deploys them to the global Firebase CDN, ensuring rapid load times and zero-downtime updates.