import { strict as assert } from "assert";
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
import { instantiateSubtype } from "./instantiate-subtype.js";

describe("instantiateSubtype", function () {
  it("instantiates simple type", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const result = instantiateSubtype(context, placeholder, unit);
    expect(result).true;
    expect(placeholderSolution(context, placeholder)).eq(unit);
  });

  it("instantiates function", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const fn = makeFunctionType(a, b);
    const result = instantiateSubtype(context, placeholder, fn);
    expect(result).true;
    const solution = placeholderSolution(context, placeholder);
    assert(solution !== undefined);
    const appliedType = applyContext(context, solution);

    expect(appliedType).deep.eq(fn);
  });

  it("instantiates to trivial forall", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const quantifiedName = uniqueTypeId("t");
    const forall = makeForAllType(quantifiedName, unit);
    expect(instantiateSubtype(context, placeholder, forall)).true;
    expect(placeholderSolution(context, placeholder)).eq(unit);
  });

  it("cannot instantiate to general function", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const initialContext = cloneContext(context);
    const quantifiedName = uniqueTypeId("t");
    const quantifiedVariable = makeTypeVariable(quantifiedName);
    const forall = makeForAllType(
      quantifiedName,
      makeFunctionType(quantifiedVariable, quantifiedVariable),
    );
    expect(instantiateSubtype(context, placeholder, forall)).false;
    expect(context.elements).deep.eq(initialContext.elements);
  });
});
