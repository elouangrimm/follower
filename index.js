const { BskyAgent } = require('@atproto/api');
const axios = require('axios');

const BLUESKY_HANDLE = process.env.BLUESKY_HANDLE;
const BLUESKY_PASSWORD = process.env.BLUESKY_PASSWORD;

const agent = new BskyAgent({ service: 'https://bsky.social' });

async function login() {
  try {
    await agent.login({ identifier: BLUESKY_HANDLE, password: BLUESKY_PASSWORD });
    console.log('Logged in as:', BLUESKY_HANDLE);
  } catch (err) {
    console.error('Error logging in:', err.message);
  }
}

async function getRandomUsers(count = 5) {
  try {
    const response = await axios.get('https://search.bsky.social/api/search?q=a');
    const users = response.data;
    return users.slice(0, count).map((user) => user.did);
  } catch (err) {
    console.error('Error fetching random users:', err.message);
    return [];
  }
}

async function followUsers() {
  const users = await getRandomUsers(5);
  for (const did of users) {
    try {
      await agent.app.bsky.graph.follow.create(
        { repo: agent.session?.did },
        { subject: did, createdAt: new Date().toISOString() }
      );
      console.log(`Followed user: ${did}`);
    } catch (err) {
      console.error(`Error following ${did}:`, err.message);
    }
  }
}

async function main() {
  await login();
  console.log('Bot is running...');
  setInterval(followUsers, 12 * 60 * 1000);

main();