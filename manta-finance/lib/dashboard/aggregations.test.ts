import { describe, it, expect } from "vitest";
import {
  buildSalesByCustomer,
  buildTopProducts,
  buildSalesByCategory,
  type SaleWithItems,
  type ProductSnapshotMap,
} from "./aggregations";

describe("buildSalesByCustomer", () => {
  it("groups sales by customer and sums grandTotal", () => {
    const sales: SaleWithItems[] = [
      { customer: "Alice", grandTotal: 100, paid: 100, balance: 0, status: "Terbayar", items: [] },
      { customer: "Bob", grandTotal: 200, paid: 200, balance: 0, status: "Terbayar", items: [] },
      { customer: "Alice", grandTotal: 150, paid: 150, balance: 0, status: "Terbayar", items: [] },
    ];
    const result = buildSalesByCustomer(sales);
    expect(result).toHaveLength(2);
    const alice = result.find((r) => r.customer === "Alice");
    expect(alice?.total).toBe(250);
    const bob = result.find((r) => r.customer === "Bob");
    expect(bob?.total).toBe(200);
  });

  it("sorts by total descending", () => {
    const sales: SaleWithItems[] = [
      { customer: "Alice", grandTotal: 50, paid: 50, balance: 0, status: "Terbayar", items: [] },
      { customer: "Bob", grandTotal: 300, paid: 300, balance: 0, status: "Terbayar", items: [] },
      { customer: "Carol", grandTotal: 150, paid: 150, balance: 0, status: "Terbayar", items: [] },
    ];
    const result = buildSalesByCustomer(sales);
    expect(result[0].customer).toBe("Bob");
    expect(result[1].customer).toBe("Carol");
    expect(result[2].customer).toBe("Alice");
  });

  it("returns empty array for no sales", () => {
    expect(buildSalesByCustomer([])).toEqual([]);
  });

  it("does not mutate input", () => {
    const sales: SaleWithItems[] = [
      { customer: "A", grandTotal: 100, paid: 100, balance: 0, status: "Terbayar", items: [] },
    ];
    const copy = JSON.stringify(sales);
    buildSalesByCustomer(sales);
    expect(JSON.stringify(sales)).toBe(copy);
  });
});

describe("buildTopProducts", () => {
  const makeItem = (productName: string, qty: number) => ({
    sku: "SKU-001",
    productName,
    qty,
    hppUnit: 10,
    hargaUnit: 20,
    totalHpp: qty * 10,
    totalHarga: qty * 20,
  });

  it("groups by productName and sums qty", () => {
    const sales: SaleWithItems[] = [
      {
        customer: "A", grandTotal: 100, paid: 100, balance: 0, status: "Terbayar",
        items: [makeItem("Widget", 3), makeItem("Gadget", 2)],
      },
      {
        customer: "B", grandTotal: 50, paid: 50, balance: 0, status: "Terbayar",
        items: [makeItem("Widget", 5)],
      },
    ];
    const result = buildTopProducts(sales);
    const widget = result.find((r) => r.productName === "Widget");
    expect(widget?.qty).toBe(8);
    const gadget = result.find((r) => r.productName === "Gadget");
    expect(gadget?.qty).toBe(2);
  });

  it("returns top 10 by qty descending", () => {
    const items = Array.from({ length: 15 }, (_, i) => makeItem(`Product ${i}`, i + 1));
    const sales: SaleWithItems[] = [
      { customer: "A", grandTotal: 100, paid: 100, balance: 0, status: "Terbayar", items },
    ];
    const result = buildTopProducts(sales);
    expect(result).toHaveLength(10);
    expect(result[0].qty).toBe(15); // highest qty first
  });

  it("returns empty array for no items", () => {
    expect(buildTopProducts([])).toEqual([]);
  });
});

describe("buildSalesByCategory", () => {
  const makeItem = (sku: string, productName: string, totalHarga: number) => ({
    sku,
    productName,
    qty: 1,
    hppUnit: 10,
    hargaUnit: totalHarga,
    totalHpp: 10,
    totalHarga,
  });

  it("groups sale items by category using ProductSnapshot map and sums totalHarga", () => {
    const sales: SaleWithItems[] = [
      {
        customer: "A", grandTotal: 300, paid: 300, balance: 0, status: "Terbayar",
        items: [
          makeItem("SKU-A", "Widget A", 100),
          makeItem("SKU-B", "Gadget B", 200),
        ],
      },
    ];
    const snapshotMap: ProductSnapshotMap = new Map([
      ["SKU-A", "Electronics"],
      ["SKU-B", "Electronics"],
    ]);
    const result = buildSalesByCategory(sales, snapshotMap);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("Electronics");
    expect(result[0].total).toBe(300);
  });

  it("uses 'Unknown' category when sku not in snapshot map", () => {
    const sales: SaleWithItems[] = [
      {
        customer: "A", grandTotal: 100, paid: 100, balance: 0, status: "Terbayar",
        items: [makeItem("MISSING-SKU", "Mystery Item", 100)],
      },
    ];
    const snapshotMap: ProductSnapshotMap = new Map();
    const result = buildSalesByCategory(sales, snapshotMap);
    expect(result[0].category).toBe("Unknown");
    expect(result[0].total).toBe(100);
  });

  it("sorts by total descending", () => {
    const sales: SaleWithItems[] = [
      {
        customer: "A", grandTotal: 400, paid: 400, balance: 0, status: "Terbayar",
        items: [
          makeItem("SKU-A", "Widget", 100),
          makeItem("SKU-B", "Gadget", 300),
        ],
      },
    ];
    const snapshotMap: ProductSnapshotMap = new Map([
      ["SKU-A", "Cheap"],
      ["SKU-B", "Premium"],
    ]);
    const result = buildSalesByCategory(sales, snapshotMap);
    expect(result[0].category).toBe("Premium");
    expect(result[1].category).toBe("Cheap");
  });

  it("returns empty array for no sales", () => {
    expect(buildSalesByCategory([], new Map())).toEqual([]);
  });

  it('resolves category code to human-readable name via resolveCategory', () => {
    const sales: SaleWithItems[] = [
      {
        customer: 'A', grandTotal: 100, paid: 100, balance: 0, status: 'Terbayar',
        items: [makeItem('SKU-A', 'Klep Item', 100)],
      },
    ]
    const snapshotMap: ProductSnapshotMap = new Map([['SKU-A', '001']])
    const result = buildSalesByCategory(sales, snapshotMap)
    // After DASH-02 fix, '001' must resolve to 'Klep'
    expect(result[0].category).toBe('Klep')
  })
});
