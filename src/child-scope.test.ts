import { expect } from "chai";
import { inChildScope } from "./child-scope.js";
import { makePlaceholderElement } from "./context-element.js";
import {
  newContext,
  newPlaceholder,
  placeholderSolution,
  pushElement,
  solve,
} from "./context.js";
import { uniqueTypeId } from "./type-id.js";
import { Void } from "./type.js";

describe("childScope", function () {
  it("returns body result", function () {
    const context = newContext();
    const result = inChildScope(context, () => 3);
    expect(result).eq(3);
  });

  it("discards changes to end of context", function () {
    const context = newContext();
    const element0 = makePlaceholderElement(uniqueTypeId("foo"));
    const element1 = makePlaceholderElement(uniqueTypeId("bar"));
    pushElement(context, element0);
    inChildScope(context, () => {
      pushElement(context, element1);
    });
    expect(context.elements).deep.eq([element0]);
  });

  it("retains changes to existing elements", function () {
    const context = newContext();
    const placeholder = newPlaceholder("foo");
    pushElement(context, makePlaceholderElement(placeholder.id));
    inChildScope(context, () => {
      solve(context, placeholder, Void);
    });
    expect(placeholderSolution(context, placeholder)).eq(Void);
  });
});
