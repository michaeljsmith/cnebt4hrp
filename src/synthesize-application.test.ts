import { expect } from "chai";
import { applyContext } from './context/apply-context.js';
import { newContext } from "./context/context.js";
import { introducePlaceholder, placeholderSolution } from './context/placeholders.js';
import { declareTypeVariable } from './context/type-variables.js';
import { _void } from './expressions/expression.js';
import { synthesizeApplication } from './synthesize-application.js';
import { uniqueTypeId } from './types/type-id.js';
import { makeFunctionType, newForAllType, unit } from "./types/type.js";

describe("synthesizeApplication", function () {
  it("synthesizes function type", function () {
    const context = newContext();
    const fn = makeFunctionType(unit, unit);
    const unappliedType = synthesizeApplication(context, fn, _void);
    if (unappliedType === undefined) {
      throw new Error("error");
    }
    expect(applyContext(context, unappliedType)).eq(unit);
  });

  it("rejects function if argument doesn't check", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const fn = makeFunctionType(a, unit);
    expect(synthesizeApplication(context, fn, _void)).undefined;
  });

  it("synthesizes polymorphic application type", function () {
    const context = newContext();
    const fn = newForAllType("a", (a) => makeFunctionType(a, a));
    const unappliedType = synthesizeApplication(context, fn, _void);
    if (unappliedType === undefined) {
      throw new Error("error");
    }
    expect(applyContext(context, unappliedType)).eq(unit);
  });

  it("rejects polymorphic application if embedded check fails", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const fn = newForAllType("b", (b) => makeFunctionType(a, b));
    expect(synthesizeApplication(context, fn, _void)).undefined;
  });

  it("articulates placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "a");
    const unappliedResultType = synthesizeApplication(context, placeholder, _void);

    // The code should articulate the placeholder (i.e. create placholders `a` and `b` and
    // instantiate the placeholder to `a -> b`). It should instantiate `a` against the argument
    // (of type `void`) and return `b`.
    if (unappliedResultType === undefined) {
      throw new Error("error");
    }
    const resultType = applyContext(context, unappliedResultType);
    expect(resultType.kind).eq('placeholder');
    const instantiatedFunction = placeholderSolution(context, placeholder);
    if (instantiatedFunction?.kind !== 'function') {
      throw new Error("error");
    }
    expect(applyContext(context, instantiatedFunction.parameter)).eq(unit);
  });
});