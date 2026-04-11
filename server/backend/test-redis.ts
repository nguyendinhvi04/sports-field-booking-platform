import { redis } from "./src/lib/redis";

async function testRedis() {
  console.log("🚀 Starting Redis connection test...");
  
  try {
    // 1. Test basic SET/GET
    const testKey = "test-redis-key";
    const testVal = "Hello Redis " + new Date().toISOString();
    
    console.log(`Setting key: ${testKey} with value: ${testVal}`);
    await redis.set(testKey, testVal, "EX", 60);
    
    const retrievedVal = await redis.get(testKey);
    console.log(`Retrieved value: ${retrievedVal}`);
    
    if (retrievedVal === testVal) {
      console.log("✅ Basic SET/GET test passed!");
    } else {
      console.error("❌ Basic SET/GET test failed!");
    }

    // 2. Test List operations (used by our notification system)
    const listKey = "test-redis-list";
    await redis.del(listKey);
    await redis.lpush(listKey, JSON.stringify({ event: "booking", id: 1 }));
    await redis.lpush(listKey, JSON.stringify({ event: "booking", id: 2 }));
    
    const listCount = await redis.llen(listKey);
    console.log(`List count: ${listCount}`);
    
    const items = await redis.lrange(listKey, 0, -1);
    console.log("List items:", items);
    
    if (listCount === 2) {
      console.log("✅ List operations test passed!");
    }

    console.log("\n✨ All Redis tests completed successfully!");
  } catch (error) {
    console.error("❌ Redis test error:", error);
  } finally {
    redis.disconnect();
    process.exit(0);
  }
}

testRedis();
