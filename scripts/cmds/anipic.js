const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anipic",
    version: "1.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get anime images by name" },
    longDescription: { en: "Fetch anime images by keyword using NekosAPI" },
    category: "media"
  },

  onStart: async function ({ args, message }) {
    const query = args.join(" ");
    if (!query) return message.reply("Please provide an anime name. Example: #anipic One Piece");

    const msg = await message.reply("Fetching anime images...");

    try {
      const response = await axios.get(`https://api.nekosapi.com/v4/images?search=${encodeURIComponent(query)}`);
      const results = response.data.items;

      if (!results || results.length === 0) return message.reply("No images found for this anime.");

      // Pick one random image
      const randomImage = results[Math.floor(Math.random() * results.length)];
      const imgUrl = randomImage.url;

      const imgPath = path.join(__dirname, "anime.jpg");
      const imageData = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imageData.data);

      const sent = await message.reply({
        body: `Here's an image for "${query}"`,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => {
        message.unsend(sent.messageID);
        fs.unlinkSync(imgPath);
      }, 20000); // Auto delete after 20 seconds

    } catch (err) {
      console.error("Error:", err.message);
      message.reply("Something went wrong while fetching images.");
    }
  }
};
