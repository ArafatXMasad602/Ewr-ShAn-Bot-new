const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rmbg",
    version: "1.1",
    author: "Arafat",
    shortDescription: { en: "Remove background from image" },
    longDescription: { en: "Removes background from JPG or PNG image using Remove.bg API" },
    category: "media",
    role: 0
  },

  onStart: async function ({ message, event, api }) {
    const replyAttachment = event.messageReply?.attachments?.[0];

    if (!replyAttachment || !["photo", "image"].includes(replyAttachment.type)) {
      return message.reply("Please reply to a valid image (JPG or PNG).");
    }

    const inputPath = path.join(__dirname, "input_image.png");
    const outputPath = path.join(__dirname, "no_bg.png");

    try {
      // Download the image
      const imgRes = await axios.get(replyAttachment.url, { responseType: "arraybuffer" });
      fs.writeFileSync(inputPath, imgRes.data);

      // Upload to remove.bg API
      const formData = new FormData();
      formData.append("image_file", fs.createReadStream(inputPath));
      formData.append("size", "auto");

      const res = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": "pU61q1YWP8hu2RB2tDpuYFqR"
        },
        responseType: "arraybuffer"
      });

      fs.writeFileSync(outputPath, res.data);

      await message.reply({
        body: "Background removed successfully!",
        attachment: fs.createReadStream(outputPath)
      });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

    } catch (error) {
      console.error(error?.response?.data || error.message);
      return message.reply("Failed to remove background. Please check the image and try again.");
    }
  }
};
