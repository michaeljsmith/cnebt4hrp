import { expect } from "chai";
import { uniqueTypeId } from "../types/type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  voidType,
} from "../types/type.js";
import { applyContext } from "./apply-context.js";
import { newContext } from "./context.js";
import { introducePlaceholder, solvePlaceholder } from "./placeholders.js";

describe("applyContext", function () {
  it("leaves void", function () {
    const context = newContext();
    expect(applyContext(context, voidType)).eq(voidType);
  });

  it("leaves variable", function () {
    const context = newContext();
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));
    expect(applyContext(context, typeVariable)).eq(typeVariable);
  });

  it("substitutes placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, voidType);
    expect(applyContext(context, placeholder)).eq(voidType);
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
    solvePlaceholder(context, placeholder2, voidType);
    expect(applyContext(context, placeholder1)).eq(voidType);
  });

  it("recurses to forall body", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, voidType);
    const forAll = makeForAllType(uniqueTypeId("bar"), placeholder);
    const result = applyContext(context, forAll);
    expect(result.kind === "type:forall" && result.body).eq(voidType);
  });

  it("recurses to function parameter", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, voidType);
    const fn = makeFunctionType(placeholder, voidType);
    const result = applyContext(context, fn);
    expect(result.kind === "type:function" && result.parameter).eq(voidType);
  });

  it("recurses to function result", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    solvePlaceholder(context, placeholder, voidType);
    const fn = makeFunctionType(voidType, placeholder);
    const result = applyContext(context, fn);
    expect(result.kind === "type:function" && result.result).eq(voidType);
  });
});
