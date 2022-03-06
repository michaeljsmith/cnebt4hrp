import { expect } from "chai";
import { newMarkerElement } from "./context-element.js";
import {
  cloneContext,
  commitContext,
  newContext,
  pushElement,
} from "./context.js";

describe("context", function () {
  it("pushes element", function () {
    const context = newContext();
    pushElement(context, newMarkerElement());
    expect(context.elements.length).eq(1);
  });

  it("commits child element", function () {
    const context = newContext();
    const childContext = cloneContext(context);
    pushElement(childContext, newMarkerElement());
    commitContext(context, childContext);
    expect(context.elements.length).eq(1);
  });
});
