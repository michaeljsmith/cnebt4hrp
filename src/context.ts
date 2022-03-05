import { BindingId } from "./binding-id.js";
import { ContextElement } from "./context-element.js";
import { TypeId } from "./type-id.js";
import { Type } from "./type.js";

export interface Context {
  elements: ContextElement[];
}

export function newContext(): Context {
  return { elements: [] };
}

export function cloneContext(context: Context): Context {
  return {
    elements: [...context.elements],
  };
}

export function commitContext(
  context: Context,
  contextToCommit: Context,
): void {
  context.elements = [...contextToCommit.elements];
}

export function pushElement(context: Context, element: ContextElement): void {
  context.elements.push(element);
}

export function pushTypeVariable(context: Context, id: TypeId): void {
  pushElement(context, { kind: "element:variable", id });
}

export function findVariableType(
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
