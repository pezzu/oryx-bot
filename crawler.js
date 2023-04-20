import * as dotenv from "dotenv";
dotenv.config();
import { connect, disconnect } from "./db.js";
import { fetchWebPage, parseLossesPage } from "./oryx.js";
import { save } from "./model.js";

async function main() {
  const html = await fetchWebPage(process.argv[2]);
  const parsed = parseLossesPage(html);

  await connect(process.env["MONGODB_URL"]);

  await save({...parsed, timestamp: new Date()});

  await disconnect();
}

main();
