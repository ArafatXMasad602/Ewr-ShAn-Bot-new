const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "tik",
    version: "1.0",
    author: "Arafat Da",
    countDown: 5,
    role: 0,
    shortDescription: "টিকটক ভিডিও আনো",
    longDescription: "টিকটক সার্চ দিয়ে ভিডিও ডাউনলোড করো",
    category: "media",
    guide: "{pn} [সার্চ টার্ম]"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("কী সার্চ করবো তা লিখো!", event.threadID, event.messageID);

    try {
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
        }
      });

      const $ = cheerio.load(response.data);
      const videoUrls = [];

      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/video/") && !href.includes("live")) {
          if (!videoUrls.includes(href)) videoUrls.push("https://www.tiktok.com" + href);
        }
      });

      if (videoUrls.length === 0)
        return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID, event.messageID);

      const randomUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

      const ssstik = await axios.get(`https://ssstik.io/en?url=${randomUrl}`);
      const $$ = cheerio.load(ssstik.data);
      const downloadUrl = $$("#download > a").attr("href");

      if (!downloadUrl)
        return api.sendMessage("ভিডিও ডাউনলোড লিংক পাইনি!", event.threadID, event.messageID);

      const videoRes = await axios.get(downloadUrl, { responseType: "arraybuffer" });

      if (!videoRes.data)
        return api.sendMessage("ভিডিও আনতে সমস্যা হচ্ছে!", event.threadID, event.messageID);

      return api.sendMessage(
        {
          body: "এই নে তোর ভিডিও",
          attachment: Buffer.from(videoRes.data, "binary")
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("কিছু একটা সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
  }
};
