import * as cheerio from "cheerio";

export async function page(url) {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to fetch web page");
  }
  const html = await response.text();
  return html;
}

export function parseLosesPage(html) {
  const $ = cheerio.load(html);
  const categories = [];
  const title = $("p + h3 + p").prev("h3").text().trim();
  const [list, loses] = title.split(" - ");
  const { total, destroyed, damaged, abandoned, captured } = parseLosesTypes(loses);
  $("h3 + ul").each((index, ulElement) => {
    const category = parseCategoryTitle($(ulElement).prev("h3").text().trim());
    const types = [];
    $(ulElement)
      .find("li")
      .each((index, liElement) => {
        const liText = $(liElement).clone().children().remove("a").end().text().trim();
        const { type, amount } = parseSpecificType(liText);
        types.push({ type, amount });
      });
    const result = {
      ...category,
      types,
    };
    categories.push(result);
  });
  return { list, total, destroyed, damaged, abandoned, captured, categories };
}

export function parseCategoryTitle(title) {
  const regex = /^(.+?) \((\s*\d+.+\d+\s*)\)$/i;
  const match = title.match(regex);

  if (!match) throw new Error(`failed to parse category title ${title}`);

  const name = match[1].trim();
  const { total, destroyed, damaged, abandoned, captured } = parseLosesTypes(match[2]);

  return { name, total, destroyed, damaged, abandoned, captured };
}

export function parseSpecificType(line) {
  const regex = /^(\d+)\s+(.+):$/;
  const match = regex.exec(line);
  if (!match) throw new Error(`failed to parse type \"${line}\"`);

  const amount = parseInt(match[1]);
  const type = match[2].trim();

  return { type, amount };
}

function parseLosesTypes(loses) {
  return {
    total: parseInt(loses.split(",")[0].trim()) || 0,
    destroyed: extractField(loses, "destroyed") || 0,
    damaged: extractField(loses, "damaged") || 0,
    abandoned: extractField(loses, "abandoned") || 0,
    captured: extractField(loses, "captured") || 0,
  };
}

function extractField(line, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*(\\d+)`, "i");
  const match = regex.exec(line);
  if (!match) return null;
  return parseInt(match[1]);
}
