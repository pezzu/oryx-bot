import * as cheerio from "cheerio";

export async function page(url) {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to fetch web page");
  }
  const html = await response.text();
  return html;
}

export function parse(html) {
  const $ = cheerio.load(html);
  const results = [];
  const h3Headers = $("h3");
  h3Headers.each((index, h3Element) => {
    const category = $(h3Element).text();
    const types = [];
    $(h3Element)
      .next("ul")
      .find("li")
      .each((index, liElement) => {
        const liText = $(liElement).clone().children().remove("a").end().text().trim();
        types.push(liText);
      });
    const result = {
      category,
      types,
    };
    results.push(result);
  });
  return results;
}
