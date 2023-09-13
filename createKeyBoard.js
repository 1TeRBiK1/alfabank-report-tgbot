import { Markup } from "telegraf";

const createKeyboard = (buttons) => {
  const keyboard = [];
  let row = [];

  for (let i = 0; i < buttons.length; i++) {
    row.push(
      Markup.button.callback(buttons[i], `recordExpense_${buttons[i]}`)
    );

    // Разбиваем кнопки по 6 на каждую строку
    if (row.length % 6 === 0) {
      keyboard.push([...row]);

      row = [];
    }
  }

  keyboard.push([...row]);
  // Добавляем кнопку "Пропустить"
  keyboard.push([Markup.button.callback("Пропустить", "skip")]);

  return keyboard;
};

export default createKeyboard;
