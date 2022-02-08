import MODULE_IDENTIFER from "./data/modules.js";
import LOYALTY_IDENTIFIER from "./data/loyalty.js";
import SKILL_IDENTIFER from "./data/skills.js";
import ITEM_IDENTIFER from "./data/items.js";
import VALUABLE_ITEMS from "./data/categories/valuable.js";
import HARDWARE_ITEMS from "./data/categories/hardware.js";
import MEDICAL_ITEMS from "./data/categories/medical.js";
import ELECTRONIC_ITEMS from "./data/categories/electronic.js";

export const parseRequirements = (requirements) => {
  // Use this function to cover different types of requirements so they can be set correctly in the JSON

  // Identifiers

  const skillRequirements = [];
  const itemRequirements = [];
  const moduleRequirements = [];
  const loyaltyRequirements = [];

  // Modules are simple, just an obj as { "item": "module" }
  requirements.forEach((requirement) => {
    MODULE_IDENTIFER.forEach((item) => {
      if (requirement.includes(item)) {
        const level = requirement.match(/(\d+)/)[0];
        const str = item + ", " + level;
        moduleRequirements.push({ item: str });
      }
    });

    // Loyalty requires some replacing as { "item": "Skier, 3" }
    LOYALTY_IDENTIFIER.forEach((item) => {
      if (requirement.includes(item)) {
        loyaltyRequirements.push({
          item: requirement.replace(item, item + ",").replace("LL", ""),
        });
      }
    });

    // Skills requires some replacing as { "item": "Endurance Level, 1" }
    SKILL_IDENTIFER.forEach((item) => {
      if (requirement.includes(item)) {
        skillRequirements.push({
          item: requirement.replace("Level", "Level,"),
        });
      }
    });
    // Items are the most complex and requires more formatting as
    // {
    //    "complete": false,
    //    "need": 50000,
    //    "category": "valuable_items",
    //    "have": 0,
    //    "item": "Roubles"
    // },
    ITEM_IDENTIFER.forEach((item) => {
      if (requirement.includes(item)) {
        // lookbehind regex (splitting on the first space)
        const [amount, item] = requirement.split(/(?<=^\S+)\s/);

        itemRequirements.push({
          complete: false,
          need: parseInt(amount.replace(",", "")),
          category: parseCategory(item),
          have: 0,
          item: item,
        });
      }
    });
  });

  return {
    skillRequirements,
    loyaltyRequirements,
    itemRequirements,
    moduleRequirements,
  };
};

// Setting the category for the items. This is the only part in the
// whole process that will need to be done manually going forward
// because I choose the categories

export const parseCategory = (itemName) => {
  if (VALUABLE_ITEMS.find((item) => itemName.includes(item))) {
    return "valuable_items";
  }
  if (HARDWARE_ITEMS.find((item) => itemName.includes(item))) {
    return "hardware_items";
  }

  if (MEDICAL_ITEMS.find((item) => itemName.includes(item))) {
    return "medical_items";
  }
  if (ELECTRONIC_ITEMS.find((item) => itemName.includes(item))) {
    return "electronic_items";
  }

  console.log(itemName, "not found");
};

/**

verifyItem makes sure that the text content of each individual item doesn't contain any
of the following strings.

 */

export const verifyItem = (item) => {
  return (
    !item.textContent.includes("Level") &&
    !item.textContent.includes("LL") &&
    !item.textContent.includes("Purchase of EFT Standard Edition") &&
    !item.textContent.includes("Purchase of EFT Left Behind") &&
    !item.textContent.includes("Purchase of EFT Prepare for Escape") &&
    !item.textContent.includes("Purchase of EFT Edge of Darkness") &&
    !item.textContent.includes("Or")
  );
};

// We can distinguish traders by LL in the text content
export const verifyTrader = (item) => {
  return item.textContent.includes("LL");
};
// We can distinguish skills by Level in the text content
export const verifySkill = (item) => {
  return item.textContent.split(" ")[1] === "Level";
};
// We can distinguish modules by Level in the text content
export const verifyModule = (item) => {
  return item.textContent.split(" ")[0] === "Level";
};

export const createCategories = (items, modules) => {
  const array = [];

  items.forEach((item) => {
    let count = 0;
    modules.forEach((innerItem) => {
      innerItem.item_requirements.forEach((innerInnerItem) => {
        if (innerInnerItem.item === item) {
          count += innerInnerItem.need;
        }
      });
    });

    array.push({
      priority: false,
      remaining: count,
      total: count,
      item: item,
    });
  });

  return array;
};

export const sortUnique = (items) => [...new Set(items)].sort((a, b) => a - b);
