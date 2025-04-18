module.exports = {
  config: {
    name: "bet",
    version: "1.0",
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    shortDescription: {
      en: "বেট গেম",
    },
    longDescription: {
      en: "বেট গেম।",
    },
    category: "𝗚𝗔𝗠𝗘",
  },
  langs: {
    en: {
      invalid_amount: "একটি সঠিক এবং পজিটিভ পরিমাণ দিন যাতে আপনি ডাবল জেতার সুযোগ পান।",
      not_enough_money: "আপনার কাছে এই পরিমাণ বেট করার জন্য পর্যাপ্ত টাকা নেই।",
      win_message: "আপনি $%1 জিতেছেন, বন্ধু!",
      lose_message: "আপনি $%1 হারিয়েছেন, বন্ধু।",
      jackpot_message: "জ্যাকপট! আপনি $%1 জিতেছেন তিনটি %2 স্লট নিয়ে, বন্ধু!",
      spin_message: "স্পিন হচ্ছে...",
      balance_message: "আপনার নতুন ব্যালেন্স: $%1",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // স্লট ইমোজি লিস্ট
    const slots = ["💚", "💛", "💙", "💛", "💚", "💙", "💙", "💛", "💚"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);
    const newBalance = userData.money + winnings;

    await usersData.set(senderID, {
      money: newBalance,
      exp: userData.exp,
      data: userData.data,
    });

    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, newBalance, getLang);

    return message.reply(messageText);
  },
};

// জেতার হিসাব
function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "💚" && slot2 === "💚" && slot3 === "💚") {
    return betAmount * 10;
  } else if (slot1 === "💛" && slot2 === "💛" && slot3 === "💛") {
    return betAmount * 5;
  } else if (slot1 === slot2 && slot2 === slot3) {
    return betAmount * 3;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

// ফলাফল মেসেজ
function getSpinResultMessage(slot1, slot2, slot3, winnings, balance, getLang) {
  const result = `[ ${slot1} | ${slot2} | ${slot3} ]`;
  if (winnings > 0) {
    if (slot1 === "💙" && slot2 === "💙" && slot3 === "💙") {
      return `${getLang("jackpot_message", winnings, "💙")}\n${result}\n${getLang("balance_message", balance)}`;
    } else {
      return `${getLang("win_message", winnings)}\n${result}\n${getLang("balance_message", balance)}`;
    }
  } else {
    return `${getLang("lose_message", -winnings)}\n${result}\n${getLang("balance_message", balance)}`;
  }
}
