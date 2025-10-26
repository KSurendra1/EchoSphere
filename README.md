# EchoSphere - Real-Time Social Networking Web App

EchoSphere is a dynamic, full-stack social media platform designed for real-time interaction. Built with a modern tech stack, it mimics the core functionalities of popular social networks like Instagram, providing a seamless, responsive, and engaging user experience. This project demonstrates advanced frontend development skills, state management, and integration with generative AI for content creation.

Live link : https://echosphere-pied.vercel.app/
## ✨ Key Features

- **Dynamic News Feed**: An infinitely scrolling main feed that displays posts from all users in real-time.
- **User Profiles**: View user profiles with a bio, stats (posts, followers, following), and an Instagram-style 3-column post grid.
- **Follow/Unfollow System**: A functional social graph allowing users to follow and unfollow each other, with counts updated in real-time.
- **Post Creation & Interaction**:
  - **Multi-modal Creation**: Create new posts by either uploading an image from your device or generating one on-the-fly using the Gemini AI.
  - **Likes & Comments**: Like and comment on posts, with all interactions reflected instantly.
  - **Edit Posts**: Users can edit the captions of their own posts.
- **Interactive Post Viewing**: Clicking a post in the profile grid opens a detailed modal view with the image, caption, and comments.
- **Direct Messaging**: A dedicated messages page with a conversation list and a chat window for one-on-one conversations.
  - **AI-Powered Replies**: The chat features an AI bot that generates contextual replies, simulating a real conversation.
- **Notifications**: A dedicated page to view notifications for likes, comments, and new followers.
- **Comprehensive Settings**:
  - **Profile Customization**: Edit your profile name, bio, and upload a new avatar.
  - **Privacy Controls**: Set your account to private and manage a list of blocked users.
  - **Theme Switcher**: Instantly switch between a sleek **Dark Mode** and a clean **Light Mode**.
- **Responsive Design**: The entire application is fully responsive, providing an optimal user experience on desktops, tablets, and mobile devices.

## 🚀 Tech Stack

- **Frontend**:
  - **React 19**: For building the user interface.
  - **TypeScript**: For static typing and improved code quality.
  - **Tailwind CSS**: For a utility-first approach to styling and theming.
- **AI & Services**:
  - **Google Gemini API**: Integrated for:
    - **AI Image Generation** (`imagen-4.0-generate-001`) for posts.
    - **AI Text Generation** (`gemini-2.5-flash`) for chat replies.
- **State Management**:
  - Utilizes React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) for efficient and localized state management without external libraries.
- **Backend Simulation**:
  - All data (users, posts, messages) is mocked locally in `src/data/mockData.ts` to simulate a full-stack experience without requiring a database setup.

## 📂 Project Structure

The project is organized with a clear and scalable component-based architecture.

```
/
├── public/
├── src/
│   ├── components/   # Reusable React components (Feed, Profile, Navbar, etc.)
│   ├── data/         # Mock data for users, posts, etc.
│   ├── services/     # API clients (e.g., geminiService.ts)
│   ├── types/        # TypeScript type definitions (types.ts)
│   ├── App.tsx       # Main application component, state management, and routing
│   ├── index.tsx     # Application entry point
│   └── ...
├── index.html        # Main HTML file
└── README.md
```

## ⚙️ Getting Started

To run this project locally, follow these steps:

### 1. Prerequisites

- Node.js and npm (or yarn) installed on your machine.
- A valid Google Gemini API key.

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/echosphere.git
cd echosphere
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

The application requires an API key for the Google Gemini API to function correctly.

1.  Create a new file named `.env` in the root of the project.
2.  Add your API key to this file as follows:

    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

    **Note**: The application is configured to load this variable, but in a real-world scenario with a build step (like Vite or Create React App), you would need to prefix it (e.g., `VITE_API_KEY`) and access it via `import.meta.env.VITE_API_KEY`. For this project's simple setup, it assumes `process.env.API_KEY` is accessible.

### 5. Run the Development Server

Start the application. This command will typically launch the app in your default browser.

```bash
# This project doesn't have a dev script, you'll need to serve index.html
# Using a simple static server is recommended.
# For example, using the 'serve' package:
npm install -g serve
serve .
```

You can now open your browser and navigate to the local server address (e.g., `http://localhost:3000`) to use EchoSphere.
