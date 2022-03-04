import { expect } from "chai";
import { makePlaceholderElement } from "./context-element.js";
import { newContext, pushElement } from "./context.js";
import { findPlaceholderIndex, newPlaceholder, placeholderSolution, solvePlaceholder } from "./placeholders.js";
import { uniqueTypeId } from "./type-id.js";
import { Void } from './type.js';

describe("placeholders", function () {
  it("finds placeholder", function () {
    const context = newContext();
    pushElement(context, makePlaceholderElement(uniqueTypeId("bar")));
    const placeholder = newPlaceholder("foo");
    pushElement(context, makePlaceholderElement(placeholder.id));
    expect(findPlaceholderIndex(context, placeholder)).eq(1);
  });

  it("solves placeholder", function () {
    const context = newContext();
    const placeholder = newPlaceholder("foo");
    pushElement(context, makePlaceholderElement(placeholder.id));
    solvePlaceholder(context, placeholder, Void);
    expect(placeholderSolution(context, placeholder)).eq(Void);
  });  
});
