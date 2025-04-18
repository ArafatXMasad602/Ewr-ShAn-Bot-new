const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  config: {
    name: "tik",
    version: "1.0",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search TikTok videos"
    },
    longDescription: {
      en: "Search and download a random TikTok video based on a keyword"
    },
    category: "fun",
    guide: {
      en: "{pn} <search keyword>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("দয়া করে একটি কিওয়ার্ড লিখুন যেমন: #tik car video", event.threadID);

    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;

    try {
      const { data } = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      const videoIds = [];
      const regex = /"video\/(\d+)"/g;
      let match;

      while ((match = regex.exec(data)) !== null) {
        videoIds.push(match[1]);
      }

      if (videoIds.length === 0) return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID);

      const randomId = videoIds[Math.floor(Math.random() * videoIds.length)];
      const tiktokUrl = `https://www.tiktok.com/@username/video/${randomId}`;

      const response = await axios.get(`https://tikmate.online/api/lookup?url=${tiktokUrl}`);
      const { token, id } = response.data;
      const downloadLink = `https://tikmate.online/download/${token}/${id}.mp4`;

      api.sendMessage({
        body: `তোমার ভিডিও চলে এসেছে!\nKeyword: ${query}`,
        attachment: await global.utils.getStreamFromURL(downloadLink)
      }, event.threadID);
      
    } catch (err) {
      console.error(err);
      api.sendMessage("ভিডিও আনতে সমস্যা হচ্ছে! আবার চেষ্টা করো।", event.threadID);
    }
  }
};
