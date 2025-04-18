const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "tik",
    aliases: [],
    version: "1.1",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: "Tiktok video downloader",
    longDescription: "Search Tiktok videos by keyword and download using Tikmate",
    category: "fun",
    guide: {
      en: "#tik [search term]",
    },
  },

  onStart: async function ({ message, event, args }) {
    const keyword = args.join(" ");
    if (!keyword) return message.reply("অনুগ্রহ করে একটি কীওয়ার্ড লিখুন, যেমন: #tik car video");

    try {
      // Step 1: Get search results
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
      const { data: html } = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        },
      });

      const $ = cheerio.load(html);
      const scripts = $('script[id="SIGI_STATE"]').html();
      const jsonMatch = scripts?.match(/"ItemModule":({.*?}}),/);
      if (!jsonMatch) return message.reply("কোনো ভিডিও খুঁজে পাইনি!");

      const items = JSON.parse(`{"ItemModule":${jsonMatch[1]}}`).ItemModule;
      const allVideoIds = Object.keys(items);
      if (!allVideoIds.length) return message.reply("ভিডিও খুঁজে পাইনি!");

      // Step 2: Pick one random video
      const randomVideoId = allVideoIds[Math.floor(Math.random() * allVideoIds.length)];
      const video = items[randomVideoId];
      const videoUrl = `https://www.tiktok.com/@${video.author.uniqueId}/video/${video.id}`;

      // Step 3: Get download link from Tikmate
      const getToken = await axios.get(`https://tikmate.online/api/lookup?url=${encodeURIComponent(videoUrl)}`);
      if (!getToken?.data?.token || !getToken?.data?.id) {
        return message.reply("ভিডিও আনতে সমস্যা হচ্ছে! আবার চেষ্টা করো।");
      }

      const finalDownload = `https://tikmate.online/download/${getToken.data.token}/${getToken.data.id}.mp4`;

      message.reply({
        body: `✅ ভিডিও পাওয়া গেছে!\nTitle: ${video.desc}\n\nVideo:`,
        attachment: await global.utils.getStreamFromURL(finalDownload),
      });
    } catch (err) {
      console.error(err);
      message.reply("ভুল হয়েছে! আবার চেষ্টা করো।");
    }
  },
};
