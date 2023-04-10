import { expect, it, describe } from "vitest";
import { readFile } from "fs/promises";
import { parseLosesPage, parseCategoryTitle, parseSpecificType } from "./html.js";

describe("HTML parser for Oryxshop", () => {
  it("should parse the HTML", async () => {
    const html = await readFile("./test-data/Oryx.htm", "utf-8");
    expect(parseLosesPage(html)).toEqual({
      list: "Russia",
      total: 10005,
      destroyed: 6473,
      damaged: 304,
      abandoned: 394,
      captured: 2834,
      categories: [
        {
          name: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
          total: 44,
          destroyed: 30,
          damaged: 4,
          abandoned: 1,
          captured: 9,
          types: [
            { type: "KamAZ-63968 Typhoon", amount: 22 },
            { type: "KamAZ-435029 Patrol-A", amount: 2 },
            { type: "K-53949 Typhoon-K", amount: 8 },
            { type: "K-53949 Linza", amount: 12 },
          ],
        },
        {
          name: "Infantry Mobility Vehicles",
          total: 189,
          destroyed: 131,
          damaged: 4,
          abandoned: 1,
          captured: 53,
          types: [
            { type: "BPM-97 Vystrel", amount: 4 },
            { type: "GAZ Tigr", amount: 14 },
            { type: "GAZ Tigr-M", amount: 136 },
            { type: "AMN-590951", amount: 3 },
            { type: "Iveco LMV Rys", amount: 31 },
            { type: "GAZ-3937 Vodnik", amount: 1 },
          ],
        },
      ],
    });
  });
});

describe("Category title parser", () => {
  it("should parse the category title", () => {
    expect(
      parseCategoryTitle(
        "Mine-Resistant Ambush Protected (44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      name: "Mine-Resistant Ambush Protected",
      total: 44,
      destroyed: 30,
      damaged: 4,
      abandoned: 1,
      captured: 9,
    });
  });

  it("should handle brackets in the category title correctly", () => {
    expect(
      parseCategoryTitle(
        "Mine-Resistant Ambush Protected (MRAP) Vehicles (44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      name: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
      total: 44,
      destroyed: 30,
      damaged: 4,
      abandoned: 1,
      captured: 9,
    });
  });

  it("should handle spaces in the category title correctly", () => {
    expect(
      parseCategoryTitle(
        "Mine-Resistant Ambush Protected( 44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      name: "Mine-Resistant Ambush Protected",
      total: 44,
      destroyed: 30,
      damaged: 4,
      abandoned: 1,
      captured: 9,
    });

    expect(
      parseCategoryTitle(
        " Mine-Resistant Ambush Protected ( 44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      name: "Mine-Resistant Ambush Protected",
      total: 44,
      destroyed: 30,
      damaged: 4,
      abandoned: 1,
      captured: 9,
    });

    expect(
        parseCategoryTitle(
          "Mine-Resistant Ambush Protected (44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9 ) "
        )
      ).toEqual({
        name: "Mine-Resistant Ambush Protected",
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      });
  });

  it("should return 0 if certain lose type is absent is the title", () => {
    expect(
      parseCategoryTitle(
        "Mine-Resistant Ambush Protected (MRAP) Vehicles (44, of which destroyed: 30, damaged: 4, abandoned: 1)"
      )
    ).toEqual({
      name: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
      total: 44,
      destroyed: 30,
      damaged: 4,
      abandoned: 1,
      captured: 0,
    });
  });

  it("should handle losses types regardless of their order in the title", () => {
    expect(
      parseCategoryTitle(
        "Mine-Resistant Ambush Protected (MRAP) Vehicles (44, of which captured: 9, damaged: 4, abandoned: 1, destroyed: 30)"
      )
    ).toEqual({
      name: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
      total: 44,
      destroyed: 30,
      damaged: 4,
      abandoned: 1,
      captured: 9,
    });
  });
});

describe("Category subtypes parser", () => {
  it("should parse the category subtypes", () => {
    expect(parseSpecificType("4 BPM-97 Vystrel:")).toEqual({ type: "BPM-97 Vystrel", amount: 4 });
  });

  it("should parse the category subtypes without colon at the end", () => {
    expect(parseSpecificType("4 BPM-97 Vystrel")).toEqual({ type: "BPM-97 Vystrel", amount: 4 });
  });

  it("should trim spaces in the type name", () => {
    expect(parseSpecificType("4 BPM-97 Vystrel: ")).toEqual({ type: "BPM-97 Vystrel", amount: 4 });
    expect(parseSpecificType("4 BPM-97 Vystrel : ")).toEqual({ type: "BPM-97 Vystrel", amount: 4 });
    expect(parseSpecificType("4 BPM-97 Vystrel :")).toEqual({ type: "BPM-97 Vystrel", amount: 4 });
    expect(parseSpecificType(" 4 BPM-97 Vystrel:")).toEqual({ type: "BPM-97 Vystrel", amount: 4 });
  });
});
