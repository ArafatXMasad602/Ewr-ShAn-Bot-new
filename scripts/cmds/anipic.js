const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "anipic",
    version: "1.2",
    author: "Arafat",
    role: 0,
    shortDescription: { en: "Get anime pictures" },
    longDescription: { en: "Get up to 50 anime pictures using a keyword" },
    category: "media"
  },

  onStart: async function ({ message, args }) {
    let amount = 1;
    let query = "anime";

    // যদি শেষের প্যার্টটা সংখ্যা হয়, তাহলে সেটাই amount ধরা হবে
    if (args.length > 0 && !isNaN(args[args.length - 1])) {
      amount = parseInt(args.pop());
    }

    // বাকিটা কিওয়ার্ড হিসাবে ধরা হবে
    query = args.join(" ") || "anime";

    // validate amount
    if (isNaN(amount) || amount < 1) amount = 1;
    if (amount > 50) amount = 50;

    const apiKey = "49769725-8378f1c6766c9400bc7f69fc8";
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${amount}`;

    const msg = await message.reply(`Searching for "${query}" anime images...`);

    try {
      const res = await axios.get(url);
      const images = res.data.hits;

      if (!images.length) return message.reply(`No results found for "${query}".`);

      const attachments = [];

      for (let i = 0; i < images.length; i++) {
        const imgPath = path.join(__dirname, `anipic_${i}.jpg`);
        const imageData = await axios.get(images[i].largeImageURL, { responseType: 'arraybuffer' });
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
      }, 20000);

    } catch (err) {
      console.error("Error fetching images:", err.message);
      return message.reply("Failed to fetch images. Please try again later.");
    }
  }
};
