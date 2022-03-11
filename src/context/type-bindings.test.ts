import { expect } from "chai";
import { uniqueBindingId } from "../terms/binding-id.js";
import { voidType } from "../types/type.js";
import { newContext } from "./context.js";
import { introducePlaceholder } from "./placeholders.js";
import { bindType, lookupBindingType } from "./type-bindings.js";

describe("typeBindings", function () {
  it("returns undefined for empty context", function () {
    const context = newContext();
    expect(lookupBindingType(context, uniqueBindingId("foo"))).undefined;
  });

  it("finds binding", function () {
    const context = newContext();
    introducePlaceholder(context, "a");
    const bindingId = uniqueBindingId("foo");
    bindType(context, bindingId, voidType);
    expect(lookupBindingType(context, bindingId)).eq(voidType);
  });

  it("ignores different binding", function () {
    const context = newContext();
    const bindingId = uniqueBindingId("foo");
    bindType(context, bindingId, voidType);
    expect(lookupBindingType(context, uniqueBindingId("bar"))).undefined;
  });

  it("ignores other element", function () {
    const context = newContext();
    introducePlaceholder(context, "foo");
    expect(lookupBindingType(context, uniqueBindingId("bar"))).undefined;
  });
});
