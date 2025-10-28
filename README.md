# 💛 Match-Me: Find the Perfect Playmate

**Match-Me** a new demo app designed for parents who want to find great play partners for their kids.

As parents, we all know how hard it can be to meet other families whose children share similar energy, interests, and schedules. **Match-Me**  helps make that easier — by connecting nearby parents based on children’s personalities, play styles, and activity levels, using a bit of smart matching magic under the hood.

Whether you’re new in town or just looking to make new friends for your child, this app helps parents discover like-minded families and chat in real time.  

> 🧸 In this demo, each parent can currently add **one child** profile to try out the experience.

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v18` or later
- **Go**: `v1.24` or later
- **PostgreSQL**

### Installation & Setup

#### 1. **Clone the Repository**

    ```bash
    git clone https://gitea.kood.tech/irinapanivenko/match-me.git
    cd match-me
    ```

#### 2.  **Set Up the Database**
    This project uses PostgreSQL with the PostGIS extension for location services.

    ```bash
    # On macOS (using Homebrew)
    brew install postgresql postgis

    # On Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install postgresql postgresql-contrib postgis

    # Create the database and enable the extension
    createdb matchme
    ```

#### 3.  **Configure Environment Variables**
    Create a `.env` file inside the `server/` directory and populate it with your configuration.

    ```bash
    # server/.env
    # Server port
    PORT=8088

    # PostgreSQL connection string
    # Replace username, password, dbname with your own
    DATABASE_URL=postgres://YOUR_USER:YOUR_PASSWORD@localhost:5432/matchme?

    # Secret for signing JWT tokens (choose something random & long)
    JWT_SECRET=supersecretkey123

    # Allowed CORS origin (your React app)
    CORS_ORIGIN=http://localhost:5173

    #These are the Cloudinary variables (used for uploading photos).
    #We will share them with you so that you don't need to create your own Cloudinary account.
    CLOUDINARY_CLOUD_NAME=dbzbuiqry
    CLOUDINARY_API_KEY=762496835818247
    CLOUDINARY_API_SECRET=SygX6KKuhuXoqy8sxP70PhCCCyg
    ```

    Create a `.env` file inside the `frontend/` directory and add:

    ```bash
    VITE_API_BASE_URL=http://localhost:8088

    #You need to obtain an API key from https://www.geoapify.com/ (we share ours).
    VITE_GEOAPIFY_KEY=0961ffde35ea4983ace9f087df1df71b
    ```
    > Remember that the port set in both the client and server must match, for example if you change the `PORT` in `server/.env` to 3000 then the client should be http://localhost:3000

#### 4.  **Install Dependencies and Run**

    Run the frontend and backend servers in **two separate terminal windows**:

    ```bash
    # In terminal 1: Start the client dev server
    cd frontend
    make run dev
    # Frontend will be available at http://localhost:5173
    ```

    ```bash
    # In terminal 2: Start the backend server
    go run .
    # Backend will be running at http://localhost:8088
    ```

#### 5.  if you do not have make installed

    ```bash
    # In terminal 1: Install the client and start the frontend dev server
    cd frontend
    npm i && npm run dev
    # Frontend will be available at http://localhost:5173
    ```
### Database Management

    The backend includes helpful commands for managing the database during development or testing.

    ```bash
    # Navigate to the server directory
    cd server

    # Seed the database with 100 test users
    go run . -seed

    # Completely reset the database (drop all data)
    go run . -drop
    ```

## ✨ Features

  * **✅ Secure User Authentication**: JWT-based authentication for secure sessions and profile management.
  * **📍 Geospatial Matching**: Utilizes PostGIS to discover and connect with potential matches nearby.
  * **💬 Real-Time Chat**: Instant messaging between connected users, powered by WebSockets for a fluid conversation experience.
  * **📸 Cloud-Based Image Handling**: Efficient and secure photo uploads and storage managed via Cloudinary.
  * **🤝 Connection Management**: A complete system to send, accept, and manage connection requests.
  * **📱 Fully Responsive Design**: A beautiful and intuitive interface that works flawlessly on both desktop and mobile devices.

-----

## 🛠️ Tech Stack

The project is built with a modern and robust technology stack, separating concerns between a client-side application and a server-side API.

| **Component** | **Technology** | **Purpose** |
| :--- | :--- | :--- |
| **Frontend** | React 19 (TypeScript) | UI development |
| | Vite | Build tooling & dev server |
| | Zustand & React Query | State management & server-state synchronization |
| | Bulma | Styling and responsive layout |
| | WebSocket API | Real-time communication |
| **Backend** | Go 1.24+ | Core application logic |
| | Gin | High-performance HTTP web framework |
| **Database** | PostgreSQL + PostGIS | Relational data and geospatial queries |
| **Infrastructure** | JWT | Authentication |
| | Cloudinary | Cloud-based image storage |


-----

## 📁 Project Structure

The repository is organized into two main parts: a `frontend` directory for the frontend and a `server` directory for the backend.

```bash
match-me
├── server
│   ├── database       # Database connection & initialization
│   ├── endpoints      # API route definitions
│   ├── handlers       # Request handlers & logic
│   ├── helpers        # Utility functions (tokens, validation, etc.)
│   ├── internal       # Internal reusable logic
│   ├── middleware     # Auth, CORS, and logging middleware
│   ├── services       # Core services (matching, Cloudinary, etc.)
│   ├── sqlfiles       # SQL schema & seed scripts
│   ├── structs        # Data models and DTOs
│   └── websocket      # Real-time chat & notifications
│
└── frontend
    ├── node_modules   # Dependencies
    ├── public         # Static assets (index.html, icons)
    └── src
        ├── api        # API calls & request helpers
        ├── assets     # Images and media
        ├── auth       # JWT logic & route protection
        ├── components # Reusable UI components
        ├── hooks      # Custom React hooks
        ├── pages      # Main application views
        ├── styles     # Bulma & custom CSS
        └── types      # TypeScript interfaces & types
```
