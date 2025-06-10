# PhotoShare

A full-stack photo sharing platform with user authentication, photo uploads, ratings, and comments. Built with **Express.js**, **MongoDB**, and a modern **React + Vite + TypeScript** frontend.

---

## Features

- User registration, login, and role management (consumer/creator)
- Secure authentication with JWT and cookies
- Photo upload, update, and deletion (creators)
- Photo rating and commenting (consumers)
- Public/private photo visibility
- Rate limiting, security headers, and CORS
- Responsive, modern frontend with React, Chakra UI, and Tailwind CSS

---

## Project Structure

```
photoshare/
│
├── index.js                # Express backend entry
├── src/                    # Backend source code
│   ├── config/             # DB and app config
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Mongoose models
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic/services
│   └── utils/              # Utility functions
│
├── frontend/               # React frontend
│   ├── src/                # Frontend source code
│   └── ...                 # Vite, config, etc.
│
└── uploads/                # Uploaded images (served statically)
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)

### Backend Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment variables:**

   Create a `.env` file in the root with:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/photoshare
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. **Run the backend:**
   ```bash
   npm run dev
   ```
   The server will start on the port specified in `.env` (default: 5000).

### Frontend Setup

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the frontend:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

---

## API Overview

### Auth Routes (`/api/auth`)

- `POST /register` — Register a new user
- `POST /login` — Login and receive JWT cookie
- `POST /logout` — Logout user
- `GET /me` — Get current user info (auth required)
- `POST /upgrade-to-creator` — Become a creator (auth required)
- `POST /toggle-view` — Switch between consumer/creator view (auth required)

### Photo Routes (`/api/photos`)

- `GET /` — List photos (auth required)
- `GET /:id` — Get photo by ID (auth required)
- `POST /` — Upload photo (creator only)
- `PATCH /:id` — Update photo (creator only)
- `DELETE /:id` — Delete photo (creator only)
- `POST /:id/rate` — Rate a photo (auth required)
- `POST /:id/comments` — Add comment (auth required)
- `DELETE /:id/comments/:commentId` — Delete comment (auth required)

### Health Check

- `GET /api/health` — Returns status and environment

---

## Data Models

### User

- `email`, `password`, `name`, `role` (`consumer`/`creator`), `currentView`, `photoCount`, `maxPhotos`, `joinedAt`, etc.

### Photo

- `title`, `caption`, `imageUrl`, `thumbnailUrl`, `location`, `tags`, `isPublic`, `createdBy`, `ratings`, `averageRating`, `comments`, etc.

### Comment

- `photo`, `author`, `text`, `likes`, `createdAt`

---

## Security & Best Practices

- Uses Helmet for HTTP headers
- Rate limiting to prevent abuse
- CORS configured for frontend URL
- Passwords hashed with bcrypt
- JWT-based authentication (HTTP-only cookies)
- Input validation with Zod

---

## License

[ISC](LICENSE) — Customize as needed.

---

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Chakra UI](https://chakra-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Let me know if you want to add usage examples, deployment instructions, or anything else!
