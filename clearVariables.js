import CATEGORIES from "./constants/categories.js";
export default function clearVariables() {
  let _index = 0;
  let _item = null;
  let _categoriesCost = {};
  CATEGORIES.forEach((category) => {
    _categoriesCost[category] = 0;
  });
  let _transactions = [];
  let _card = null;
  return {
    _index,
    _item,
    _categoriesCost,
    _transactions,
    _card,
  };
}
