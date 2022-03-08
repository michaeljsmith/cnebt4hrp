import { expect } from "chai";
import { uniqueTypeId } from "../types/type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  newPlaceholder,
  unit,
} from "../types/type.js";
import { newContext } from "./context.js";
import {
  introducePlaceholder,
  pushPlaceholder,
  solvePlaceholder,
} from "./placeholders.js";
import { declareTypeVariable } from "./type-variables.js";
import { typeWellFormed } from "./type-well-formed.js";

describe("typeWellFormed", function () {
  it("passes Void", function () {
    expect(typeWellFormed(newContext(), unit)).true;
  });

  it("passes variable in context", function () {
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));

    const context = newContext();
    declareTypeVariable(context, typeVariable.id);
    expect(typeWellFormed(context, typeVariable)).true;
  });

  it("fails variable not in context", function () {
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));

    const context = newContext();
    declareTypeVariable(context, uniqueTypeId("bar"));
    expect(typeWellFormed(context, typeVariable)).false;
  });

  it("passes unsolved placeholder", function () {
    const placeholder = newPlaceholder("foo");

    const context = newContext();
    pushPlaceholder(context, placeholder);
    expect(typeWellFormed(context, placeholder)).true;
  });

  it("passes solved placeholder", function () {
    const placeholder = newPlaceholder("foo");

    const context = newContext();
    pushPlaceholder(context, placeholder);
    solvePlaceholder(context, placeholder, unit);
    expect(typeWellFormed(context, placeholder)).true;
  });

  it("fails placeholder not in context", function () {
    const placeholder = newPlaceholder("foo");

    const context = newContext();
    introducePlaceholder(context, "bar");
    expect(typeWellFormed(context, placeholder)).false;
  });

  it("passes function", function () {
    const context = newContext();
    expect(typeWellFormed(context, makeFunctionType(unit, unit))).true;
  });

  it("fails function with ill-formed parameter", function () {
    const context = newContext();
    const illFormed = makeTypeVariable(uniqueTypeId("foo"));
    expect(typeWellFormed(context, makeFunctionType(illFormed, unit))).false;
  });

  it("fails function with ill-formed result", function () {
    const context = newContext();
    const illFormed = makeTypeVariable(uniqueTypeId("foo"));
    expect(typeWellFormed(context, makeFunctionType(unit, illFormed))).false;
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
