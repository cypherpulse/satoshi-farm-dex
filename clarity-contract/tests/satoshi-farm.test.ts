import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { deployer, alice, bob } from "./helpers";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

describe("SatoshiFarm contract", () => {
  it("should list an item successfully", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Apples"),
        Cl.stringAscii("Fresh red apples"),
        Cl.uint(1000000), // 1 STX in microSTX
        Cl.uint(10)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should fail to list item with zero price", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Apples"),
        Cl.stringAscii("Fresh red apples"),
        Cl.uint(0),
        Cl.uint(10)
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  it("should fail to list item with zero quantity", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Apples"),
        Cl.stringAscii("Fresh red apples"),
        Cl.uint(1000000),
        Cl.uint(0)
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  it("should buy an item successfully", () => {
    // First list an item
    simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Apples"),
        Cl.stringAscii("Fresh red apples"),
        Cl.uint(1000000),
        Cl.uint(5)
      ],
      deployer
    );

    // Buy 2 apples
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "buy-item",
      [Cl.uint(1), Cl.uint(2)],
      alice
    );
    expect(result).toBeOk(Cl.bool(true));

    // Check seller sats
    const sellerSats = simnet.callReadOnlyFn(
      "satoshi-farm",
      "get-seller-sats",
      [Cl.principal(deployer)],
      deployer
    );
    expect(sellerSats.result).toBeUint(2000000); // 2 * 1 STX
  });

  it("should fail to buy non-existent item", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "buy-item",
      [Cl.uint(999), Cl.uint(1)],
      alice
    );
    expect(result).toBeErr(Cl.uint(102));
  });

  it("should fail to buy more than available quantity", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Oranges"),
        Cl.stringAscii("Juicy oranges"),
        Cl.uint(100000),
        Cl.uint(5)
      ],
      deployer
    );
    const itemId = result.value;

    // Buy 3
    simnet.callPublicFn(
      "satoshi-farm",
      "buy-item",
      [itemId, Cl.uint(3)],
      alice
    );

    // Try to buy 3 more
    const { result: buyResult } = simnet.callPublicFn(
      "satoshi-farm",
      "buy-item",
      [itemId, Cl.uint(3)],
      alice
    );
    expect(buyResult).toBeErr(Cl.uint(103));
  });

  it("should deactivate item when quantity reaches zero", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Bananas"),
        Cl.stringAscii("Yellow bananas"),
        Cl.uint(200000),
        Cl.uint(1)
      ],
      deployer
    );
    const itemId = result.value;

    // Buy the only one
    simnet.callPublicFn(
      "satoshi-farm",
      "buy-item",
      [itemId, Cl.uint(1)],
      alice
    );

    // Check item is inactive
    const item = simnet.callReadOnlyFn(
      "satoshi-farm",
      "get-item",
      [itemId],
      deployer
    );
    expect(item.result).toBeSome(
      Cl.tuple({
        name: Cl.stringAscii("Bananas"),
        description: Cl.stringAscii("Yellow bananas"),
        price: Cl.uint(200000),
        quantity: Cl.uint(0),
        seller: Cl.principal(deployer),
        active: Cl.bool(false)
      })
    );
  });

  it("should harvest sats successfully", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Tomatoes"),
        Cl.stringAscii("Red tomatoes"),
        Cl.uint(100000),
        Cl.uint(3)
      ],
      deployer
    );
    const itemId = result.value;

    simnet.callPublicFn(
      "satoshi-farm",
      "buy-item",
      [itemId, Cl.uint(3)],
      alice
    );

    // Harvest
    const { result: harvestResult } = simnet.callPublicFn(
      "satoshi-farm",
      "harvest-sats",
      [],
      deployer
    );
    expect(harvestResult).toBeOk(Cl.uint(300000));

    // Check sats reset to 0
    const sellerSats = simnet.callReadOnlyFn(
      "satoshi-farm",
      "get-seller-sats",
      [Cl.principal(deployer)],
      deployer
    );
    expect(sellerSats.result).toBeUint(0);
  });

  it("should fail to harvest with no sats", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "harvest-sats",
      [],
      bob
    );
    expect(result).toBeErr(Cl.uint(104));
  });

  it("should get next item id", () => {
    // List 4 items
    for (let i = 0; i < 4; i++) {
      simnet.callPublicFn(
        "satoshi-farm",
        "list-item",
        [
          Cl.stringAscii("Item" + i),
          Cl.stringAscii("Desc" + i),
          Cl.uint(100000),
          Cl.uint(1)
        ],
        deployer
      );
    }
    const result = simnet.callReadOnlyFn(
      "satoshi-farm",
      "get-next-item-id",
      [],
      deployer
    );
    expect(result.result).toBeUint(5);
  });

  it("should get item details", () => {
    const { result } = simnet.callPublicFn(
      "satoshi-farm",
      "list-item",
      [
        Cl.stringAscii("Apples"),
        Cl.stringAscii("Fresh apples"),
        Cl.uint(150000),
        Cl.uint(10)
      ],
      deployer
    );
    const itemId = result.value;

    const item = simnet.callReadOnlyFn(
      "satoshi-farm",
      "get-item",
      [itemId],
      deployer
    );
    expect(item.result).toBeSome(
      Cl.tuple({
        name: Cl.stringAscii("Apples"),
        description: Cl.stringAscii("Fresh apples"),
        price: Cl.uint(150000),
        quantity: Cl.uint(10),
        seller: Cl.principal(deployer),
        active: Cl.bool(true)
      })
    );
  });

  it("should return none for non-existent item", () => {
    const item = simnet.callReadOnlyFn(
      "satoshi-farm",
      "get-item",
      [Cl.uint(999)],
      deployer
    );
    expect(item.result).toBeNone();
  });
});