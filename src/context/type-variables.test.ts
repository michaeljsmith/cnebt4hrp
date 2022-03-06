import { expect } from "chai";
import { uniqueTypeId } from "../types/type-id.js";
import { makeTypeVariable } from "../types/type.js";
import { newContext } from "./context.js";
import { introducePlaceholder } from "./placeholders.js";
import { declareTypeVariable, typeVariableDeclared } from "./type-variables.js";

describe("typeVariables", function () {
  it("can't find type in empty context", function () {
    const context = newContext();
    expect(typeVariableDeclared(context, makeTypeVariable(uniqueTypeId("foo"))))
      .false;
  });

  it("finds type variable", function () {
    const context = newContext();
    const typeVariable = makeTypeVariable(uniqueTypeId("foo"));
    declareTypeVariable(context, typeVariable);
    expect(typeVariableDeclared(context, typeVariable)).true;
  });

  it("ignores other elements", function () {
    const context = newContext();
    introducePlaceholder(context, "foo");
    expect(typeVariableDeclared(context, makeTypeVariable(uniqueTypeId("foo"))))
      .false;
  });
});
