const quizzes = [
  {
    question: "নারুতোর বাবার নাম কী?",
    options: ["কাকাশি", "মিনাতো", "ইরুকা", "জিরায়া"],
    answer: 1
  },
  {
    question: "লাফি কোন এনিমের চরিত্র?",
    options: ["Naruto", "One Piece", "Bleach", "Dragon Ball"],
    answer: 1
  },
  {
    question: "গোকুর পাওয়ার লেভেল কত ছিল?",
    options: ["9000", "500", "10000", "3000"],
    answer: 0
  },
  {
    question: "ডেথ নোটে L এর আসল নাম কী?",
    options: ["Light", "L Lawliet", "Ryuk", "Near"],
    answer: 1
  },
  {
    question: "টাইটান শো এর নাম কী?",
    options: ["Titanfall", "Attack on Titan", "Titan War", "Titan Force"],
    answer: 1
  },
  {
    question: "ইচিগো কোন এনিমের চরিত্র?",
    options: ["Bleach", "One Piece", "Naruto", "Fairy Tail"],
    answer: 0
  },
  {
    question: "ড্রাগন বল Z তে গোকুর ছেলে কে?",
    options: ["Vegeta", "Trunks", "Gohan", "Piccolo"],
    answer: 2
  },
  {
    question: "কোন এনিমেতে হিনাতা আছে?",
    options: ["Bleach", "Naruto", "Death Note", "Demon Slayer"],
    answer: 1
  },
  {
    question: "টোকিও ঘুল কে হান্ট করে?",
    options: ["Vampires", "Cops", "Doves", "Demons"],
    answer: 2
  },
  {
    question: "Demon Slayer-এ প্রধান চরিত্র কে?",
    options: ["Naruto", "Luffy", "Tanjiro", "Ichigo"],
    answer: 2
  }
  // চাইলে এখানে আরও প্রশ্ন যোগ করা যাবে
];

const quizData = {};

module.exports = {
  config: {
    name: "animequiz",
    version: "1.0",
    hasPermssion: 0,
    credits: "Arafat",
    description: "এনিমে কুইজ খেলা",
    category: "game",
    usages: "animequiz",
    cooldowns: 5
  },

  onStart: async function ({ message, event }) {
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    const options = quiz.options.map((opt, i) => `${i + 1}. ${opt}`).join("\n");

    quizData[event.senderID] = quiz;

    return message.reply(
      `প্রশ্নঃ ${quiz.question}\n\n${options}\n\nউত্তর দিন: 1, 2, 3 অথবা 4`,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "animequiz",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    );
  },

  onReply: async function ({ message, event, Reply }) {
    const quiz = quizData[event.senderID];
    if (!quiz) return message.reply("প্রথমে একটি কুইজ শুরু করুন!");

    const userAnswer = parseInt(event.body.trim());
    if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > 4) {
      return message.reply("দয়া করে 1 থেকে 4 এর মধ্যে একটি সংখ্যা লিখুন।");
    }

    if (userAnswer - 1 === quiz.answer) {
      message.reply(`সঠিক উত্তর! ✅\nউত্তর ছিল: ${quiz.options[quiz.answer]}`);
    } else {
      message.reply(`ভুল উত্তর ❌\nসঠিক উত্তর ছিল: ${quiz.options[quiz.answer]}`);
    }

    delete quizData[event.senderID];
  }
};
