const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "testimg",
    version: "1.0",
    author: "Arafat",
    role: 0,
    shortDescription: { en: "Test fixed image fetch" },
    longDescription: { en: "Download and send one fixed image" },
    category: "test"
  },

  onStart: async function ({ message }) {
    const url = "https://i.ibb.co/5GzXkwq/sample.jpg"; // একটা random hosted ছবি
    const filePath = path.join(__dirname, 'test.jpg');

    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, res.data);

      const sent = await message.reply({
        body: "Here is a test image (will auto-delete in 20s)",
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);

      setTimeout(() => {
        message.unsend(sent.messageID);
      }, 20000);

    } catch (err) {
      console.error(err.message);
      message.reply("Even fixed image fetch failed.");
    }
  }
};
