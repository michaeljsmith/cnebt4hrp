import { expect } from "chai";
import { uniqueTypeId } from "../types/type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  unit,
} from "../types/type.js";
import { applyContext } from "./apply-context.js";
import { newContext } from "./context.js";
import { introducePlaceholder, solvePlaceholder } from "./placeholders.js";

describe("applyContext", function () {
  it("leaves void", function () {
    const context = newContext();
    expect(applyContext(context, unit)).eq(unit);
  });

  it("leaves variable", function () {
    const context = newContext();
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));
    expect(applyContext(context, typeVariable)).eq(typeVariable);
  });

  it("substitutes placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, unit);
    expect(applyContext(context, placeholder)).eq(unit);
  });

  it("leaves unsolved placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    expect(applyContext(context, placeholder)).eq(placeholder);
  });

  it("recursively substitutes placeholder", function () {
    const context = newContext();
    const placeholder1 = introducePlaceholder(context, "foo");
    const placeholder2 = introducePlaceholder(context, "bar");
    solvePlaceholder(context, placeholder1, placeholder2);
    solvePlaceholder(context, placeholder2, unit);
    expect(applyContext(context, placeholder1)).eq(unit);
  });

  it("recurses to forall body", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, unit);
    const forAll = makeForAllType(uniqueTypeId("bar"), placeholder);
    const result = applyContext(context, forAll);
    expect(result.kind === "forall" && result.body).eq(unit);
  });

  it("recurses to function parameter", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, unit);
    const fn = makeFunctionType(placeholder, unit);
    const result = applyContext(context, fn);
    expect(result.kind === "function" && result.parameter).eq(unit);
  });

  it("recurses to function result", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, unit);
    const fn = makeFunctionType(unit, placeholder);
    const result = applyContext(context, fn);
    expect(result.kind === "function" && result.result).eq(unit);
  });
});
