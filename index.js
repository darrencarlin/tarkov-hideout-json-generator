import chalk from "chalk";
import fs from "fs";
import got from "got";
import jsdom from "jsdom";
import inquirer from "inquirer";
import ELECTRONIC_ITEMS from "./data/categories/electronic.js";
import HARDWARE_ITEMS from "./data/categories/hardware.js";
import MEDICAL_ITEMS from "./data/categories/medical.js";
import VALUABLE_ITEMS from "./data/categories/valuable.js";
import {
  createCategories,
  parseRequirements,
  sortUnique,
  verifyCategories,
  verifyItem,
  verifyModule,
  verifySkill,
  verifyTrader,
} from "./functions.js";

const { JSDOM } = jsdom;
// TODO:
// Track unnaccounted for items (useful for future versions with new items)

let version;
let includeChristmasTree;

var questions = [
  {
    type: "input",
    name: "version",
    message: "What is the version of the game?",
  },
  {
    type: "input",
    name: "includeChristmasTree",
    message: "Do you want to include the christmas tree? y/n",
  },
];

inquirer
  .prompt(questions)
  .then((answers) => {
    version = answers["version"];
    answers["includeChristmasTree"] === "y"
      ? (includeChristmasTree = true)
      : (includeChristmasTree = false);
  })
  .then(() => createHideoutJSONfile(version, includeChristmasTree));

const createHideoutJSONfile = async (version, includeChristmasTree) => {
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
  const notFoundItems = [];

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

      // formatting the item names
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

      // if the item from the site doesn't match any of the expected formats, we add it to the notFoundItems array
      const notFound =
        !verifiedItem && !verifiedTrader && !verifiedSKill && !verifiedModule;

      if (notFound) {
        notFoundItems.push(item.textContent);
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

      notFoundItems.push(...parsedRequirements.notFoundItems);
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

  // filter out christmas tree

  if (!includeChristmasTree) {
    hideout.modules.pop();

    hideout.valuable_items = hideout.valuable_items.filter(
      (item) =>
        // filter items that include christmas in their name
        !item.item.includes("Christmas")
    );
  }

  // filter out stash level 1
  hideout.modules = hideout.modules.filter(
    (item) => !(item.module === "Stash" && item.level === "1")
  );

  // Create the JSON file
  try {
    fs.writeFileSync("./data/hideout.json", JSON.stringify(hideout));
    console.log(chalk.green("JSON file written succcesfully ✓"));
  } catch (err) {
    console.error(err);
  }

  const history = {
    hideout_version: version,
    date: new Date().toLocaleDateString(),
    items: sortedUniqueItems.length,
    traders: sortedUniqueTraders.length,
    skills: sortedUniqueSkills.length,
    modules: sortedUniqueModules.length,
  };

  // Append to history
  try {
    const data = fs.readFileSync("./data/history.json");
    const parsedData = JSON.parse(data);
    parsedData.push(history);
    fs.writeFileSync("./data/history.json", JSON.stringify(parsedData));
    console.log(chalk.green("History file written succcesfully ✓"));
  } catch (err) {
    console.error(err);
  }

  verifyCategories(hideout.modules);

  if (notFoundItems.length) {
    console.log("The following items were not found:");
    notFoundItems.forEach((item) => {
      console.log(chalk.red(item));
    });
  }
};
