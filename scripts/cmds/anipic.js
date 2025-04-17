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
    longDescription: { en: "Fetch up to 50 anime images using Pixabay API and auto delete after 20s" },
    category: "media"
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ") || "anime";
    const amount = Math.min(parseInt(args[1]) || 1, 50);
    const apiKey = "49769725-8378f1c6766c9400bc7f69fc8";
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&category=anime&per_page=${amount}`;

    const msg = await message.reply(`Fetching ${amount} anime image(s) for: "${query}"...`);

    try {
      const res = await axios.get(url);
      const data = res.data.hits;

      if (!data || data.length === 0) {
        return message.reply("No anime images found. Try another keyword.");
      }

      const attachments = [];

      for (let i = 0; i < Math.min(data.length, amount); i++) {
        const imageUrl = data[i].largeImageURL;
        const imgPath = path.join(__dirname, `anime_${i}.jpg`);
        const imageData = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, imageData.data);
        attachments.push(fs.createReadStream(imgPath));
      }

      const sent = await message.reply({
        body: `Here are your "${query}" anime image(s):`,
        attachment: attachments
      });

      setTimeout(() => {
        message.unsend(sent.messageID);
        attachments.forEach(a => fs.unlinkSync(a.path));
      }, 20000); // delete after 20s

    } catch (err) {
      console.error("Error:", err.message);
      message.reply("Something went wrong while fetching anime images.");
    }
  }
};
