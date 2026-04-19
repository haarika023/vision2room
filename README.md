# 🏠 Vision2Room — MongoDB Edition

A 2D room layout designer with a **React frontend** and **Express + MongoDB backend**.

---

## Project Structure

```
vision2room-mongo/
├── backend/
│   ├── models/
│   │   └── Design.js       ← Mongoose schema
│   ├── routes/
│   │   └── designs.js      ← REST API routes
│   ├── server.js           ← Express entry point
│   ├── .env                ← MongoDB URI + port
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js          ← All React components
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Setup on Mac

### Step 1 — Install MongoDB locally

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB as a background service
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

### Step 2 — Start the backend

```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5002
```

### Step 3 — Start the frontend (new terminal tab)

```bash
cd frontend
npm install
npm start
# App opens at http://localhost:3000
```

---

## API Endpoints

| Method | URL                    | Description              |
|--------|------------------------|--------------------------|
| GET    | /api/designs           | Get all saved designs    |
| GET    | /api/designs/:id       | Get one design by ID     |
| POST   | /api/designs           | Create a new design      |
| PUT    | /api/designs/:id       | Update existing design   |
| DELETE | /api/designs/:id       | Delete a design          |
| GET    | /api/health            | Server health check      |

---

## How to Use

1. Set room dimensions (length × width in feet)
2. Name your design
3. Add furniture from the sidebar
4. Drag pieces to position them
5. Click **Save to MongoDB** — design is stored in the database
6. Saved designs appear in the right panel — click to reload any design
7. To update a loaded design, rearrange and click **Update in MongoDB**

---

## Stopping MongoDB

```bash
brew services stop mongodb-community
```
