import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis error:', err));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
}

export async function setCache(key: string, value: any, ttl = 3600) {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
}

export async function getCache(key: string) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

export async function deleteCache(key: string) {
  await redisClient.del(key);
}

export async function publishEvent(channel: string, message: any) {
  await redisClient.publish(channel, JSON.stringify(message));
}

export function createSubscriber() {
  return redisClient.duplicate();
}
