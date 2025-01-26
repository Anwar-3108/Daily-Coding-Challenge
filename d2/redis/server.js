const redis = require("redis");
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
let redisClient;

// Initialize Redis Client
(async () => {
  try {
    const redisHost = process.env.REDIS_HOST || "localhost"; // Use 'redis' as the hostname
    const redisPort = process.env.REDIS_PORT || 6379; // Standard Redis port

    // Create a Redis client instance
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
      password: process.env.REDIS_PASSWORD,
    });
    

    // Attach an error handler for Redis connection issues
    redisClient.on("error", (err) => {
      console.error(`Error connecting to Redis: ${err}`);
      process.exit(1);
    });

    // Connect to Redis
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
    const cacheKey = "calculate-data";

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit! Returning data from Redis.");
      return res.json({ result: JSON.parse(cachedData) });
    }

    console.log("Cache miss! Computing the data...");
    let calcData = 0;
    for (let i = 0; i < 1000000000; i++) {
      calcData += Math.random() * 1000000;
    }

    await redisClient.setEx(cacheKey, 60, JSON.stringify(calcData));
    return res.json({ result: calcData });
  } catch (error) {
    console.error(`Error in /calculate-data route: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-data", async (req, res) => {
  try {
    const cacheApiKey = "api-data";
    const cachedApiData = await redisClient.get(cacheApiKey);

    if (cachedApiData) {
      return res.json(JSON.parse(cachedApiData));
    }

    const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos");
    await redisClient.setEx(cacheApiKey, 60, JSON.stringify(data));
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4881;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}/`);
});
