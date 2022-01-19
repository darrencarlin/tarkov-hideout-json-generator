import fs from "fs";
import got from "got";
import jsdom from "jsdom";
import { createTraders, parseRequirements } from "./functions.js";
import VALUABLE_ITEMS from "./data/categories/valuable.js";
import ELECTRONIC_ITEMS from "./data/categories/electronic.js";
import MEDICAL_ITEMS from "./data/categories/medical.js";
import HARDWARE_ITEMS from "./data/categories/hardware.js";

const { JSDOM } = jsdom;

const createHideoutJSONfile = async (version, includeChristmasTree) => {
  // Getting the data from the wiki

  const wiki = "https://escapefromtarkov.fandom.com/wiki/Hideout";
  const response = await got(wiki);
  const dom = new JSDOM(response.body);
  // Create an Array out of the HTML Elements for filtering using spread syntax.
  const nodeList = Array.from(
    dom.window.document.querySelectorAll(".wikitable:not(.sortable)")
  );

  // console.log(JSON.stringify(nodeList));
  // Hideout schema

  let hideout = {
    percentage: 0,
    valuable_items: [],
    medical_items: [],
    electronic_items: [],
    hardware_items: [],
    hideout_version: version,
    modules: [],
  };

  const items = [];
  const traders = [];
  const modules = [];
  const skills = [];

  nodeList.forEach((node) => {
    // First we write the items (without amounts, commas, traders, modules etc)
    const allItems = Array.from(
      node.querySelectorAll("tbody > tr:nth-child(n+3) > td:nth-child(2) li")
    );

    allItems.forEach((item) => {
      if (
        !item.textContent.includes("Level") &&
        !item.textContent.includes("LL") &&
        !item.textContent.includes("Purchase of EFT Standard Edition") &&
        !item.textContent.includes("Purchase of EFT Left Behind") &&
        !item.textContent.includes("Purchase of EFT Prepare for Escape") &&
        !item.textContent.includes("Purchase of EFT Edge of Darkness") &&
        !item.textContent.includes("Or") &&
        !item.textContent.includes("Metal Spare Parts")
      ) {
        items.push(
          item.textContent
            .replace(", ", "")
            .split(/(?<=^\S+)\s/)[1]
            .trim()
        );
      }
    });

    // creating a traders js file
    allItems.forEach((item) => {
      if (item.textContent.includes("LL")) {
        traders.push(item.textContent.split(/(?<=^\S+)\s/)[0].trim());
      }
    });

    // creating a skills js file
    allItems.forEach((item) => {
      if (item.textContent.split(" ")[1] === "Level") {
        skills.push(item.textContent.split(" ")[0].trim());
      }
    });

    // creating a modules js file
    allItems.forEach((item) => {
      if (item.textContent.split(" ")[0] === "Level") {
        modules.push(item.textContent.split(/(\d)/)[2].trim());
      }
    });

    // Then we write the requirements

    const title = node.querySelector("tbody > tr:nth-child(1) > th");

    const requirements = node.querySelectorAll("tbody > tr:nth-child(n+3)");

    requirements.forEach((data) => {
      const level = data.querySelector("th:first-of-type");

      const requirements = data
        .querySelector("td:first-of-type")
        .textContent.split(/\r?\n/)
        .filter(Boolean);

      hideout.modules.push({
        module: title?.textContent.trim(),
        level: level?.textContent.trim(),
        complete: false,
        skill_requirements: parseRequirements(requirements).skillRequirements,
        item_requirements: parseRequirements(requirements).itemRequirements,
        module_requirements: parseRequirements(requirements).moduleRequirements,
        loyalty_requirements:
          parseRequirements(requirements).loyaltyRequirements,
      });
    });
  });

  const sortedUniqueItems = [...new Set(items)].sort((a, b) => a - b);
  const sortedUniqueTraders = [...new Set(traders)].sort((a, b) => a - b);
  const sortedUniqueSkills = [...new Set(skills)].sort((a, b) => a - b);
  const sortedUniqueModules = [...new Set(modules)].sort((a, b) => a - b);

  try {
    fs.writeFileSync(
      "./data/items.js",
      `export default ${JSON.stringify(sortedUniqueItems)}`
    );

    fs.writeFileSync(
      "./data/loyalty.js",
      `export default ${JSON.stringify(sortedUniqueTraders)}`
    );

    fs.writeFileSync(
      "./data/skills.js",
      `export default ${JSON.stringify(sortedUniqueSkills)}`
    );

    fs.writeFileSync(
      "./data/modules.js",
      `export default ${JSON.stringify(sortedUniqueModules)}`
    );

    console.log("JS file(s) written succcesfully");
  } catch (err) {
    console.error(err);
  }

  // Set the category arrays

  VALUABLE_ITEMS.forEach((item) => {
    let count = 0;
    hideout.modules.forEach((innerItem) => {
      innerItem.item_requirements.forEach((innerInnerItem) => {
        if (innerInnerItem.item === item) {
          count += innerInnerItem.need;
        }
      });
    });

    hideout.valuable_items.push({
      priority: false,
      remaining: count,
      total: count,
      item: item,
    });
  });

  ELECTRONIC_ITEMS.forEach((item) => {
    let count = 0;
    hideout.modules.forEach((innerItem) => {
      innerItem.item_requirements.forEach((innerInnerItem) => {
        if (innerInnerItem.item === item) {
          count += innerInnerItem.need;
        }
      });
    });

    hideout.electronic_items.push({
      priority: false,
      remaining: count,
      total: count,
      item: item,
    });
  });

  MEDICAL_ITEMS.forEach((item) => {
    let count = 0;
    hideout.modules.forEach((innerItem) => {
      innerItem.item_requirements.forEach((innerInnerItem) => {
        if (innerInnerItem.item === item) {
          count += innerInnerItem.need;
        }
      });
    });

    hideout.medical_items.push({
      priority: false,
      remaining: count,
      total: count,
      item: item,
    });
  });

  HARDWARE_ITEMS.forEach((item) => {
    let count = 0;
    hideout.modules.forEach((innerItem) => {
      innerItem.item_requirements.forEach((innerInnerItem) => {
        if (innerInnerItem.item === item) {
          count += innerInnerItem.need;
        }
      });
    });

    hideout.hardware_items.push({
      priority: false,
      remaining: count,
      total: count,
      item: item,
    });
  });

  // CLEAN UP MODULE NAMES

  hideout.modules.forEach((item) => {
    if (item.module.includes("filter absorber")) {
      item.module = "Air Filtering Unit";
    }
    if (item.module.includes("Water filter")) {
      item.module = "Water collector";
    }
    if (item.module.includes("christmas")) {
      item.module = "Christmas tree";
    }
  });

  if (!includeChristmasTree) {
    hideout.modules.pop();
  }

  // Create the JSON file
  try {
    fs.writeFileSync("hideout.json", JSON.stringify(hideout));
    console.log("JSON file written succcesfully");
  } catch (err) {
    console.error(err);
  }
};

createHideoutJSONfile("12.12", false);
