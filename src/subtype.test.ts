import { strict as assert } from "assert";
import { expect } from "chai";
import { applyContext } from "./context/apply-context.js";
import { cloneContext, newContext } from "./context/context.js";
import { introducePlaceholder } from "./context/placeholders.js";
import { declareTypeVariable } from "./context/type-variables.js";
import { isSubtype } from "./subtype.js";
import { uniqueTypeId } from "./types/type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  newForAllType,
  voidType,
} from "./types/type.js";

describe("isSubtype", function () {
  it("fails disparate types", function () {
    const context = newContext();
    const fn = makeFunctionType(voidType, voidType);
    const initialContext = cloneContext(context);
    expect(isSubtype(context, voidType, fn)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes void", function () {
    const context = newContext();
    expect(isSubtype(context, voidType, voidType)).true;
  });

  it("passes identical variables", function () {
    const context = newContext();
    const type = declareTypeVariable(context, uniqueTypeId("foo"));
    expect(isSubtype(context, type, type)).true;
  });

  it("passes identical placeholders", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    expect(isSubtype(context, placeholder, placeholder)).true;
  });

  it("rejects different variables", function () {
    const context = newContext();
    const foo = declareTypeVariable(context, uniqueTypeId("foo"));
    const bar = declareTypeVariable(context, uniqueTypeId("bar"));
    const initialContext = cloneContext(context);
    expect(isSubtype(context, foo, bar)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes matching function", function () {
    const context = newContext();
    const subType = makeFunctionType(voidType, voidType);
    const superType = makeFunctionType(voidType, voidType);
    expect(isSubtype(context, subType, superType)).true;
  });

  it("rejects function and non-function", function () {
    const context = newContext();
    const subType = makeFunctionType(voidType, voidType);
    expect(isSubtype(context, subType, voidType)).false;
  });

  it("rejects parameter contravariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(smallType, voidType);
    const superType = makeFunctionType(largeType, voidType);
    const initialContext = cloneContext(context);
    expect(isSubtype(context, subType, superType)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes parameter contravariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(largeType, voidType);
    const superType = makeFunctionType(smallType, voidType);
    expect(isSubtype(context, subType, superType)).true;
  });

  it("rejects result covariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(voidType, largeType);
    const superType = makeFunctionType(voidType, smallType);
    const initialContext = cloneContext(context);
    expect(isSubtype(context, subType, superType)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes result contravariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(voidType, smallType);
    const superType = makeFunctionType(voidType, largeType);
    expect(isSubtype(context, subType, superType)).true;
  });

  it("passes trivial forall subtype", function () {
    const context = newContext();
    const forall = makeForAllType(uniqueTypeId("t"), voidType);
    expect(isSubtype(context, forall, voidType)).true;
  });

  it("passes simple forall function subtype", function () {
    const context = newContext();
    const superType = makeFunctionType(voidType, voidType);
    const forall = newForAllType("bar", (a) => makeFunctionType(a, a));
    expect(isSubtype(context, forall, superType)).true;
  });

  it("rejects mismatching forall body", function () {
    const context = newContext();
    const forall = makeForAllType(uniqueTypeId("t"), voidType);
    const superType = makeFunctionType(voidType, voidType);
    expect(isSubtype(context, forall, superType)).false;
  });

  it("passes trivial forall supertype", function () {
    const context = newContext();
    const forall = makeForAllType(uniqueTypeId("t"), voidType);
    expect(isSubtype(context, voidType, forall)).true;
  });

  it("rejects polymorphic function supertype", function () {
    const context = newContext();
    const subType = makeFunctionType(voidType, voidType);
    const forall = newForAllType("bar", (a) => makeFunctionType(a, a));

    const initialContext = cloneContext(context);
    expect(isSubtype(context, subType, forall)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("instantiates placeholder as supertype of polymorphic function", function () {
    // See Figure 12 in paper.
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const forall = newForAllType("bar", (a) => makeFunctionType(a, a));

    expect(isSubtype(context, forall, placeholder)).true;

    // In principle the placeholder should be isntantiate to `forall a. a -> a`, however since we
    // are implementing predicative polymorphism, we expect an approximation of that to be `b -> b`
    // where `b` is an unsolved placeholder.
    const instantiatedType = applyContext(context, placeholder);
    assert(instantiatedType.kind === "function");
    expect(instantiatedType.result).eq(instantiatedType.result);
    expect(instantiatedType.parameter.kind).eq("placeholder");
  });

  it("passes equivalent foralls", function () {
    const context = newContext();
    const subType = newForAllType("sub", (a) => makeFunctionType(a, a));
    const superType = newForAllType("super", (b) => makeFunctionType(b, b));

    expect(isSubtype(context, subType, superType)).true;
  });

  it("rejects differing foralls", function () {
    const context = newContext();
    const subType = newForAllType("sub", (a) => makeFunctionType(a, voidType));
    const superType = newForAllType("super", (b) => makeFunctionType(b, b));

    expect(isSubtype(context, subType, superType)).false;
  });

  const largeType = makeFunctionType(voidType, voidType);
  const smallType = newForAllType("a", (a) => makeFunctionType(a, a));
});
