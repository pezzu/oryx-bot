// import and load dotenv
import * as dotenv from "dotenv";
dotenv.config();
import { connect, disconnect } from "./db.js";
import { page, parseLosesPage } from "./html.js";

async function main() {
  const html = await page("https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html");
  const parsed = parseLosesPage(html);

  console.log(parsed);

  await connect(process.env["MONGODB_URL"]);

  //   for (const parsedItem of parsed) {
  //     const metric = new Metric({
  //       date: new Date(),
  //       category: parsedItem.category,
  //       total: parsedItem.types.length,
  //       types: parsedItem.types.map((type) => ({ type, amount: 1 })),
  //     });
  //     await metric.save();
  //   }

  await disconnect();
}

main();
