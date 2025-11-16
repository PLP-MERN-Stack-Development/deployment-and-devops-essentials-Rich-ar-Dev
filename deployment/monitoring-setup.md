# Monitoring Setup Guide

## Application Health Monitoring

### 1. Health Check Endpoint
Our backend includes a health check endpoint:

```javascript
// Add to backend/server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'Connected'
  });
});