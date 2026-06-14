import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let isRedisConnected = false;

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.warn('⚠️ Redis reconnection failed, using fallback mode');
        return new Error('Max reconnect retries exceeded');
      }
      return retries * 100;
    },
  },
});

redisClient.on('error', (err) => console.warn('⚠️ Redis error (non-critical):', err.message));
redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Redis connected');
});
redisClient.on('disconnect', () => {
  isRedisConnected = false;
  console.warn('⚠️ Redis disconnected');
});

export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      isRedisConnected = true;
    }
  } catch (error) {
    console.warn('⚠️ Redis connection failed, app will work without cache:', (error as Error).message);
    isRedisConnected = false;
  }
}

export async function setCache(key: string, value: any, ttl = 3600) {
  if (!isRedisConnected) return; // Graceful fallback
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn('⚠️ Cache set failed:', (error as Error).message);
  }
}

export async function getCache(key: string) {
  if (!isRedisConnected) return null; // Graceful fallback
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('⚠️ Cache get failed:', (error as Error).message);
    return null;
  }
}

export async function deleteCache(key: string) {
  if (!isRedisConnected) return; // Graceful fallback
  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn('⚠️ Cache delete failed:', (error as Error).message);
  }
}

export async function publishEvent(channel: string, message: any) {
  if (!isRedisConnected) return; // Graceful fallback
  try {
    await redisClient.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.warn('⚠️ Event publish failed:', (error as Error).message);
  }
}

export function createSubscriber() {
  if (!isRedisConnected) return null;
  return redisClient.duplicate();
}
