const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "img"],
    version: "1.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search Pinterest Images"
    },
    longDescription: {
      en: "Search and fetch up to 50 Pinterest-style images from Google"
    },
    category: "media",
    guide: {
      en: "#pinterest Naruto - 20"
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

      for (const item of items) {
        await api.sendMessage({
          body: `📌 ${input} এর Pinterest ছবি`,
          attachment: await global.utils.getStreamFromURL(item.link)
        }, event.threadID);
      }
    } catch (e) {
      console.error(e);
      return api.sendMessage("Error হয়েছে Pinterest থেকে ছবি আনতে!", event.threadID);
    }
  }
};
