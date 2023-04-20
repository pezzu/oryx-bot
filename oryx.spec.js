import { expect, it, describe } from "vitest";
import { readFile } from "fs/promises";
import { parseLossesPage, parseTypeTitle, parseModel } from "./oryx.js";

describe("HTML parser for Oryx/Losses pages", () => {
  it("should parse the HTML of losses page", async () => {
    const html = await readFile("./test-data/Oryx.htm", "utf-8");
    expect(parseLossesPage(html)).toEqual({
      list: "Russia",
      losses: {
        total: 10005,
        destroyed: 6473,
        damaged: 304,
        abandoned: 394,
        captured: 2834,
      },
      types: [
        {
          type: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
          losses: {
            total: 44,
            destroyed: 30,
            damaged: 4,
            abandoned: 1,
            captured: 9,
          },
          models: [
            { model: "KamAZ-63968 Typhoon", amount: 22 },
            { model: "KamAZ-435029 Patrol-A", amount: 2 },
            { model: "K-53949 Typhoon-K", amount: 8 },
            { model: "K-53949 Linza", amount: 12 },
          ],
        },
        {
          type: "Infantry Mobility Vehicles",
          losses: {
            total: 189,
            destroyed: 131,
            damaged: 4,
            abandoned: 1,
            captured: 53,
          },
          models: [
            { model: "BPM-97 Vystrel", amount: 4 },
            { model: "GAZ Tigr", amount: 14 },
            { model: "GAZ Tigr-M", amount: 136 },
            { model: "AMN-590951", amount: 3 },
            { model: "Iveco LMV Rys", amount: 31 },
            { model: "GAZ-3937 Vodnik", amount: 1 },
          ],
        },
      ],
    });
  });

  it("should treat nested span elements in the specific type correctly", async () => {
    const html = await readFile("./test-data/span-in-links-list.html", "utf-8");
    expect(parseLossesPage(html)).toEqual({
      list: "Russia",
      losses: {
        total: 10018,
        destroyed: 6486,
        damaged: 305,
        abandoned: 394,
        captured: 2833,
      },
      types: [
        {
          type: "Multiple Rocket Launchers",
          losses: {
            total: 192,
            destroyed: 130,
            damaged: 5,
            abandoned: 2,
            captured: 55,
          },
          models: [
            { model: "122mm BM-21 Grad", amount: 113 },
            { model: "122mm 9P138 Grad-1", amount: 3 },
            { model: "122mm 2B26 Grad-K", amount: 1 },
            { model: "220mm BM-27 Uragan", amount: 53 },
            { model: "300mm BM-30 Smerch", amount: 1 },
            { model: "122mm 2B17 Tornado-G", amount: 13 },
            { model: "220mm TOS-1A", amount: 6 },
            { model: "Unknown MRL", amount: 2 },
          ],
        },
      ],
    });
  });

  it("should handle nbsp in the type name correctly", async () => {
    const html = await readFile("./test-data/nbsp-in-type-name.html", "utf-8");
    expect(parseLossesPage(html)).toEqual({
      list: "Russia",
      losses: {
        total: 10018,
        destroyed: 6486,
        damaged: 305,
        abandoned: 394,
        captured: 2833,
      },
      types: [
        {
          type: "Aircraft",
          losses: {
            total: 79,
            destroyed: 71,
            damaged: 8,
            abandoned: 0,
            captured: 0,
          },
          models: [
            { model: "MiG-31BM fighter aircraft", amount: 1 },
            { model: "Su-27 multirole aircraft", amount: 1 },
            { model: "Su-30SM multirole aircraft", amount: 11 },
          ],
        },
      ],
    });
  });

  it("should handle span elements in the type name correctly", async () => {
    const html = await readFile("./test-data/span-in-type-name.html", "utf-8");
    expect(parseLossesPage(html)).toEqual({
      list: "Russia",
      losses: {
        total: 10018,
        destroyed: 6486,
        damaged: 305,
        abandoned: 394,
        captured: 2833,
      },
      types: [
        {
          type: "Trucks, Vehicles and Jeeps",
          losses: {
            total: 2409,
            destroyed: 1761,
            damaged: 38,
            abandoned: 48,
            captured: 562,
          },
          models: [
            { model: "UAZ-31514", amount: 1 },
            { model: "UAZ-23632 pickup truck", amount: 4 },
            { model: "UAZ-23632-148-64 armed pickup truck", amount: 6 },
            { model: "UAZ-394511 ‘Esaul’", amount: 5 },
          ],
        },
      ],
    });
  });

  it("should handle span elements in the list title correctly", async () => {
    const html = await readFile("./test-data/span-in-list-title.html", "utf-8");
    expect(parseLossesPage(html)).toEqual({
      list: "Ukraine",
      losses: {
        total: 3153,
        destroyed: 2025,
        damaged: 175,
        abandoned: 89,
        captured: 864,
      },
      types: [
        {
          type: "Tanks",
          losses: {
            total: 479,
            destroyed: 292,
            damaged: 28,
            abandoned: 19,
            captured: 140,
          },
          models: [
            { model: "T-64A", amount: 2 },
            { model: "T-64B", amount: 2 },
            { model: "T-64BVK", amount: 1 },
          ],
        },
      ],
    });
  });
});

