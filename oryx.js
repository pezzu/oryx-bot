// import and load dotenv
import * as dotenv from "dotenv";
dotenv.config();
import { connect, disconnect } from "./db.js";
import { fetchWebPage, parseLosesPage } from "./html.js";
import { save } from "./model.js";

async function main() {
  const html = await fetchWebPage(process.argv[2]);
  const parsed = parseLosesPage(html);

//   console.log(JSON.stringify(parsed, null, 2));

  await connect(process.env["MONGODB_URL"]);

  await save({...parsed, timestamp: new Date()});

  await disconnect();
}

main();
