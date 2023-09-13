import CATEGORIES from "./constants/categories.js";
import createKeyboard from "./createKeyBoard.js";
import { Markup } from "telegraf";

const replyTransactionCard = (ctx, item) => {
  ctx.reply(
    `${item.date}\n\n${item.name}\n\n${item.cost} BYN`,
    Markup.inlineKeyboard(createKeyboard(CATEGORIES))
  );
};

export default replyTransactionCard;
