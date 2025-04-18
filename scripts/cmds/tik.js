const axios = require('axios');
const fs = require('fs');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "tik",
    aliases: [],
    author: "𝗔𝗿𝗮𝗳𝗮𝘁 𝗗𝗮",
    version: "1.0",
    shortDescription: {
      en: "Search and send TikTok videos",
    },
    longDescription: {
      en: "Search TikTok videos based on keywords",
    },
    category: "MEDIA",
    guide: {
      en: "{p}tik [keyword]",
    },
  },
  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("🎥", event.messageID, (err) => {}, true);
    
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("দয়া করে একটি কিওয়ার্ড দিন যেমন: #tik Naruto", event.threadID, event.messageID);
    }

    const videos = await fetchTikTokVideos(query);
    if (!videos || videos.length === 0) {
      return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID, event.messageID);
    }

    const selected = videos[Math.floor(Math.random() * videos.length)];
    const url = selected.videoUrl;

    if (!url) {
      return api.sendMessage("ভিডিও লিংক খুঁজে পাওয়া যায়নি!", event.threadID, event.messageID);
    }

    try {
      const stream = await getStreamFromURL(url);
      api.sendMessage({
        body: `Here's a video for "${query}":`,
        attachment: stream
      }, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("ভিডিও পাঠাতে সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
  }
};
