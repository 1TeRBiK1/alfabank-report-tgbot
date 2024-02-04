import "dotenv/config";
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import alfaBantTXTToArr from "./alfaBankTXTToArr.js";
import CATEGORIES from "./constants/categories.js";
import CARDS from "./constants/cards.js";
import replyTransactionCard from "./replyTransactionCard.js";
import replyCardPicker from "./replyCardPicker.js";
import createKeyboard from "./createKeyBoard.js";
import clearVariables from "./clearVariables.js";

const bot = new Telegraf(process.env.TG_BOT, {
  handlerTimeout: Infinity,
});

bot.command("start", (ctx) => {
  ctx.reply("Hi! Give me a TXT file.");
});

let store = clearVariables();

bot.on(message("document"), async (ctx) => {
  store = clearVariables();

  store._transactions = await alfaBantTXTToArr(ctx);
  store._item = store._transactions[store._index];
  replyCardPicker(ctx);
});

CARDS.map((card) =>
  bot.action(`recordExpense_${card}`, (ctx) => {
    store._card = card;
    replyTransactionCard(ctx, store._item);
  })
);

CATEGORIES.map((category) =>
  bot.action(`recordExpense_${category}`, (ctx) => {
    ctx.answerCbQuery(
      `Записано в категорию трат ${category} сумма: ${normalizeCost(
        store._item.cost
      )}`
    );
    store._categoriesCost[category] += normalizeCost(store._item.cost);
    writeTransactionAndMessage(ctx);
  })
);

bot.action(`skip`, (ctx) => {
  ctx.answerCbQuery("Пропущено");
  writeTransactionAndMessage(ctx);
});

function writeTransactionAndMessage(ctx) {
  store._index++;
  store._item = store._transactions[store._index];
  if (store._item) {
    if (isСurrencyTransaction(store._item)) {
      return writeTransactionAndMessage(ctx);
    }
    if (isYandexGo(store._item)) {
      store._categoriesCost["Такси"] += normalizeCost(store._item.cost);
      return writeTransactionAndMessage(ctx);
    }
    if(isYandexFood(store._item)) {
      store._categoriesCost["Фастфуд"] += normalizeCost(store._item.cost);
      return writeTransactionAndMessage(ctx);
    }
  }
  if (store._index === store._transactions.length) {
    let message = `Карта: ${store._card}\n`;
    let generalExpenses = 0;

    for (const category in store._categoriesCost) {
      generalExpenses += store._categoriesCost[category];
      if (store._categoriesCost[category] !== 0)
        message += `${category}: ${store._categoriesCost[category].toFixed(
          2
        )}\n`;
    }
    message += `Общие траты по карте ${store._card}: ${generalExpenses.toFixed(
      2
    )}\n`;
    ctx.reply(message);
    ctx = undefined;
    store = clearVariables();
  } else {
    ctx.reply(
      `${store._item.date}\n\n${store._item.name}\n\n${normalizeCost(
        store._item.cost
      )} BYN`,
      Markup.inlineKeyboard(createKeyboard(CATEGORIES))
    );
  }
}

function normalizeCost(cost) {
  return Math.abs(Number(cost));
}

function isСurrencyTransaction(item) {
  return String(item.name).includes("БАРАНОВСКИЙ МАКСИМ ЛЕОНИДОВИЧ В/о");
}

function isYandexGo(item) {
  return String(item.name).includes("YANDEX.GO");
}

function isYandexFood(item) {
  return String(item.name).includes("YANDEX.EDA");
}

bot.launch();
