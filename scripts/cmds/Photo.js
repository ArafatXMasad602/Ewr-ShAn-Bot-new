const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "photo",
    version: "3.1",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Search and get photos" },
    longDescription: { en: "Search photos from Pixabay and auto delete after 30s" },
    category: "media",
    guide: { en: "#photo <keyword> [count]" }
  },

  onStart: async function ({ message, args, api, event }) {
    if (!args[0]) return message.reply("Please provide a keyword.\nExample: #photo cat 3");

    let keyword = args.join(" ");
    let count = 1;

    if (!isNaN(args[args.length - 1])) {
      count = parseInt(args.pop());
      keyword = args.join(" ");
    }

    if (count < 1 || count > 10) return message.reply("You can only request 1 to 10 images.");

    const apiKey = "37363439-230859b832dcfbe9b673da1ee";
    const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=${count}`;

    try {
      const response = await axios.get(apiUrl);
      const images = response.data.hits;

      if (!images || images.length === 0) return message.reply("No images found for your keyword.");

      const attachments = [];

      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i].largeImageURL;
        const imagePath = path.join(__dirname, `temp_${i}.jpg`);
        const imgData = await axios.get(imageUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, imgData.data);
        attachments.push(fs.createReadStream(imagePath));
      }

      const sent = await message.reply({
        body: `Found ${attachments.length} image(s) for: "${keyword}"\n(Will auto-delete in 30 seconds)`,
        attachment: attachments
      });

      for (let i = 0; i < images.length; i++) {
        fs.unlinkSync(path.join(__dirname, `temp_${i}.jpg`));
      }

      setTimeout(() => {
        api.unsendMessage(sent.messageID);
      }, 30000);

    } catch (error) {
      console.error("Error fetching images:", error.message);
      return message.reply("Something went wrong while fetching images.\nTry a different keyword.");
    }
  }
};
