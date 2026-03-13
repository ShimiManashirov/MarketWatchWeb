# MarketWatchWeb - Instructions & Documentation

Welcome to **MarketWatchWeb**, a premium real-time stock tracking and social platform. This guide provides instructions for setup, feature usage, and technical architecture.

## 🚀 Setup Instructions

### 1. Local Development
To run the application locally on your machine:

#### Prerequisites
- **Node.js**: v18+ recommended
- **MongoDB**: A local instance running at `mongodb://127.0.0.1:27017`
- **Environment Variables**: Create a `.env` file in the root directory (see [Configuration](#configuration)).

#### Backend Setup
```bash
# In the root directory
npm install
npm run dev
```

#### Frontend Setup
```bash
# In the client directory
cd client
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### 2. Docker Setup (Recommended)
For a consistent environment across all machines:
```bash
# In the root directory
docker-compose up --build
```
This will start both the Application and a local MongoDB instance in containers. The app will be accessible at `http://localhost:3000`.

---

## ⚙️ Configuration (.env)
The application requires several API keys to function correctly. Ensure these are set in your `.env` file:

- **Google OAuth**: Used for the "Continue with Google" feature.
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - **Note on Test Users**: Since the app is in "Testing" mode in the Google Console, only authorized accounts can log in. To allow your professor to log in:
    1. Go to **OAuth consent screen** in Google Console.
    2. Scroll to **Test users**.
    3. Click **+ ADD USERS** and add the professor's Gmail address.
- **AI Services**: Powered by LlamaIndex and OpenRouter.
  - `OPENROUTER_API_KEY`
- **Database**:
  - `MONGO_URI=mongodb://mongodb:27017/market_watch_db` (inside Docker)
  - `MONGO_URI=mongodb://127.0.0.1:27017/market_watch_db` (running locally)

---

## ✨ Key Features

### 📈 Real-Time Stock Tracking
- **Interactive Charts**: View historical price data for any ticker using the search bar on the Home page.
- **Smart Search**: The search dropdown includes exchange information (NYSE, NASDAQ) and instant "View" buttons.

### 🔔 Price Alerts
- **Custom Triggers**: Set alerts for when a stock price goes ABOVE or BELOW a target value.
- **Manual Verification**: Use the **"Refresh Status"** button on the Alerts page to instantly check if any alerts have triggered, without waiting for the 5-minute automated check.

### 🤖 AI-Powered Smart Search
- **Semantic Understanding**: Search for posts, users, or concepts using natural language.
- **LlamaIndex Integration**: Uses advanced RAG (Retrieval-Augmented Generation) to provide accurate search results.

### 👥 Social Platform
- **User Profiles**: Custom profiles showing user posts and activity.
- **Post Sharing**: Share insights and images with the community.
- **Security**: Smart visibility logic ensures you can only edit/create your own content.

---

## 🛠 Technical Architecture
- **Frontend**: React (Vite), BootStrap, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Authentication**: JWT-based with Refresh Token rotation and OAuth integration.
- **API Documentation**: Interactive Swagger UI available at `http://localhost:3000/api-docs`.

---

## 🧪 Testing & Verification
- **Unit Tests**: Run `npm test` in the backend to execute the Jest suite.
- **Swagger**: Use the `/api-docs` endpoint to test specific API calls manually.
