# Redis Setup for Formify

This document explains how to set up Redis caching for the Formify project.

## Redis URL Configuration

Your Redis URL has been configured as:
```
REDIS_URL="redis://default:2k78GIgv5bkBvBbfDX5emMccqfD6roab@redis-16952.c241.us-east-1-4.ec2.redns.redis-cloud.com:16952"
```

## Vercel Environment Variables

To deploy to Vercel, you need to add the Redis URL as an environment variable:

1. Go to your Vercel dashboard
2. Select your Formify project
3. Go to Settings > Environment Variables
4. Add a new variable:
   - **Name**: `REDIS_URL`
   - **Value**: `redis://default:2k78GIgv5bkBvBbfDX5emMccqfD6roab@redis-16952.c241.us-east-1-4.ec2.redns.redis-cloud.com:16952`
   - **Environment**: Production, Preview, Development

## Local Development

For local development, you can either:

1. **Use the same Redis instance** (recommended for testing):
   ```bash
   export REDIS_URL="redis://default:2k78GIgv5bkBvBbfDX5emMccqfD6roab@redis-16952.c241.us-east-1-4.ec2.redns.redis-cloud.com:16952"
   ```

2. **Install Redis locally**:
   ```bash
   # Windows (using Chocolatey)
   choco install redis-64
   
   # macOS (using Homebrew)
   brew install redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   ```
   
   Then use: `REDIS_URL=redis://localhost:6379`

## Features Implemented

### 1. Redis Connection Management
- Automatic connection with retry logic
- Connection pooling for serverless environments
- Error handling and logging

### 2. Caching Strategy
- **Forms List**: Cached for 5 minutes (`forms:all`)
- **Individual Forms**: Cached for 10 minutes (`form:{id}`)
- **Form Submissions**: Cached for 2 minutes (`submissions:{formId}`)

### 3. Cache Invalidation
- Forms list cache is invalidated when new forms are created
- Individual form cache is invalidated when forms are deleted
- Submissions cache is invalidated when new submissions are added

### 4. Health Check
- `/api/health` endpoint now includes Redis connection status

## API Endpoints with Caching

- `GET /api/forms` - Cached forms list
- `GET /api/forms/[id]` - Cached individual form
- `GET /api/forms/[id]/submissions` - Cached form submissions
- `POST /api/forms` - Creates form and invalidates cache
- `DELETE /api/forms/[id]` - Deletes form and invalidates cache
- `POST /api/forms/[id]/submissions` - Creates submission and invalidates cache

## Performance Benefits

1. **Faster Response Times**: Frequently accessed data is served from Redis
2. **Reduced Database Load**: Less frequent MongoDB queries
3. **Better User Experience**: Faster form loading and submission
4. **Cost Optimization**: Reduced database operations on Vercel

## Monitoring

You can monitor Redis performance through:
- Vercel function logs
- Redis Cloud dashboard
- Health check endpoint: `GET /api/health`

## Troubleshooting

If Redis connection fails:
1. Check the Redis URL is correct
2. Verify Redis Cloud instance is running
3. Check Vercel environment variables
4. Review function logs in Vercel dashboard

The application will continue to work without Redis, but without caching benefits.
