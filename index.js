import fs from "fs";
import got from "got";
import jsdom from "jsdom";
import chalk from "chalk";
import {
  createCategories,
  parseRequirements,
  sortUnique,
  verifyItem,
  verifyModule,
  verifySkill,
  verifyTrader,
} from "./functions.js";
import VALUABLE_ITEMS from "./data/categories/valuable.js";
import ELECTRONIC_ITEMS from "./data/categories/electronic.js";
import MEDICAL_ITEMS from "./data/categories/medical.js";
import HARDWARE_ITEMS from "./data/categories/hardware.js";

const { JSDOM } = jsdom;

// TODO:

// Track unnaccounted for items (useful for future versions with new items)

const createHideoutJSONfile = async (version = 12.12, includeChristmasTree) => {
  // Getting the data from the wiki
  const url = "https://escapefromtarkov.fandom.com/wiki/Hideout";
  const response = await got(url);
  const dom = new JSDOM(response.body);
  // Create an Array out of the HTML Elements for filtering.
  const nodeList = Array.from(
    dom.window.document.querySelectorAll(".wikitable:not(.sortable)")
  );

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
      const verifiedItem = verifyItem(item);
      const verifiedTrader = verifyTrader(item);
      const verifiedSKill = verifySkill(item);
      const verifiedModule = verifyModule(item);

      const notFound =
        !verifiedItem && !verifiedTrader && !verifiedSKill && !verifiedModule;

      if (verifiedItem) {
        // e.g "395,000 Roubles" => "Roubles"
        items.push(
          item.textContent
            .replace(", ", "") // Remove commas from currency values
            .split(/(?<=^\S+)\s/)[1] // Split the text at the first space
            .trim() // Trim the text
        );
      }

      if (verifiedTrader) {
        // e.g "Ragman LL3" => "Ragman"
        traders.push(item.textContent.split(/(?<=^\S+)\s/)[0].trim());
      }

      if (verifiedSKill) {
        // e.g "Metabolism Level 3" => "Metabolism"
        skills.push(item.textContent.split(" ")[0].trim());
      }

      if (verifiedModule) {
        // e.g "Level 2 Stash" => "Stash"
        modules.push(item.textContent.split(/(\d)/)[2].trim()); // Split the text on the first digit
      }

      if (notFound) {
        console.log(item.textContent, ": not found");
      }
    });

    // Then we write the requirements
    const title = node
      .querySelector("tbody > tr:nth-child(1) > th")
      .textContent.trim();

    const requirements = node.querySelectorAll("tbody > tr:nth-child(n+3)");

    requirements.forEach((data) => {
      const level = data.querySelector("th:first-of-type").textContent.trim();

      const requirements = data
        .querySelector("td:first-of-type")
        .textContent.split(/\r?\n/) // Split on newlines
        .filter(Boolean); // Filter out empty data

      const parsedRequirements = parseRequirements(requirements);

      hideout.modules.push({
        module: title,
        level: level,
        complete: false,
        skill_requirements: parsedRequirements.skillRequirements,
        item_requirements: parsedRequirements.itemRequirements,
        module_requirements: parsedRequirements.moduleRequirements,
        loyalty_requirements: parsedRequirements.loyaltyRequirements,
      });
    });
  });

  const sortedUniqueItems = sortUnique(items);
  const sortedUniqueTraders = sortUnique(traders);
  const sortedUniqueSkills = sortUnique(skills);
  const sortedUniqueModules = sortUnique(modules);

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
    console.log(chalk.blue(`Found ${sortedUniqueItems.length} unique items`));
    console.log(
      chalk.blue(`Found ${sortedUniqueTraders.length} unique traders`)
    );
    console.log(chalk.blue(`Found ${sortedUniqueSkills.length} unique skills`));
    console.log(
      chalk.blue(`Found ${sortedUniqueModules.length} unique modules`)
    );

    console.log(chalk.green("JS file(s) written succcesfully ✓"));
  } catch (err) {
    console.error(err);
  }

  // Set the category arrays after we have written the JS files above

  hideout.valuable_items = createCategories(VALUABLE_ITEMS, hideout.modules);
  hideout.electronic_items = createCategories(
    ELECTRONIC_ITEMS,
    hideout.modules
  );
  hideout.medical_items = createCategories(MEDICAL_ITEMS, hideout.modules);
  hideout.hardware_items = createCategories(HARDWARE_ITEMS, hideout.modules);

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
    fs.writeFileSync("./data/hideout.json", JSON.stringify(hideout));
    console.log(chalk.green("JSON file written succcesfully ✓"));
  } catch (err) {
    console.error(err);
  }
};

createHideoutJSONfile("12.12", true);
