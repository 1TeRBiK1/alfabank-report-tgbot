import "dotenv/config";
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import alfaBantTXTToArr from "./alfaBankTXTToArr.js";
import CATEGORIES from "./constants/categories.js";
import replyTransactionCard from "./replyTransactionCard.js";
import createKeyboard from "./createKeyBoard.js";

const bot = new Telegraf(process.env.TG_BOT, {
  handlerTimeout: Infinity,
});

bot.command("start", (ctx) => {
  ctx.reply("Hi! Give me a TXT file.");
});

bot.on(message("document"), async (ctx) => {
  const transactions = await alfaBantTXTToArr(ctx);

  const categoriesCost = {};

  CATEGORIES.forEach((category) => {
    categoriesCost[category] = 0;
  });

  let _index = 0;
  let _item = transactions[_index];

  replyTransactionCard(ctx, _item);

  CATEGORIES.map((category) =>
    bot.action(`recordExpense_${category}`, (ctx) => {
      ctx.answerCbQuery(
        `Записано в категорию трат ${category} сумма: ${_item.cost}`
      );
      categoriesCost[category] += _item.cost;
      _index++;
      _item = transactions[_index];
      if (_index === transactions.length) {
        let message = "";
        for (const category in categoriesCost) {
          message += `${category}: ${categoriesCost[category]}\n`;
        }
        ctx.reply(message);
      } else {
        ctx.reply(
          `${_item.date}\n\n${_item.name}\n\n${_item.cost} BYN`,
          Markup.inlineKeyboard(createKeyboard(CATEGORIES))
        );
      }
    })
  );

  bot.action(`skip`, (ctx) => {
    ctx.answerCbQuery("Пропущено");
    _index++;
    _item = transactions[_index];
    if (_index === transactions.length) {
      let message = "";
      for (const category in categoriesCost) {
        message += `${category}: ${categoriesCost[category]}\n`;
      }
      ctx.reply(message);
    } else {
      ctx.reply(
        `${_item.date}\n\n${_item.name}\n\n${_item.cost} BYN`,
        Markup.inlineKeyboard(createKeyboard(CATEGORIES))
      );
    }
  });
});

bot.launch();
