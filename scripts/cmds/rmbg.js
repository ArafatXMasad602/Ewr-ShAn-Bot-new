const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "rmbg",
    version: "1.0",
    author: "Arafat",
    shortDescription: { en: "Remove image background" },
    longDescription: { en: "Removes background from a JPG or PNG image" },
    category: "media",
    role: 0
  },

  onStart: async function ({ message, event }) {
    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || !attachment.url || !["image/jpeg", "image/png"].includes(attachment.type)) {
      return message.reply("Please reply to a JPG or PNG image.");
    }

    const imgPath = path.join(__dirname, "input.png");
    const outputPath = path.join(__dirname, "no-bg.png");

    try {
      const imgData = await axios.get(attachment.url, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, imgData.data);

      const res = await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: {
          image_file_b64: imgData.data.toString('base64'),
          size: "auto"
        },
        headers: {
          'X-Api-Key': 'pU61q1YWP8hu2RB2tDpuYFqR',
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      });

      fs.writeFileSync(outputPath, res.data);
      await message.reply({ body: "Background removed!", attachment: fs.createReadStream(outputPath) });

      fs.unlinkSync(imgPath);
      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error(err);
      message.reply("Failed to remove background. Please try again.");
    }
  }
};
