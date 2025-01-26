// src/app.js
const express = require('express');
const redis = require('ioredis');
const app = express();

// Redis client
const redisClient = new redis({
  host: 'localhost', // Can be updated later for Docker/Production setup
  port: 6379,        // Default Redis port
});

app.get('/', async (req, res) => {
  try {
    // Set a value in Redis
    await redisClient.set('visits', 1);

    // Get the value from Redis
    const visits = await redisClient.get('visits');
    res.send(`Number of visits: ${visits}`);
  } catch (error) {
    console.error('Error with Redis:', error);
    res.status(500).send('Error connecting to Redis');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
