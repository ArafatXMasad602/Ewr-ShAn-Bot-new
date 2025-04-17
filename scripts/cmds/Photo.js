const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "photo",
    version: "1.0",
    author: "Arafat",
    role: 0,
    shortDescription: { en: "Get random images by keyword" },
    longDescription: { en: "Fetch up to 50 images with keyword and auto delete after 20s" },
    category: "media"
  },

  onStart: async function ({ message, args }) {
    const keyword = args[0];
    const amount = Math.min(parseInt(args[1]) || 1, 50);

    if (!keyword) {
      return message.reply("Please provide a keyword. Example: #photo cat 5");
    }

    message.reply(`Fetching ${amount} image(s) for: "${keyword}"...`);

    const imageLinks = [];
    for (let i = 0; i < amount; i++) {
      const url = `https://loremflickr.com/800/600/${encodeURIComponent(keyword)}?random=${Math.random()}`;
      imageLinks.push(url);
    }

    const attachments = [];

    for (let i = 0; i < imageLinks.length; i++) {
      const imgPath = path.join(__dirname, `photo_${i}.jpg`);
      try {
        const res = await axios.get(imageLinks[i], { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, res.data);
        attachments.push(fs.createReadStream(imgPath));
      } catch (e) {
        console.log(`Error fetching image ${i + 1}:`, e.message);
      }
    }

    if (attachments.length === 0) {
      return message.reply("Failed to fetch any image. Try again.");
    }

    const sent = await message.reply({
      body: `Here are your "${keyword}" images`,
      attachment: attachments
    });

    setTimeout(() => {
      message.unsend(sent.messageID);
      attachments.forEach(a => fs.unlinkSync(a.path));
    }, 20000); // 20s
  }
};
