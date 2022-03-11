import { expect } from "chai";
import { substituteTypeReferences } from "./substitute-type-references.js";
import { uniqueTypeId } from "./type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  makeTypeVariable,
  newPlaceholder,
  Type,
  voidType,
} from "./type.js";

describe("subsituteTypeReferences", function () {
  const existingVariableId = uniqueTypeId("foo");
  const existingVariable = makeTypeVariable(existingVariableId);
  const placeholder = newPlaceholder("bar");

  function execute(type: Type): Type {
    return substituteTypeReferences(type, existingVariableId, placeholder);
  }

  it("ignores void", function () {
    const result = execute(voidType);
    expect(result).eq(voidType);
  });

  it("ignores placeholder", function () {
    const existingPlaceholder = newPlaceholder("existing");
    const result = execute(existingPlaceholder);
    expect(result).eq(existingPlaceholder);
  });

  it("replaces variable", function () {
    const result = execute(existingVariable);
    expect(result).eq(placeholder);
  });

  it("ignores different variable", function () {
    const typeVariable = makeTypeVariable(uniqueTypeId("other"));
    const result = execute(typeVariable);
    expect(result).eq(typeVariable);
  });

  it("recurses to function parameter", function () {
    const resultType = makeTypeVariable(uniqueTypeId("result"));
    const result = execute(makeFunctionType(existingVariable, resultType));
    expect(result).deep.eq(makeFunctionType(placeholder, resultType));
  });

  it("recurses to function result", function () {
    const parameterType = makeTypeVariable(uniqueTypeId("parameter"));
    const result = execute(makeFunctionType(parameterType, existingVariable));
    expect(result).deep.eq(makeFunctionType(parameterType, placeholder));
  });

  it("recurses to forall body", function () {
    const quantifiedVariableId = uniqueTypeId("x");
    const result = execute(
      makeForAllType(quantifiedVariableId, existingVariable),
    );
    expect(result).deep.eq(makeForAllType(quantifiedVariableId, placeholder));
  });
});
