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
  unit,
} from "./types/type.js";

describe("isSubtype", function () {
  it("fails disparate types", function () {
    const context = newContext();
    const fn = makeFunctionType(unit, unit);
    const initialContext = cloneContext(context);
    expect(isSubtype(context, unit, fn)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes void", function () {
    const context = newContext();
    expect(isSubtype(context, unit, unit)).true;
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
    const subType = makeFunctionType(unit, unit);
    const superType = makeFunctionType(unit, unit);
    expect(isSubtype(context, subType, superType)).true;
  });

  it("rejects function and non-function", function () {
    const context = newContext();
    const subType = makeFunctionType(unit, unit);
    expect(isSubtype(context, subType, unit)).false;
  });

  it("rejects parameter contravariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(smallType, unit);
    const superType = makeFunctionType(largeType, unit);
    const initialContext = cloneContext(context);
    expect(isSubtype(context, subType, superType)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes parameter contravariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(largeType, unit);
    const superType = makeFunctionType(smallType, unit);
    expect(isSubtype(context, subType, superType)).true;
  });

  it("rejects result covariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(unit, largeType);
    const superType = makeFunctionType(unit, smallType);
    const initialContext = cloneContext(context);
    expect(isSubtype(context, subType, superType)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });

  it("passes result contravariantly", function () {
    const context = newContext();
    const subType = makeFunctionType(unit, smallType);
    const superType = makeFunctionType(unit, largeType);
    expect(isSubtype(context, subType, superType)).true;
  });

  it("passes trivial forall subtype", function () {
    const context = newContext();
    const forall = makeForAllType(uniqueTypeId("t"), unit);
    expect(isSubtype(context, forall, unit)).true;
  });

  it("passes simple forall function subtype", function () {
    const context = newContext();
    const superType = makeFunctionType(unit, unit);
    const forall = newForAllType("bar", (a) => makeFunctionType(a, a));
    expect(isSubtype(context, forall, superType)).true;
  });

  it("rejects mismatching forall body", function () {
    const context = newContext();
    const forall = makeForAllType(uniqueTypeId("t"), unit);
    const superType = makeFunctionType(unit, unit);
    expect(isSubtype(context, forall, superType)).false;
  });

  it("passes trivial forall supertype", function () {
    const context = newContext();
    const forall = makeForAllType(uniqueTypeId("t"), unit);
    expect(isSubtype(context, unit, forall)).true;
  });

  it("rejects polymorphic function supertype", function () {
    const context = newContext();
    const subType = makeFunctionType(unit, unit);
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
    if (instantiatedType.kind !== "function") {
      throw new Error("Wrong type");
    }
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
    const subType = newForAllType("sub", (a) => makeFunctionType(a, unit));
    const superType = newForAllType("super", (b) => makeFunctionType(b, b));

    expect(isSubtype(context, subType, superType)).false;
  });

  const largeType = makeFunctionType(unit, unit);
  const smallType = newForAllType("a", (a) => makeFunctionType(a, a));
});
