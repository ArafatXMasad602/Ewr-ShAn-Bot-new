const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "tik",
    aliases: ["tiktok", "tiktokdl"],
    version: "1.0",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: "টিকটক ভিডিও ডাউনলোড",
    longDescription: "যে বিষয়ের ভিডিও চাও সেই অনুযায়ী TikTok থেকে ভিডিও এনে দিবে",
    category: "media",
    guide: "{pn} <search term>"
  },

  onStart: async function ({ message, args }) {
    const searchTerm = args.join(" ");
    if (!searchTerm) return message.reply("দয়া করে একটা বিষয় লিখো, যেমনঃ `car video`");

    message.reply("ভিডিও খোঁজা হচ্ছে...");

    try {
      // Step 1: Scrape TikTok search results (lite method)
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(searchTerm)}`;
      const { data } = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const $ = cheerio.load(data);
      const videoLinks = [];

      $("a").each((i, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/video/") && !videoLinks.includes(href)) {
          videoLinks.push(href);
        }
      });

      if (videoLinks.length === 0) {
        return message.reply("কোনো ভিডিও খুঁজে পাইনি! অন্য কিছু দিয়ে চেষ্টা করো।");
      }

      // Step 2: Pick random video
      const randomLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];
      const fullLink = randomLink.startsWith("http") ? randomLink : `https://www.tiktok.com${randomLink}`;

      // Step 3: Get download link from Tikmate
      const lookup = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(fullLink)}`);
      const { token, id } = lookup.data;
      if (!token || !id) throw new Error("ডাউনলোড লিংক তৈরি করা যায়নি!");

      const downloadUrl = `https://tikmate.app/download/${token}/${id}.mp4`;

      // Step 4: Send the video
      message.reply({
        body: `তোমার ভিডিও এখানে!`,
        attachment: await global.utils.getStreamFromURL(downloadUrl)
      });

    } catch (err) {
      console.error(err);
      message.reply("ভিডিও আনতে সমস্যা হয়েছে! আবার চেষ্টা করো।");
    }
  }
};
