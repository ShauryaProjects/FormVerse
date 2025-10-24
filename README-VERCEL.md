# FormVerse Backend - Vercel Deployment

This is the backend API for FormVerse form builder, configured for Vercel serverless deployment.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy with GitHub

1. **Push your code to GitHub**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Node.js project

## 🔧 Environment Variables

Set these in your Vercel dashboard:

1. Go to your project settings
2. Go to "Environment Variables"
3. Add the following:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB connection string |

## 📁 Project Structure

```
├── api/
│   ├── forms/
│   │   ├── index.js              # GET/POST /api/forms
│   │   └── [id]/
│   │       ├── index.js          # GET/DELETE /api/forms/[id]
│   │       └── submissions/
│   │           └── index.js      # GET/POST /api/forms/[id]/submissions
│   └── health.js                 # GET /api/health
├── models/
│   ├── Form.js
│   └── Submission.js
├── vercel.json                   # Vercel configuration
└── package.json
```

## 🔗 API Endpoints

- `GET /api/health` - Health check
- `GET /api/forms` - Get all forms
- `POST /api/forms` - Create a new form
- `GET /api/forms/[id]` - Get form by ID
- `DELETE /api/forms/[id]` - Delete form by ID
- `GET /api/forms/[id]/submissions` - Get form submissions
- `POST /api/forms/[id]/submissions` - Submit form response

## 🧪 Testing Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Your API will be available at:
# http://localhost:3000/api/health
```

## 🔄 Frontend Configuration

Update your frontend `.env.local`:

```env
BACKEND_URL=https://your-vercel-app-name.vercel.app
```

## 📝 Notes

- This uses Vercel's serverless functions
- MongoDB connection is handled per-request
- CORS is configured for all origins
- No need for Express.js or traditional server setup

