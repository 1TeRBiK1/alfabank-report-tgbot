import CARDS from "./constants/cards.js";
import createKeyboard from "./createKeyBoard.js";
import { Markup } from "telegraf";

const replyCardPicker = (ctx) => {
  ctx.reply(
    `Выберите Карту списания:`,
    Markup.inlineKeyboard(createKeyboard(CARDS))
  );
};

export default replyCardPicker;
