import { describe, it, expect } from "vitest";
import { safeRedirect } from "./redirect.js";

describe("safeRedirect", () => {
  it("accepte les chemins internes", () => {
    expect(safeRedirect("/shopping/commande")).toBe("/shopping/commande");
    expect(safeRedirect("/#explorer")).toBe("/#explorer");
  });
  it("refuse les URL externes et valeurs invalides", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined, 42]) {
      expect(safeRedirect(bad)).toBe("/");
    }
  });
  it("utilise le repli donné", () => { expect(safeRedirect("x", "/connexion")).toBe("/connexion"); });
});
