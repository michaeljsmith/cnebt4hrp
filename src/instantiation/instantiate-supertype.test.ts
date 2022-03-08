import { expect } from "chai";
import { applyContext } from "../context/apply-context.js";
import { cloneContext, newContext } from "../context/context.js";
import {
  introducePlaceholder,
  placeholderSolution,
} from "../context/placeholders.js";
import { declareTypeVariable } from "../context/type-variables.js";
import { uniqueTypeId } from "../types/type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  unit,
} from "../types/type.js";
import { instantiateSupertype } from "./instantiate-supertype.js";

describe("instantiateSupertype", function () {
  it("instantiates simple type", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const result = instantiateSupertype(context, placeholder, unit);
    expect(result).true;
    expect(placeholderSolution(context, placeholder)).eq(unit);
  });

  it("instantiates function", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const fn = makeFunctionType(a, b);
    const result = instantiateSupertype(context, placeholder, fn);
    expect(result).true;
    const solution = placeholderSolution(context, placeholder);
    if (solution === undefined) {
      throw new Error("fail");
    }
    const appliedType = applyContext(context, solution);

    expect(appliedType).deep.eq(fn);
  });

  it("instantiates to trivial forall", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const forall = makeForAllType(uniqueTypeId("t"), unit);
    expect(instantiateSupertype(context, placeholder, forall)).true;
    expect(placeholderSolution(context, placeholder)).eq(unit);
  });

  it("cannot instantiate to ill-formed forall", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const undeclaredType = makeTypeVariable(uniqueTypeId("bar"));
    const forall = makeForAllType(uniqueTypeId("t"), undeclaredType);
    const initialContext = cloneContext(context);
    expect(instantiateSupertype(context, placeholder, forall)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });
});
