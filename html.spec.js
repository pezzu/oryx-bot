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
            { name: "KamAZ-63968 Typhoon", amount: 22 },
            { name: "KamAZ-435029 Patrol-A", amount: 2 },
            { name: "K-53949 Typhoon-K", amount: 8 },
            { name: "K-53949 Linza", amount: 12 },
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
            { name: "BPM-97 Vystrel", amount: 4 },
            { name: "GAZ Tigr", amount: 14 },
            { name: "GAZ Tigr-M", amount: 136 },
            { name: "AMN-590951", amount: 3 },
            { name: "Iveco LMV Rys", amount: 31 },
            { name: "GAZ-3937 Vodnik", amount: 1 },
          ],
        },
      ],
    });
  });

  it("should treat nested span elements in the specific type correctly", async () => {
    const html = await readFile("./test-data/span-in-links-list.html", "utf-8");
    expect(parseLosesPage(html)).toEqual({
      list: "Russia",
      total: 10018,
      destroyed: 6486,
      damaged: 305,
      abandoned: 394,
      captured: 2833,
      categories: [
        {
          name: "Multiple Rocket Launchers",
          total: 192,
          destroyed: 130,
          damaged: 5,
          abandoned: 2,
          captured: 55,
          types: [
            { name: "122mm BM-21 Grad", amount: 113 },
            { name: "122mm 9P138 Grad-1", amount: 3 },
            { name: "122mm 2B26 Grad-K", amount: 1 },
            { name: "220mm BM-27 Uragan", amount: 53 },
            { name: "300mm BM-30 Smerch", amount: 1 },
            { name: "122mm 2B17 Tornado-G", amount: 13 },
            { name: "220mm TOS-1A", amount: 6 },
            { name: "Unknown MRL", amount: 2 },
          ],
        },
      ],
    });
  });

  it("should handle nbsp in the type name correctly", async () => {
    const html = await readFile("./test-data/nbsp-in-type-name.html", "utf-8");
    expect(parseLosesPage(html)).toEqual({
      list: "Russia",
      total: 10018,
      destroyed: 6486,
      damaged: 305,
      abandoned: 394,
      captured: 2833,
      categories: [
        {
          name: "Aircraft",
          total: 79,
          destroyed: 71,
          damaged: 8,
          abandoned: 0,
          captured: 0,
          types: [
            { name: "MiG-31BM fighter aircraft", amount: 1 },
            { name: "Su-27 multirole aircraft", amount: 1 },
            { name: "Su-30SM multirole aircraft", amount: 11 },
          ],
        },
      ],
    });
  });

  it("should handle span elements in the type name correctly", async () => {
    const html = await readFile("./test-data/span-in-type-name.html", "utf-8");
    expect(parseLosesPage(html)).toEqual({
      list: "Russia",
      total: 10018,
      destroyed: 6486,
      damaged: 305,
      abandoned: 394,
      captured: 2833,
      categories: [
        {
          name: "Trucks, Vehicles and Jeeps",
          total: 2409,
          destroyed: 1761,
          damaged: 38,
          abandoned: 48,
          captured: 562,
          types: [
            { name: "UAZ-31514", amount: 1 },
            { name: "UAZ-23632 pickup truck", amount: 4 },
            { name: "UAZ-23632-148-64 armed pickup truck", amount: 6 },
            { name: "UAZ-394511 ‘Esaul’", amount: 5 },
          ],
        },
      ],
    });
  });

  it("should handle span elements in the list title correctly", async () => {
    const html = await readFile("./test-data/span-in-list-title.html", "utf-8");
    expect(parseLosesPage(html)).toEqual({
      list: "Ukraine",
      total: 3135,
      destroyed: 2025,
      damaged: 175,
      abandoned: 89,
      captured: 864,
      categories: [
        {
          name: "Tanks",
          total: 479,
          destroyed: 292,
          damaged: 28,
          abandoned: 19,
          captured: 140,
          types: [
            { name: "T-64A", amount: 2 },
            { name: "T-64B", amount: 2 },
            { name: "T-64BVK", amount: 1 },
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
    expect(parseSpecificType("4 BPM-97 Vystrel:")).toEqual({ name: "BPM-97 Vystrel", amount: 4 });
  });

  it("should parse the category subtypes without colon at the end", () => {
    expect(parseSpecificType("4 BPM-97 Vystrel")).toEqual({ name: "BPM-97 Vystrel", amount: 4 });
  });

  it("should trim spaces in the type name", () => {
    expect(parseSpecificType("4 BPM-97 Vystrel: ")).toEqual({ name: "BPM-97 Vystrel", amount: 4 });
    expect(parseSpecificType("4 BPM-97 Vystrel : ")).toEqual({ name: "BPM-97 Vystrel", amount: 4 });
    expect(parseSpecificType("4 BPM-97 Vystrel :")).toEqual({ name: "BPM-97 Vystrel", amount: 4 });
    expect(parseSpecificType(" 4 BPM-97 Vystrel:")).toEqual({ name: "BPM-97 Vystrel", amount: 4 });
  });
});
