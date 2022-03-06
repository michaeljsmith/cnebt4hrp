import { expect } from "chai";
import { newContext } from "../context/context.js";
import {
  introducePlaceholder,
  placeholderSolution,
} from "../context/placeholders.js";
import { declareTypeVariable } from "../context/type-variables.js";
import { uniqueTypeId } from "../types/type-id.js";
import { makeForAllType, makeFunctionType, Void } from "../types/type.js";
import { maybeInstantiateIfMonotype } from "./instantiate-monotype.js";

describe("instantiateMonotype", function () {
  it("ignores forall", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const result = maybeInstantiateIfMonotype(
      context,
      placeholder,
      makeForAllType(uniqueTypeId("bar"), Void),
    );
    expect(result).false;
  });

  it("instantiates to simple type", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const result = maybeInstantiateIfMonotype(context, placeholder, Void);
    expect(result).true;
    expect(placeholderSolution(context, placeholder)).eq(Void);
  });

  it("instantiates to complex but well-formed type", function () {
    const context = newContext();
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const placeholder = introducePlaceholder(context, "foo");
    const target = makeFunctionType(a, b);
    const result = maybeInstantiateIfMonotype(
      context,
      placeholder,
      target,
    );
    expect(result).true;
    expect(placeholderSolution(context, placeholder)).eq(target);
  });

  it("ignores ill-formed type", function () {
    const context = newContext();
    const placeholder = introducePlaceholder(context, "foo");
    const a = declareTypeVariable(context, uniqueTypeId("a"));
    const b = declareTypeVariable(context, uniqueTypeId("b"));
    const target = makeFunctionType(a, b);
    const result = maybeInstantiateIfMonotype(
      context,
      placeholder,
      target,
    );
    expect(result).false;
    expect(placeholderSolution(context, placeholder)).undefined;
  });

  it("instantiates later placeholder to newer", function () {
    const context = newContext();
    const placeholder1 = introducePlaceholder(context, "foo");
    const placeholder2 = introducePlaceholder(context, "bar");

    const result = maybeInstantiateIfMonotype(
      context,
      placeholder1,
      placeholder2,
    );
    expect(result).true;
    expect(placeholderSolution(context, placeholder1)).undefined;
    expect(placeholderSolution(context, placeholder2)).eq(placeholder1);
  });
});
