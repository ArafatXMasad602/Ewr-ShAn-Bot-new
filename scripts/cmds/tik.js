module.exports.config = {
  name: "tik",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Arafat Da",
  description: "টিকটকে দেওয়া টপিক দিয়ে ভিডিও খুঁজে এনে দেবে",
  commandCategory: "media",
  usages: "#tik car video",
  cooldowns: 5
};

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

module.exports.run = async function ({ api, event, args }) {
  const keyword = args.join(" ");
  if (!keyword) return api.sendMessage("তুই কি ভুলে গেছিস কী খুঁজবি লিখতে?", event.threadID, event.messageID);

  try {
    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const videoLinks = [];
    const $ = cheerio.load(html);
    $('a[href*="/video/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/video/')) {
        const fullUrl = `https://www.tiktok.com${href}`;
        if (!videoLinks.includes(fullUrl)) videoLinks.push(fullUrl);
      }
    });

    if (videoLinks.length === 0) {
      return api.sendMessage("কোনো ভিডিও খুঁজে পাইনি!", event.threadID, event.messageID);
    }

    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];

    // Snapsave API ব্যবহার
    const snapsaveRes = await axios.get(`https://snapsave.app/download-video-tiktok`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      params: { url: randomVideo }
    });

    const snapsaveHTML = snapsaveRes.data;
    const $$ = cheerio.load(snapsaveHTML);
    const videoUrl = $$('a.download-link').attr('href');

    if (!videoUrl) return api.sendMessage("ভিডিও আনতে সমস্যা হচ্ছে! আবার চেষ্টা করো।", event.threadID, event.messageID);

    const videoPath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
    const videoStream = (await axios.get(videoUrl, { responseType: 'stream' })).data;

    const writer = fs.createWriteStream(videoPath);
    videoStream.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: "এই নে তোর ভিডিও",
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => fs.unlinkSync(videoPath));
    });

    writer.on('error', () => {
      return api.sendMessage("ডাউনলোডে সমস্যা হয়েছে। পরে আবার চেষ্টা করো।", event.threadID, event.messageID);
    });

  } catch (err) {
    console.log(err);
    return api.sendMessage("সমস্যা হয়েছে ভাই! আবার চেষ্টা করো।", event.threadID, event.messageID);
  }
};
