import { expect } from "chai";
import { applyContext } from "../context/apply-context.js";
import { cloneContext, newContext } from "../context/context.js";
import {
  introducePlaceholder,
  placeholderSolution,
} from "../context/placeholders.js";
import { declareTypeVariable } from "../context/type-variables.js";
import { uniqueTypeId } from "../types/type-id.js";
import { makeFunctionType, makeTypeVariable } from "../types/type.js";
import { instantiateFunction } from "./instantiate-function.js";

describe("instantiateFunction", function () {
  it("instantiates function covariantly", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const result = instantiateFunction(
      "covariant",
      context,
      placeholder,
      makeFunctionType(a, b),
    );
    expect(result).true;
    const solution = placeholderSolution(context, placeholder);
    if (solution === undefined) {
      throw new Error("fail");
    }
    const appliedType = applyContext(context, solution);
    expect(appliedType).deep.eq(makeFunctionType(a, b));
  });

  it("instantiates function contravariantly", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const result = instantiateFunction(
      "contravariant",
      context,
      placeholder,
      makeFunctionType(a, b),
    );
    expect(result).true;
    const solution = placeholderSolution(context, placeholder);
    if (solution === undefined) {
      throw new Error("fail");
    }
    const appliedType = applyContext(context, solution);
    expect(appliedType).deep.eq(makeFunctionType(a, b));
  });

  it("rejects failed parameter", function () {
    const context = newContext();
    const a = makeTypeVariable(uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const previousContext = cloneContext(context);
    const result = instantiateFunction(
      "covariant",
      context,
      placeholder,
      makeFunctionType(a, b),
    );
    expect(result).false;
    expect(context.elements).deep.eq(previousContext.elements);
  });

  it("rejects failed return", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = makeTypeVariable(uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const previousContext = cloneContext(context);
    const result = instantiateFunction(
      "covariant",
      context,
      placeholder,
      makeFunctionType(a, b),
    );
    expect(result).false;
    expect(context.elements).deep.eq(previousContext.elements);
  });
});
