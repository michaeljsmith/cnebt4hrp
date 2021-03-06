import { strict as assert } from "assert";
import { expect } from "chai";
import { applyContext } from "./context/apply-context.js";
import { newContext } from "./context/context.js";
import { declareVariableWithType } from "./context/type-bindings.js";
import { declareTypeVariable } from "./context/type-variables.js";
import { synthesize } from "./synthesize.js";
import { uniqueBindingId } from "./terms/binding-id.js";
import {
  makeAnnotation,
  makeApplication,
  makeReference,
  newLambda,
  void_,
} from "./terms/term.js";
import { uniqueTypeId } from "./types/type-id.js";
import { makeFunctionType, voidType } from "./types/type.js";

describe("synthesize", function () {
  it("synthesizes void for void", function () {
    const context = newContext();
    expect(synthesize(context, void_)).eq(voidType);
  });

  it("synthesizes value for bound variable", function () {
    const context = newContext();
    const x = declareVariableWithType(context, "x", voidType);
    expect(synthesize(context, x)).eq(voidType);
  });

  it("cannot synthesize for unbound variable", function () {
    const context = newContext();
    const x = makeReference(uniqueBindingId("x"));
    expect(synthesize(context, x)).undefined;
  });

  it("synthesizes annotated type", function () {
    const context = newContext();
    const term = makeAnnotation(void_, voidType);
    expect(synthesize(context, term)).eq(voidType);
  });

  it("synthesizes placeholder for identity function", function () {
    const context = newContext();
    const type = synthesize(
      context,
      newLambda("x", (x) => x),
    );
    assert(type?.kind === "type:function");
    const parameter = applyContext(context, type.parameter);
    const result = applyContext(context, type.result);
    expect(parameter).equal(result);
  });

  it("cannot synthesize function with non-checking body", function () {
    const context = newContext();
    const type = synthesize(
      context,
      newLambda("x", () => makeReference(uniqueBindingId("invalid"))),
    );
    expect(type).undefined;
  });

  it("synthesizes type for identity function application", function () {
    const context = newContext();
    const fn = newLambda("x", (x) => x);
    const type = synthesize(context, makeApplication(fn, void_));
    assert(type !== undefined);
    expect(applyContext(context, type)).eq(voidType);
  });

  it("cannot synthesize type for application with invalid function", function () {
    const context = newContext();
    const fn = makeAnnotation(void_, makeFunctionType(voidType, voidType));
    const type = synthesize(context, makeApplication(fn, void_));
    expect(type).undefined;
  });

  it("cannot synthesize type for application with non-function", function () {
    const context = newContext();
    const type = synthesize(context, makeApplication(void_, void_));
    expect(type).undefined;
  });

  it("cannot synthesize type for mismatching application", function () {
    const context = newContext();
    const fn = newLambda("x", (x) => x);
    const a = declareTypeVariable(context, uniqueTypeId("a)"));
    const annotatedFn = makeAnnotation(fn, makeFunctionType(a, a));
    const type = synthesize(context, makeApplication(annotatedFn, void_));
    expect(type).undefined;
  });
});
