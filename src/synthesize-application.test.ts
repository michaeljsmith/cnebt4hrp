import { strict as assert } from "assert";
import { expect } from "chai";
import { applyContext } from "./context/apply-context.js";
import { newContext } from "./context/context.js";
import {
  introducePlaceholder,
  placeholderSolution,
} from "./context/placeholders.js";
import { declareTypeVariable } from "./context/type-variables.js";
import { synthesizeApplication } from "./synthesize-application.js";
import { void_ } from "./terms/term.js";
import { uniqueTypeId } from "./types/type-id.js";
import { makeFunctionType, newForAllType, voidType } from "./types/type.js";

describe("synthesizeApplication", function () {
  it("synthesizes function type", function () {
    const context = newContext();
    const fn = makeFunctionType(voidType, voidType);
    const unappliedType = synthesizeApplication(context, fn, void_);
    assert(unappliedType !== undefined);
    expect(applyContext(context, unappliedType)).eq(voidType);
  });

  it("rejects function if argument doesn't check", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const fn = makeFunctionType(a, voidType);
    expect(synthesizeApplication(context, fn, void_)).undefined;
  });

  it("synthesizes polymorphic application type", function () {
    const context = newContext();
    const fn = newForAllType("a", (a) => makeFunctionType(a, a));
    const unappliedType = synthesizeApplication(context, fn, void_);
    assert(unappliedType !== undefined);
    expect(applyContext(context, unappliedType)).eq(voidType);
  });

  it("rejects polymorphic application if embedded check fails", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const fn = newForAllType("b", (b) => makeFunctionType(a, b));
    expect(synthesizeApplication(context, fn, void_)).undefined;
  });

  it("articulates placeholder", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "a");
    const unappliedResultType = synthesizeApplication(
      context,
      placeholder,
      void_,
    );

    // The code should articulate the placeholder (i.e. create placholders `a` and `b` and
    // instantiate the placeholder to `a -> b`). It should instantiate `a` against the argument
    // (of type `void`) and return `b`.
    assert(unappliedResultType !== undefined);
    const resultType = applyContext(context, unappliedResultType);
    expect(resultType.kind).eq("placeholder");
    const instantiatedFunction = placeholderSolution(context, placeholder);
    assert(instantiatedFunction?.kind === "function");
    expect(applyContext(context, instantiatedFunction.parameter)).eq(voidType);
  });
});
