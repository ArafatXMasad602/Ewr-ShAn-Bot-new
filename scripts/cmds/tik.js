const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "tik",
    version: "1.0",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search and download TikTok video"
    },
    longDescription: {
      en: "Searches TikTok using a query and returns a random video from the results"
    },
    category: "media",
    guide: {
      en: "#tik <search keyword>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const keyword = args.join(" ");
    if (!keyword) return api.sendMessage("দয়া করে একটি টপিক লিখো যেমন: #tik Car video", event.threadID);

    try {
      const searchRes = await axios.get(`https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const $ = cheerio.load(searchRes.data);
      const videoLinks = [];

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/video/") && !videoLinks.includes(href)) {
          videoLinks.push("https://www.tiktok.com" + href);
        }
      });

      if (videoLinks.length === 0) return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID);

      const randomUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];

      const snapRes = await axios.post("https://snapsave.app/action.php?lang=en", new URLSearchParams({
        url: randomUrl,
        token: ""
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      });

      const $$ = cheerio.load(snapRes.data);
      const videoUrl = $$("a.download-link").attr("href");

      if (!videoUrl) {
        return api.sendMessage(`ভিডিও লিংক খুঁজে পাইনি!\nSource: ${randomUrl}`, event.threadID);
      }

      const stream = await axios.get(videoUrl, { responseType: "stream" }).then(res => res.data).catch(() => null);

      if (!stream) {
        return api.sendMessage("ভিডিও ডাউনলোড করতে ব্যর্থ হলাম।", event.threadID);
      }

      return api.sendMessage({
        body: `✅ টপিক: ${keyword}\n🔗 Source: ${randomUrl}`,
        attachment: stream
      }, event.threadID);

    } catch (err) {
      console.log(err);
      return api.sendMessage("ভিডিও আনতে সমস্যা হচ্ছে! আবার চেষ্টা করো।", event.threadID);
    }
  }
};
