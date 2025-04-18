const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "tik",
    version: "1.0.0",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: "টিকটক থেকে ভিডিও আনো",
    longDescription: "আপনার দেওয়া বিষয়ে TikTok এ সার্চ দিয়ে র‍্যান্ডম ভিডিও এনে দিবে",
    category: "media",
    guide: "{pn} <search>\nউদাহরণ: {pn} Naruto"
  },

  onStart: async function ({ api, event, args }) {
    const searchQuery = args.join(" ");
    if (!searchQuery) return api.sendMessage("দয়া করে একটি সার্চ টার্ম দাও, যেমন: #tik Naruto", event.threadID);

    const loading = await api.sendMessage(`🔍 "${searchQuery}" নিয়ে TikTok-এ ভিডিও খুঁজছি...`, event.threadID);

    try {
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(searchQuery)}`;
      const { data } = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const $ = cheerio.load(data);
      const videoLinks = [];

      $("a[href*='/video/']").each((i, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/video/") && !videoLinks.includes(href)) {
          videoLinks.push("https://www.tiktok.com" + href);
        }
      });

      if (videoLinks.length === 0) {
        return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID, event.messageID);
      }

      const randomLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];

      const ssstikPage = await axios.post("https://ssstik.io/abc", new URLSearchParams({
        id: randomLink,
        locale: "en"
      }), {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "Mozilla/5.0"
        }
      });

      const $$ = cheerio.load(ssstikPage.data);
      const videoDownload = $$('a.without_watermark').attr('href');

      if (!videoDownload) {
        return api.sendMessage("ভিডিও ডাউনলোড করতে পারিনি। আবার চেষ্টা করো।", event.threadID, event.messageID);
      }

      const videoStream = await axios.get(videoDownload, { responseType: "stream" });

      return api.sendMessage({
        body: `✅ ${searchQuery} টপিকের TikTok ভিডিও:`,
        attachment: videoStream.data
      }, event.threadID, () => api.unsendMessage(loading.messageID));

    } catch (e) {
      console.log(e);
      return api.sendMessage("⚠️ কোনো সমস্যা হয়েছে! আবার চেষ্টা করো।", event.threadID);
    }
  }
};
