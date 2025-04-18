const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "tik",
    version: "1.1",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download random TikTok video by keyword"
    },
    longDescription: {
      en: "Search TikTok by keyword and download one random video"
    },
    category: "tools",
    guide: {
      en: "{p}tik [keyword]\nExample: {p}tik Car video"
    }
  },

  onStart: async function ({ api, event, args }) {
    const keyword = args.join(" ");
    if (!keyword) return api.sendMessage("অনুগ্রহ করে একটি কীওয়ার্ড দিন। যেমন: tik Naruto", event.threadID);

    const query = encodeURIComponent(keyword);
    const searchUrl = `https://www.tiktok.com/search?q=${query}`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };

    try {
      const res = await axios.get(searchUrl, { headers });
      const $ = cheerio.load(res.data);
      const urls = [];

      $('a[href*="/video/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href.includes("/video/") && !urls.includes(href)) {
          urls.push("https://www.tiktok.com" + href);
        }
      });

      if (!urls.length) return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID);

      const randomUrl = urls[Math.floor(Math.random() * urls.length)];

      // Snapsave Link Fetch
      const form = new URLSearchParams();
      form.append("url", randomUrl);
      const snapRes = await axios.post("https://snapsave.app/action.php?lang=en", form, {
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        }
      });

      const $$ = cheerio.load(snapRes.data);
      const videoUrl = $$('.download-links a').attr('href');

      if (!videoUrl) return api.sendMessage("ভিডিও ডাউনলোড করতে পারিনি।", event.threadID);

      const stream = (await axios.get(videoUrl, { responseType: "stream" })).data;

      return api.sendMessage(
        {
          body: `✅ টপিক: ${keyword}\n🔗 Source: ${randomUrl}`,
          attachment: stream
        },
        event.threadID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage("ভাই সমস্যা হয়েছে! আবার চেষ্টা করো।", event.threadID);
    }
  }
};
