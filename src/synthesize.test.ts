import { strict as assert } from "assert";
import { expect } from "chai";
import { applyContext } from "./context/apply-context.js";
import { newContext } from "./context/context.js";
import { declareVariableWithType } from "./context/type-bindings.js";
import { declareTypeVariable } from './context/type-variables.js';
import { uniqueBindingId } from "./expressions/binding-id.js";
import {
  makeAnnotationExpression,
  makeApplication,
  makeReferenceExpression,
  newLambda,
  _void,
} from "./expressions/expression.js";
import { synthesize } from "./synthesize.js";
import { uniqueTypeId } from './types/type-id.js';
import { makeFunctionType, unit } from "./types/type.js";

describe("synthesize", function () {
  it("synthesizes void for void", function () {
    const context = newContext();
    expect(synthesize(context, _void)).eq(unit);
  });

  it("synthesizes value for bound variable", function () {
    const context = newContext();
    const x = declareVariableWithType(context, "x", unit);
    expect(synthesize(context, x)).eq(unit);
  });

  it("cannot synthesize for unbound variable", function () {
    const context = newContext();
    const x = makeReferenceExpression(uniqueBindingId("x"));
    expect(synthesize(context, x)).undefined;
  });

  it("synthesizes annotated type", function () {
    const context = newContext();
    const expression = makeAnnotationExpression(_void, unit);
    expect(synthesize(context, expression)).eq(unit);
  });

  it("synthesizes placeholder for identity function", function () {
    const context = newContext();
    const type = synthesize(
      context,
      newLambda("x", (x) => x),
    );
    assert(type?.kind === "function");
    const parameter = applyContext(context, type.parameter);
    const result = applyContext(context, type.result);
    assert.equal(parameter, result);
  });

  it("cannot synthesize function with non-checking body", function () {
    const context = newContext();
    const type = synthesize(
      context,
      newLambda("x", () => makeReferenceExpression(uniqueBindingId("invalid"))),
    );
    assert(type === undefined);
  });

  it("synthesizes type for identity function application", function () {
    const context = newContext();
    const fn = newLambda("x", (x) => x);
    const type = synthesize(context, makeApplication(fn, _void));
    assert(type !== undefined);
    assert.equal(applyContext(context, type), unit);
  });

  it("cannot synthesize type for application with invalid function", function () {
    const context = newContext();
    const fn = makeAnnotationExpression(_void, makeFunctionType(unit, unit));
    const type = synthesize(context, makeApplication(fn, _void));
    assert(type === undefined);
  });

  it("cannot synthesize type for application with non-function", function () {
    const context = newContext();
    const type = synthesize(context, makeApplication(_void, _void));
    assert(type === undefined);
  });

  it("cannot synthesize type for mismatching application", function () {
    const context = newContext();
    const fn = newLambda("x", (x) => x);
    const a = declareTypeVariable(context, uniqueTypeId("a)"));
    const annotatedFn = makeAnnotationExpression(fn, makeFunctionType(a, a));
    const type = synthesize(context, makeApplication(annotatedFn, _void));
    assert(type === undefined);
  });
});
