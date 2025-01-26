const Redis = require("ioredis");

const redis = new Redis({
  host: "redis", // Docker service name
  port: 6379,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Error connecting to Redis:", err);
});

module.exports = redis;
