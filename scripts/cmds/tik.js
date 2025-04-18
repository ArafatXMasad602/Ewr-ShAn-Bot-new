const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
  name: "tik",
  version: "1.0.0",
  author: "Arafat Da",
  countDown: 5,
  role: 0,
  shortDescription: "টিকটক থেকে ভিডিও আনো",
  longDescription: "আপনার দেওয়া বিষয়ে TikTok এ সার্চ দিয়ে র‍্যান্ডম ভিডিও এনে দিবে",
  category: "media",
  guide: "{pn} <search term>\n\nউদাহরণ: {pn} car video"
};

module.exports.run = async function({ api, event, args }) {
  const searchQuery = args.join(" ");
  if (!searchQuery) return api.sendMessage("দয়া করে একটি সার্চ টার্ম দাও, যেমন: #tik Naruto", event.threadID);

  const loading = await api.sendMessage(`🔍 "${searchQuery}" নিয়ে ভিডিও খুঁজছি...`, event.threadID);

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
    const ssstikUrl = `https://ssstik.io/en`;

    const response = await axios.post(ssstikUrl, new URLSearchParams({
      id: randomLink,
      locale: "en",
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $$ = cheerio.load(response.data);
    const noWatermarkUrl = $$("a.without_watermark").attr("href");

    if (!noWatermarkUrl) {
      return api.sendMessage("ভিডিও আনতে সমস্যা হচ্ছে! আবার চেষ্টা করো।", event.threadID, event.messageID);
    }

    const videoRes = await axios.get(noWatermarkUrl, { responseType: "stream" });
    api.sendMessage({
      body: `এই নে তোর ভিডিও "${searchQuery}"`,
      attachment: videoRes.data
    }, event.threadID, () => api.unsendMessage(loading.messageID));
  } catch (err) {
    console.log(err);
    return api.sendMessage("ভুল হয়েছে! আবার চেষ্টা করো।", event.threadID, event.messageID);
  }
};
