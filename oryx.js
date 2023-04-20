import * as cheerio from "cheerio";

export async function fetchWebPage(url) {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to fetch web page");
  }
  const html = await response.text();
  return html;
}

export function parseLossesPage(html) {
  const $ = cheerio.load(html);
  const types = [];
  const title = $('p + h3 span[style="color: red;"]').text().trim();
  const [list, lossesLine] = title.split(" - ");
  const totalLosses = parseLossesTypes(lossesLine);
  $("h3 + ul").each((index, ulElement) => {
    const {type, losses: typeLosses } = parseTypeTitle($(ulElement).prev("h3").text().trim());
    const models = [];
    $(ulElement)
      .find("li")
      .each((index, liElement) => {
        const liText = $(liElement).clone().find("a").remove().end().text().trim();
        const { model, amount } = parseModel(liText);
        models.push({ model, amount });
      });
    const result = {
      type,
      losses: typeLosses,
      models,
    };
    types.push(result);
  });
  return { list, losses: totalLosses, types };
}

export function parseTypeTitle(title) {
  const regex = /^(.+?)\s*\((\s*\d+.+\d+\s*)\)\s*$/i;
  const match = title.match(regex);

  if (!match) throw new Error(`Failed to parse type title ${title}`);

  const type = match[1].trim();
  const losses = parseLossesTypes(match[2]);

  return { type, losses };
}

export function parseModel(line) {
  const regex = /^\s*(\d+)\s+(.+)$/;
  const match = regex.exec(line);
  if (!match) throw new Error(`failed to parse type \"${line}\"`);

  const amount = parseInt(match[1]);
  const model = match[2].replaceAll(String.fromCharCode(0xa0), " ").replace(/[\s\:]+$/, "");

  return { model, amount };
}

function parseLossesTypes(loses) {
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
