// Import required modules
const redis = require("redis"); // Redis client for interacting with the Redis database
const express = require("express");
const axios  = require("axios");

const app = express();
let redisClient; // Declare Redis client variable

// Initialize Redis Client [IIFE]
(async () => {
  try {
    // Create a Redis client instance
    redisClient = redis.createClient(); // by default redis uses defult port:6379 and host:127.0.0.1 , in the docker container ports are mapped [6379:6379] , [8001: 8001]

    // Attach an error handler for Redis connection issues
    redisClient.on("error", (err) => {
      console.error(`Error connecting to Redis: ${err}`);
      process.exit(1);
    });

    // Connect to the Redis server
    await redisClient.connect();
    console.log("Connected to Redis successfully!");
  } catch (err) {
    console.error(`Failed to initialize Redis: ${err.message}`);
    process.exit(1);
  }
})();

// Middleware to parse JSON requests
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! Redis and Express are working together.");
});

// A route to calculate and cache computationally expensive data
app.get("/calculate-data", async (req, res) => {
  try {
    const cacheKey = "calculate-data"; // Key used to store/retrieve data in Redis

    // Check if data exists in Redis cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // If data is found in cache, return it immediately
      console.log("Cache hit! Returning data from Redis.");
      return res.json({ result: JSON.parse(cachedData) });
    }

    console.log("Cache miss! Computing the data...");
    // Simulate a computationally expensive task
    let calcData = 0;
    for (let i = 0; i < 1000000000; i++) {
      calcData += Math.random() * 1000000;
    }

    // Save the result in Redis with a 60-second expiration time
    await redisClient.setEx(cacheKey, 60, JSON.stringify(calcData));

    // Return the newly computed result
    return res.json({ result: calcData });
  } catch (error) {
    console.error(`Error in /calculate-data route: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-data", async (req, res) => {
  try {
    let cacheApiKey = "api-data";
    let cachedApiData = await redisClient.get(cacheApiKey);
    if (cachedApiData) {
      return res.json(JSON.parse(cachedApiData));
    }

    let data = await axios.get("https://jsonplaceholder.typicode.com/todos");
    await redisClient.setEx(
      cacheApiKey,
      60,
      JSON.stringify(data.data)
    );
    return res.json(data.data);
  } catch (error) {
    return res.json({ error: error });
  }
});

// Start the Express server
const PORT = 4881;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}/`);
});
