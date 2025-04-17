module.exports.config = {
  name: "animequiz",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Arafat",
  description: "এনিমে ভিত্তিক কুইজ",
  category: "game",
  usages: "animequiz",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const questions = [
    {
      question: "নারুটোর বাবার নাম কী?",
      options: ["কাকাশি", "মিনাতো", "ইটাচি", "জিরায়া"],
      answer: "মিনাতো"
    },
    {
      question: "লুফির ভাইয়ের নাম কী?",
      options: ["সাবো", "শাঙ্কস", "এস", "জোরো"],
      answer: "এস"
    },
    {
      question: "ড্রাগন বল এনিমেতে গোকুর বাবার নাম কী?",
      options: ["বর্ধক", "ভেজিটা", "র‍্যাডিজ", "বারডক"],
      answer: "বারডক"
    },
    {
      question: "টাইটানদের বিরুদ্ধে যুদ্ধ হয় কোন এনিমেতে?",
      options: ["Naruto", "Attack on Titan", "Bleach", "Death Note"],
      answer: "Attack on Titan"
    },
    {
      question: "ডেথ নোট কার ছিল?",
      options: ["লাইট", "এল", "মিসা", "রিউক"],
      answer: "রিউক"
    },
    // ... এখান থেকে আরও ৯৫টা প্রশ্ন যোগ করো নিচের একই ফর্ম্যাটে

    // উদাহরণ কুইজ ৬ থেকে ১০০ পর্যন্ত
    {
      question: "গিন্তামা এনিমের প্রধান চরিত্র কে?",
      options: ["সাকাতা গিন্তোকি", "হিজিকাতা", "কাগুরা", "শিনপাচি"],
      answer: "সাকাতা গিন্তোকি"
    },
    {
      question: "হিনাতার ভাইয়ের নাম কী?",
      options: ["নেজি", "কিবা", "সাসকে", "ইনো"],
      answer: "নেজি"
    },
    {
      question: "Death Note-এ এল এর আসল নাম কী?",
      options: ["এল", "রিউজাকি", "লাইট", "ল লয়েট"],
      answer: "ল লয়েট"
    },
    {
      question: "One Punch Man-এর হিরোর নাম কী?",
      options: ["সাইতামা", "গারো", "জেনোস", "বোরোস"],
      answer: "সাইতামা"
    },
    {
      question: "ইটাচি কোন ক্ল্যানের সদস্য?",
      options: ["হিউগা", "উচিহা", "নামিকাজে", "হারুনো"],
      answer: "উচিহা"
    }

    // এভাবে পুরো ১০০টা কুইজ যুক্ত করে দিতে হবে
  ];

  const random = questions[Math.floor(Math.random() * questions.length)];
  const questionText = `প্রশ্ন: ${random.question}\n` +
    `১. ${random.options[0]}\n` +
    `২. ${random.options[1]}\n` +
    `৩. ${random.options[2]}\n` +
    `৪. ${random.options[3]}\n\n` +
    `সঠিক উত্তর দেওয়ার জন্য ১, ২, ৩ অথবা ৪ লিখো।`;

  api.sendMessage(questionText, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      answer: random.answer,
      options: random.options
    });
  });
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { answer, options, author } = handleReply;
  if (event.senderID != author) return;

  const userAnswer = parseInt(event.body);
  if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > 4) {
    return api.sendMessage("দয়া করে ১ থেকে ৪ এর মধ্যে একটি সংখ্যা লিখো।", event.threadID);
  }

  const selected = options[userAnswer - 1];
  const isCorrect = selected === answer;

  api.sendMessage(
    isCorrect ? `সঠিক উত্তর! তুমি একজন সত্যিকারের এনিমি ভক্ত ✅` : `ভুল উত্তর!তোর দ্বারা হবে না ❌\nসঠিক উত্তর ছিল: ${answer}`,
    event.threadID
  );
};
