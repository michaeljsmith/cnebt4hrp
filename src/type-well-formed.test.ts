import { expect } from "chai";
import { makePlaceholderElement } from "./context-element.js";
import { newContext, pushElement, pushTypeVariable } from "./context.js";
import { newPlaceholder, solvePlaceholder } from "./placeholders.js";
import { uniqueTypeId } from "./type-id.js";
import { typeWellFormed } from "./type-well-formed.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  Void,
} from "./type.js";

describe("typeWellFormed", function () {
  it("passes Void", function () {
    expect(typeWellFormed(newContext(), Void)).true;
  });

  it("passes variable in context", function () {
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));

    const context = newContext();
    pushTypeVariable(context, typeVariable.id);
    expect(typeWellFormed(context, typeVariable)).true;
  });

  it("fails variable not in context", function () {
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));

    const context = newContext();
    pushTypeVariable(context, uniqueTypeId("bar"));
    expect(typeWellFormed(context, typeVariable)).false;
  });

  it("passes unsolved placeholder", function () {
    const placeholder = newPlaceholder("foo");

    const context = newContext();
    pushElement(context, makePlaceholderElement(placeholder.id));
    expect(typeWellFormed(context, placeholder)).true;
  });

  it("passes solved placeholder", function () {
    const placeholder = newPlaceholder("foo");

    const context = newContext();
    pushElement(context, makePlaceholderElement(placeholder.id));
    solvePlaceholder(context, placeholder, Void);
    expect(typeWellFormed(context, placeholder)).true;
  });

  it("fails placeholder not in context", function () {
    const placeholder = newPlaceholder("foo");

    const context = newContext();
    pushElement(context, makePlaceholderElement(uniqueTypeId("bar")));
    expect(typeWellFormed(context, placeholder)).false;
  });

  it("passes function", function () {
    const context = newContext();
    expect(typeWellFormed(context, makeFunctionType(Void, Void))).true;
  });

  it("fails function with ill-formed parameter", function () {
    const context = newContext();
    const illFormed = makeTypeVariable(uniqueTypeId("foo"));
    expect(typeWellFormed(context, makeFunctionType(illFormed, Void))).false;
  });

  it("fails function with ill-formed result", function () {
    const context = newContext();
    const illFormed = makeTypeVariable(uniqueTypeId("foo"));
    expect(typeWellFormed(context, makeFunctionType(Void, illFormed))).false;
  });

  it("passes forall", function () {
    const context = newContext();
    const quantifiedVariable = makeTypeVariable(uniqueTypeId("foo"));
    const forAll = makeForAllType(quantifiedVariable.id, quantifiedVariable);
    expect(typeWellFormed(context, forAll)).true;
  });

  it("fails forall with ill-formed body", function () {
    const context = newContext();
    const quantifiedVariable = makeTypeVariable(uniqueTypeId("foo"));
    const forAll = makeForAllType(uniqueTypeId("bar"), quantifiedVariable);
    expect(typeWellFormed(context, forAll)).false;
  });
});
