const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "photo",
    version: "3.1",
    author: "Arafat",
    role: 0,
    shortDescription: { en: "Get images from Pixabay" },
    longDescription: { en: "Fetch up to 50 images with keyword from Pixabay and auto delete" },
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

    const loadingMsg = await message.reply(`Searching for "${keyword}" images (${amount})...`);

    try {
      const res = await axios.get(apiUrl);
      if (!res.data || !res.data.hits || res.data.hits.length === 0) {
        return message.reply("No image found for that keyword. Try something else.");
      }

      const attachments = [];

      for (let i = 0; i < Math.min(res.data.hits.length, amount); i++) {
        const imageUrl = res.data.hits[i].largeImageURL || res.data.hits[i].webformatURL;
        const fileName = `photo_${i}.jpg`;
        const filePath = path.join(__dirname, fileName);

        const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, image.data);
        attachments.push(fs.createReadStream(filePath));
      }

      const sent = await message.reply({
        body: `Here are your "${keyword}" images:`,
        attachment: attachments
      });

      // Delete after 20 seconds
      setTimeout(() => {
        message.unsend(sent.messageID);
        attachments.forEach(file => fs.unlinkSync(file.path));
      }, 20000);

    } catch (err) {
      console.error(err);
      message.reply("Something went wrong while fetching images.");
    }
  }
};
