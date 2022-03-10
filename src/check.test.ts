import { assert, expect } from "chai";
import { check } from "./check.js";
import { newContext } from "./context/context.js";
import {
  introducePlaceholder,
  placeholderSolution,
} from "./context/placeholders.js";
import { declareVariableWithType } from "./context/type-bindings.js";
import { declareTypeVariable } from "./context/type-variables.js";
import {
  makeAnnotationExpression,
  makeApplication,
  newLambda,
  _void,
} from "./expressions/expression.js";
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

  it("accepts equivalent polymorphic function", function () {
    const context = newContext();
    const type = newForAllType("T", (T) => makeFunctionType(T, T));
    const fn = newLambda("x", (x) => x);
    const expressionType = newForAllType("T", (T) => makeFunctionType(T, T));
    const annotatedFn = makeAnnotationExpression(fn, expressionType);
    assert.isTrue(check(context, type, annotatedFn));
  });

  it("rejects monomorphic function as subtype of polymorphic", function () {
    const context = newContext();
    const type = newForAllType("T", (T) => makeFunctionType(T, T));
    const fn = newLambda("x", (x) => x);
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const expressionType = makeFunctionType(a, a);
    const annotatedFn = makeAnnotationExpression(fn, expressionType);
    assert.isFalse(check(context, type, annotatedFn));
  });

  it("rejects incompatible polymorphic function", function () {
    const context = newContext();
    const type = newForAllType("T", (T) => makeFunctionType(T, T));
    const fn = newLambda("x", () => _void);
    const expressionType = newForAllType("T", (T) => makeFunctionType(T, unit));
    const annotatedFn = makeAnnotationExpression(fn, expressionType);
    assert.isFalse(check(context, type, annotatedFn));
  });

  it("checks multi-arg function", function () {
    //const f: (x: number) => () => number = (x) => () => x;
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(a, makeFunctionType(unit, a));
    const fn = newLambda("x", (x) => newLambda("_", () => x));
    assert.isTrue(check(context, type, fn));
  });

  it("rejects incompatible multi-arg function", function () {
    //const f: (x: number) => () => number = (x) => () => undefined;
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(a, makeFunctionType(unit, a));
    const fn = newLambda("x", () => newLambda("_", () => _void));
    assert.isFalse(check(context, type, fn));
  });

  it("checks polymorphic multi-arg function", function () {
    //const f: <T>(x: T) => (y: T) => T = (x) => () => x;
    const context = newContext();
    const type = newForAllType("a", (a) =>
      makeFunctionType(a, makeFunctionType(a, a)),
    );
    const fn = newLambda("x", (x) => newLambda("_", () => x));
    assert.isTrue(check(context, type, fn));
  });

  it("rejects incompatible polymorphic multi-arg function", function () {
    //const f: <T>(x: T) => (y: T) => T = (x) => () => undefined;
    const context = newContext();
    const type = newForAllType("a", (a) =>
      makeFunctionType(a, makeFunctionType(a, a)),
    );
    const fn = newLambda("x", () => newLambda("_", () => _void));
    assert.isFalse(check(context, type, fn));
  });

  it("instantiates polymorphic multi-arg function", function () {
    // const annotate = <T>(x: T): T => x;
    // const f: (x: number) => (y: number) => number =
    //     annotate<<T>(x: T) => (y: T) => T>(
    //         (x) => () => x);
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(a, makeFunctionType(a, a));
    const fn = newLambda("x", (x) => newLambda("_", () => x));
    const annotationType = newForAllType("b", (b) =>
      makeFunctionType(b, makeFunctionType(b, b)),
    );
    const annotatedFn = makeAnnotationExpression(fn, annotationType);
    assert.isTrue(check(context, type, annotatedFn));
  });

  it("rejects incompatible polymorphic multi-arg function", function () {
    // const annotate = <T>(x: T): T => x;
    // const f: (x: number) => (y: number) => number =
    //     annotate<<T>(x: T) => (y: void) => T>(
    //         (x) => () => x);
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(a, makeFunctionType(a, a));
    const fn = newLambda("x", (x) => newLambda("_", () => x));
    const annotationType = newForAllType("b", (b) =>
      makeFunctionType(b, makeFunctionType(unit, b)),
    );
    const annotatedFn = makeAnnotationExpression(fn, annotationType);
    assert.isFalse(check(context, type, annotatedFn));
  });

  it("checks higher-order function", function () {
    // const f: (fn: (x: void) => number) => number = (fn) => fn(undefined);
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(makeFunctionType(unit, a), a);
    const fn = newLambda("f", (f) => makeApplication(f, _void));
    assert.isTrue(check(context, type, fn));
  });

  it("instantiates polymorphic higher-order function", function () {
    // const annotate = <T>(x: T): T => x;
    // const f: (cb: (x: void) => number) => number =
    //     annotate<<T>(cb: (x: void) => T) =>  T>(
    //         (cb) => cb(undefined));
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(makeFunctionType(unit, a), a);
    const fn = newLambda("f", (f) => makeApplication(f, _void));
    const annotationType = newForAllType("b", (b) =>
      makeFunctionType(makeFunctionType(unit, b), b),
    );
    const annotatedFn = makeAnnotationExpression(fn, annotationType);
    assert.isTrue(check(context, type, annotatedFn));
  });

  it("rejects incompatible polymorphic higher-order function", function () {
    // const annotate = <T>(x: T): T => x;
    // const f: (cb: (x: void) => void) => string =
    //     annotate<<T>(cb: (x: void) => T) => T>(
    //         (cb) => cb(undefined));
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const type = makeFunctionType(makeFunctionType(unit, unit), a);
    const fn = newLambda("f", (f) => makeApplication(f, _void));
    const annotationType = newForAllType("b", (b) =>
      makeFunctionType(makeFunctionType(unit, b), b),
    );
    const annotatedFn = makeAnnotationExpression(fn, annotationType);
    assert.isFalse(check(context, type, annotatedFn));
  });
});
