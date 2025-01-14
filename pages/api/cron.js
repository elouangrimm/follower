const { BskyAgent } = require('@atproto/api');
const axios = require('axios');

const BLUESKY_HANDLE = process.env.BLUESKY_HANDLE;
const BLUESKY_PASSWORD = process.env.BLUESKY_PASSWORD;

const agent = new BskyAgent({ service: 'https://bsky.social' });

async function login() {
  await agent.login({ identifier: BLUESKY_HANDLE, password: BLUESKY_PASSWORD });
  console.log('Logged in as:', BLUESKY_HANDLE);
}

async function getRandomUsers(count = 5) {
  const response = await axios.get('https://search.bsky.social/api/search?q=a');
  return response.data.slice(0, count).map((user) => user.did);
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
      console.error(`Error following ${did}: ${err.message}`);
    }
  }
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    await login();
    await followUsers();
    res.status(200).send('Bot executed successfully');
  } catch (err) {
    console.error('Error in bot execution:', err.message);
    res.status(500).send('Bot execution failed');
  }
}
