import { expect } from "chai";
import { check } from "./check.js";
import { newContext } from "./context/context.js";
import {
  introducePlaceholder,
  placeholderSolution,
} from "./context/placeholders.js";
import { declareVariableWithType } from "./context/type-bindings.js";
import { declareTypeVariable } from "./context/type-variables.js";
import { newLambda, _void } from "./expressions/expression.js";
import { uniqueTypeId } from "./types/type-id.js";
import { makeFunctionType, newForAllType, unit } from "./types/type.js";

describe("check", function () {
  it("checks void against void", function () {
    const context = newContext();
    expect(check(context, unit, _void)).true;
  });

  it("checks against trivial forall", function () {
    const context = newContext();
    const type = newForAllType("a", () => unit);
    const expression = _void;
    expect(check(context, type, expression)).true;
  });

  it("rejects mismatching forall", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = newForAllType("a", () => a);
    const expression = _void;
    expect(check(context, type, expression)).false;
  });

  it("checks simple lambda", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(a, a);
    const expression = newLambda("x", (x) => x);
    expect(check(context, type, expression)).true;
  });

  it("rejects mismatched lambda", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(a, a);
    const expression = newLambda("x", () => _void);
    expect(check(context, type, expression)).false;
  });

  it("checks simple lambda, instantiating placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "a");
    const type = makeFunctionType(unit, placeholder);
    const expression = newLambda("x", (x) => x);
    expect(check(context, type, expression)).true;
    expect(placeholderSolution(context, placeholder)).eq(unit);
  });

  it("subsumes placeholder", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const placeholder = introducePlaceholder(context, "b");
    const x = declareVariableWithType(context, "x", a);
    expect(check(context, placeholder, x)).true;
    // Check that the placeholder was instantiated as expected.
    expect(placeholderSolution(context, placeholder)).eq(a);
  });
});
