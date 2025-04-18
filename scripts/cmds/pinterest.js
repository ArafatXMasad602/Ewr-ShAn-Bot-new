const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "pimg"],
    version: "1.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fetch images from Pinterest"
    },
    longDescription: {
      en: "Fetch up to 50 images from Pinterest using Google CSE"
    },
    category: "media",
    guide: {
      en: "#Pinterest <keyword> - <count>\n\nExample:\n#Pinterest Naruto - 20"
    }
  },

  onStart: async function ({ api, event, args }) {
    const apiKey = "AIzaSyAQuveDGpMZOMzO7-Ai6M5usHnzko7F4QA"; // তোমার Google API Key
    const cx = "70d51de06b6454014"; // তোমার CSE ID

    let input = args.join(" ");
    let count = 10;
    if (input.includes("-")) {
      const parts = input.split("-");
      input = parts[0].trim();
      count = Math.min(parseInt(parts[1].trim()), 50);
    }

    const query = encodeURIComponent(input + " site:pinterest.com");

    try {
      const res = await axios.get(
        `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&key=${apiKey}&searchType=image&num=${count}`
      );

      const items = res.data.items;
      if (!items || items.length === 0) {
        return api.sendMessage("কোনো ছবি পাওয়া যায়নি!", event.threadID);
      }

      const attachments = [];
      for (const item of items) {
        try {
          const imgStream = await global.utils.getStreamFromURL(item.link);
          attachments.push(imgStream);
        } catch (err) {
          console.log("ছবি আনতে সমস্যা:", item.link);
        }
      }

      if (attachments.length === 0) {
        return api.sendMessage("ছবি আনতে সমস্যা হয়েছে!", event.threadID);
      }

      await api.sendMessage({
        body: `🙃 ${input} এর ${attachments.length} টি Pinterest ছবি`,
        attachment: attachments
      }, event.threadID);
    } catch (e) {
      console.error(e);
      return api.sendMessage("Pinterest থেকে ছবি আনতে সমস্যা হয়েছে!", event.threadID);
    }
  }
};
