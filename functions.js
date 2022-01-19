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

// Setting the category for the items (this is the only part in the whole process
// that needs to be done manually

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
};

export const createTraders = (items) => {
  let traders = [];
  items.forEach((item) => {
    if (item.textContent.includes("LL")) {
      traders.push(item.textContent.split(/(?<=^\S+)\s/)[0].trim());
    }
  });
  const sortedUniqueTraders = [...new Set(traders)].sort((a, b) => a - b);
  return sortedUniqueTraders;
};
