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
    console.log(store._categoriesCost);
    ctx.answerCbQuery(
      `Записано в категорию трат ${category} сумма: ${store._item.cost}`
    );
    store._categoriesCost[category] += store._item.cost;
    console.log(store._categoriesCost, store._item);
    store._index++;
    store._item = store._transactions[store._index];
    if (store._index === store._transactions.length) {
      let message = `Карта: ${store._card}\n`;

      for (const category in store._categoriesCost) {
        if (store._categoriesCost[category] !== 0)
          message += `${category}: ${store._categoriesCost[category].toFixed(2)}\n`;
      }
      ctx.reply(message);
      ctx = undefined;
      store = clearVariables();
    } else {
      ctx.reply(
        `${store._item.date}\n\n${store._item.name}\n\n${store._item.cost} BYN`,
        Markup.inlineKeyboard(createKeyboard(CATEGORIES))
      );
    }
  })
);

bot.action(`skip`, (ctx) => {
  ctx.answerCbQuery("Пропущено");
  store._index++;
  store._item = store._transactions[store._index];
  if (store._index === store._transactions.length) {
    let message = `Карта: ${store._card}\n`;
    for (const category in store._categoriesCost) {
      message += `${category}: ${store._categoriesCost[category]}\n`;
    }
    ctx.reply(message);
    ctx = undefined;
    store = clearVariables();
  } else {
    ctx.reply(
      `${store._item.date}\n\n${store._item.name}\n\n${store._item.cost} BYN`,
      Markup.inlineKeyboard(createKeyboard(CATEGORIES))
    );
  }
});

bot.launch();
