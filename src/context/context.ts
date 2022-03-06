import { TypeId } from "../types/type-id.js";
import { ContextElement } from "./context-element.js";

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
