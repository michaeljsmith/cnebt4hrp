import { expect } from "chai";
import { uniqueTypeId } from "./type-id.js";
import { typeReferences } from "./type-references.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  newPlaceholder,
  unit,
} from "./type.js";

describe("typeReferences", function () {
  it("finds no references in void", function () {
    expect(typeReferences(unit, newPlaceholder("foo"))).false;
  });

  it("finds no references in variable", function () {
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));
    expect(typeReferences(typeVariable, newPlaceholder("bar"))).false;
  });

  it("finds reference in matching placeholder", function () {
    const placeholder = newPlaceholder("foo");
    expect(typeReferences(placeholder, placeholder)).true;
  });

  it("finds no references in other placeholder", function () {
    expect(typeReferences(newPlaceholder("foo"), newPlaceholder("bar"))).false;
  });

  it("recurses to function parameter", function () {
    const placeholder = newPlaceholder("foo");
    expect(typeReferences(makeFunctionType(placeholder, unit), placeholder))
      .true;
  });

  it("recurses to function result", function () {
    const placeholder = newPlaceholder("foo");
    expect(typeReferences(makeFunctionType(unit, placeholder), placeholder))
      .true;
  });

  it("recurses to forall body", function () {
    const placeholder = newPlaceholder("foo");
    const forAll = makeForAllType(uniqueTypeId("bar"), placeholder);
    expect(typeReferences(forAll, placeholder)).true;
  });
});
