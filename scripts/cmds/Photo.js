const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "photo",
    version: "3.0",
    author: "Arafat",
    role: 0,
    shortDescription: { en: "Get multiple images from Pixabay" },
    longDescription: { en: "Fetch up to 50 images by keyword from Pixabay and auto delete after 20s" },
    category: "media"
  },

  onStart: async function ({ message, args }) {
    const keyword = args[0];
    const amount = Math.min(parseInt(args[1]) || 1, 50);

    if (!keyword) {
      return message.reply("Please provide a keyword. Example: #photo cat 5");
    }

    const apiKey = '49769725-8378f1c6766c9400bc7f69fc8';
    const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=${amount}&safesearch=true`;

    const msg = await message.reply(`Fetching ${amount} image(s) for: "${keyword}"...`);

    try {
      const res = await axios.get(apiUrl);
      const hits = res.data.hits;

      if (hits.length === 0) {
        return message.reply("No images found for that keyword. Try something else.");
      }

      const attachments = [];

      for (let i = 0; i < Math.min(hits.length, amount); i++) {
        const imgURL = hits[i].webformatURL;
        const imgPath = path.join(__dirname, `pixabay_${i}.jpg`);

        const imgRes = await axios.get(imgURL, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, imgRes.data);
        attachments.push(fs.createReadStream(imgPath));
      }

      const sent = await message.reply({
        body: `Here are your "${keyword}" images from Pixabay.`,
        attachment: attachments
      });

      setTimeout(() => {
        message.unsend(sent.messageID);
        attachments.forEach(a => fs.unlinkSync(a.path));
      }, 20000); // auto delete after 20s

    } catch (e) {
      console.error("Pixabay fetch error:", e.message);
      message.reply("Something went wrong while fetching images.");
    }
  }
};
