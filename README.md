# FormVerse - Form Builder Application

A full-stack form builder application with drag-and-drop functionality and real-time preview.

## Project Structure

```
formify/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── package.json  # Frontend dependencies
├── models/           # MongoDB models
├── routes/           # Express.js routes
├── server.js         # Express.js server entry point
└── package.json      # Backend dependencies
```

## Backend (Root Level)

The backend is now at the root level for easier deployment on Render.

### Setup
```bash
npm install
npm start
```

### Environment Variables
Create a `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Frontend

### Setup
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend (Render)
- Root Directory: Leave empty (backend is at root)
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Start Command: `npm start`

## Features

- Drag & drop form builder
- Multi-step forms
- Real-time preview
- Form sharing via links
- Admin dashboard
- Form submissions tracking