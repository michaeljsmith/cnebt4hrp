import { BindingId } from "../expressions/binding-id.js";
import { Type } from "../types/type.js";
import { makeAnnotationElement } from "./context-element.js";
import { Context, pushElement } from "./context.js";

export function bindType(
  context: Context,
  bindingId: BindingId,
  type: Type,
): void {
  pushElement(context, makeAnnotationElement(bindingId, type));
}

export function lookupBindingType(
  context: Context,
  bindingId: BindingId,
): Type | undefined {
  for (const element of context.elements) {
    if (
      element.kind === "element:annotation" &&
      element.bindingId.uniqueId === bindingId.uniqueId
    ) {
      return element.type;
    }
    return undefined;
  }
}
