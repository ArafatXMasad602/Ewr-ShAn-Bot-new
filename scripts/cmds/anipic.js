const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "anipic",
    version: "1.0",
    author: "Arafat",
    role: 0,
    shortDescription: { en: "Get anime pictures" },
    longDescription: { en: "Fetch up to 50 anime-style images from Pixabay" },
    category: "media"
  },

  onStart: async function ({ message, args }) {
    const query = args.slice(0, -1).join(" ") || "anime";
    const count = Math.min(parseInt(args[args.length - 1]) || 1, 50);

    if (!query) {
      return message.reply("Please provide a keyword. Example: #anipic Naruto 5");
    }

    const apiKey = "49769725-8378f1c6766c9400bc7f69fc8";
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query + " anime")}&image_type=photo&per_page=${count}&safesearch=true`;

    try {
      const res = await axios.get(url);
      const data = res.data.hits;

      if (!data.length) {
        return message.reply("No anime images found. Try a different keyword.");
      }

      const imagePaths = [];

      const attachments = await Promise.all(
        data.map(async (img, index) => {
          const imageRes = await axios.get(img.largeImageURL, { responseType: "arraybuffer" });
          const imgPath = path.join(__dirname, `anipic_${Date.now()}_${index}.jpg`);
          fs.writeFileSync(imgPath, imageRes.data);
          imagePaths.push(imgPath);
          return fs.createReadStream(imgPath);
        })
      );

      const sent = await message.reply({
        body: `Here are your anime pictures for: ${query}`,
        attachment: attachments
      });

      setTimeout(() => {
        message.unsend(sent.messageID);
        imagePaths.forEach(p => fs.unlinkSync(p));
      }, 20000);

    } catch (err) {
      console.error("Error fetching images:", err.message);
      message.reply("Something went wrong while fetching images. Please try again.");
    }
  }
};
