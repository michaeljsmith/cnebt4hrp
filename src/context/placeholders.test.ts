import { expect } from "chai";
import { newContext } from "./context.js";
import {
  findPlaceholderIndex,
  introducePlaceholder,
  placeholderSolution,
  solvePlaceholder,
} from "./placeholders.js";
import { Void } from "../types/type.js";

describe("placeholders", function () {
  it("finds placeholder", function () {
    const context = newContext();
    introducePlaceholder(context, "bar");
    const placeholder = introducePlaceholder(context, "foo");
    expect(findPlaceholderIndex(context, placeholder)).eq(1);
  });

  it("solves placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, Void);
    expect(placeholderSolution(context, placeholder)).eq(Void);
  });
});
