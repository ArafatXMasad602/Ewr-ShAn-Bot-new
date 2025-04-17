const axios = require("axios");

module.exports = {
  config: {
    name: "anipic",
    version: "1.0",
    author: "Arafat & ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fetch anime-style images",
    },
    longDescription: {
      en: "Search and get anime-style illustrations from Pixabay",
    },
    category: "image",
    guide: {
      en: "{pn} <keyword> [amount]\nExample: {pn} Kakashi 5",
    },
  },

  onStart: async function ({ api, event, args }) {
    const apiKey = "49769725-8378f1c6766c9400bc7f69fc8";
    
    const query = args.slice(0, -1).join(" ") || "anime";
    const amountRaw = args[args.length - 1];
    const amount = (isNaN(amountRaw) ? 1 : parseInt(amountRaw)) || 1;

    if (amount > 50 || amount < 1) {
      return api.sendMessage("Please choose between 1 to 50 images.", event.threadID, event.messageID);
    }

    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=illustration&per_page=${amount}&safesearch=true`;

    try {
      const res = await axios.get(url);
      const data = res.data.hits;

      if (!data.length) {
        return api.sendMessage("No images found for your keyword.", event.threadID, event.messageID);
      }

      const images = await Promise.all(
        data.map(async (img) => {
          const imageRes = await axios.get(img.largeImageURL, { responseType: "stream" });
          return { attachment: imageRes.data };
        })
      );

      return api.sendMessage(images, event.threadID, event.messageID);
    } catch (err) {
      console.error("Error fetching images:", err.message);
      return api.sendMessage("Something went wrong while fetching images.", event.threadID, event.messageID);
    }
  },
};
