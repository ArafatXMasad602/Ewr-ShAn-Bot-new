const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "photo",
    version: "3.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get image(s) by keyword"
    },
    longDescription: {
      en: "Type #photo <keyword> [count], and get image(s). Auto delete after 30s"
    },
    category: "media",
    guide: {
      en: "#photo dog\n#photo anime 5"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    if (args.length === 0) return message.reply("Please provide a keyword. Example: `#photo cat 3`");

    let count = 1;
    let keyword = args.join(" ");

    if (!isNaN(args[args.length - 1])) {
      count = parseInt(args[args.length - 1]);
      keyword = args.slice(0, -1).join(" ");
    }

    if (count < 1 || count > 10) return message.reply("You can request between 1 and 10 images.");

    const apiKey = "37363439-230859b832dcfbe9b673da1ee";
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=${count}`;

    try {
      const res = await axios.get(url);
      const results = res.data.hits;

      if (results.length === 0) return message.reply("No image found.");

      const attachments = [];

      for (let i = 0; i < Math.min(count, results.length); i++) {
        const imgURL = results[i].webformatURL;
        const imgPath = path.join(__dirname, `temp_${i}.jpg`);

        const imgRes = await axios.get(imgURL, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, imgRes.data);
        attachments.push(fs.createReadStream(imgPath));
      }

      const sent = await message.reply({ body: `Here's your "${keyword}" photo${count > 1 ? 's' : ''}: (auto delete in 30s)`, attachment: attachments });

      // Clean up local temp files
      for (let i = 0; i < attachments.length; i++) {
        fs.unlinkSync(path.join(__dirname, `temp_${i}.jpg`));
      }

      // Auto delete after 30 seconds
      setTimeout(() => {
        api.unsendMessage(sent.messageID);
      }, 30000);

    } catch (err) {
      console.error(err);
      return message.reply("Something went wrong while fetching the images.");
    }
  }
};