describe("Category title parser", () => {
  it("should parse the category title", () => {
    expect(
      parseTypeTitle(
        "Mine-Resistant Ambush Protected (44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      },
    });
  });

  it("should handle brackets in the category title correctly", () => {
    expect(
      parseTypeTitle(
        "Mine-Resistant Ambush Protected (MRAP) Vehicles (44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      },
    });
  });

  it("should handle spaces in the category title correctly", () => {
    expect(
      parseTypeTitle(
        "Mine-Resistant Ambush Protected( 44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      },
    });

    expect(
      parseTypeTitle(
        " Mine-Resistant Ambush Protected ( 44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9)"
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      },
    });

    expect(
      parseTypeTitle(
        "Mine-Resistant Ambush Protected (44, of which destroyed: 30, damaged: 4, abandoned: 1, captured: 9 ) "
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      },
    });
  });

  it("should return 0 if certain lose type is absent is the title", () => {
    expect(
      parseTypeTitle(
        "Mine-Resistant Ambush Protected (MRAP) Vehicles (44, of which destroyed: 30, damaged: 4, abandoned: 1)"
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 0,
      },
    });
  });

  it("should handle losses types regardless of their order in the title", () => {
    expect(
      parseTypeTitle(
        "Mine-Resistant Ambush Protected (MRAP) Vehicles (44, of which captured: 9, damaged: 4, abandoned: 1, destroyed: 30)"
      )
    ).toEqual({
      type: "Mine-Resistant Ambush Protected (MRAP) Vehicles",
      losses: {
        total: 44,
        destroyed: 30,
        damaged: 4,
        abandoned: 1,
        captured: 9,
      },
    });
  });
});

describe("Category subtypes parser", () => {
  it("should parse the category subtypes", () => {
    expect(parseModel("4 BPM-97 Vystrel:")).toEqual({ model: "BPM-97 Vystrel", amount: 4 });
  });

  it("should parse the category subtypes without colon at the end", () => {
    expect(parseModel("4 BPM-97 Vystrel")).toEqual({ model: "BPM-97 Vystrel", amount: 4 });
  });

  it("should trim spaces in the type name", () => {
    expect(parseModel("4 BPM-97 Vystrel: ")).toEqual({ model: "BPM-97 Vystrel", amount: 4 });
    expect(parseModel("4 BPM-97 Vystrel : ")).toEqual({ model: "BPM-97 Vystrel", amount: 4 });
    expect(parseModel("4 BPM-97 Vystrel :")).toEqual({ model: "BPM-97 Vystrel", amount: 4 });
    expect(parseModel(" 4 BPM-97 Vystrel:")).toEqual({ model: "BPM-97 Vystrel", amount: 4 });
  });
});
