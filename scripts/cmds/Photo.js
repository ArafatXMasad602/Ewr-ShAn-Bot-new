const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "photo",
    version: "1.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Fetch a photo" },
    longDescription: { en: "Search photo by keyword using Pixabay" },
    category: "media",
    guide: { en: "#photo <keyword>" }
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) return message.reply("Please provide a search keyword.");

    const query = encodeURIComponent(args.join(" "));
    const apiKey = "37363439-230859b832dcfbe9b673da1ee"; // REPLACE with your own if needed
    const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&per_page=1`;

    try {
      const res = await axios.get(apiUrl);
      const hits = res.data.hits;

      if (!hits || hits.length === 0) {
        return message.reply("No image found for this keyword.");
      }

      const imageURL = hits[0].largeImageURL;
      const imgPath = path.join(__dirname, 'photo.jpg');

      const imgRes = await axios.get(imageURL, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imgRes.data);

      const sent = await message.reply({
        body: `Here is your image for "${args.join(" ")}"`,
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);

      setTimeout(() => {
        message.unsend(sent.messageID);
      }, 30000);

    } catch (err) {
      console.error(err.message);
      return message.reply("Failed to fetch image. Please try again later.");
    }
  }
};
