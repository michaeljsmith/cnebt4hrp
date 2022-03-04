import { BindingId } from "./binding-id.js";
import { ContextElement } from "./context-element.js";
import { TypeId, uniqueTypeId } from "./type-id.js";
import { PlaceholderType, Type } from "./type.js";

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

function maybeFindPlaceholderIndex(
  context: Context,
  placeholder: PlaceholderType,
): number | undefined {
  const index = context.elements.findIndex(
    (element) =>
      element.kind === "element:placeholder" &&
      element.id.uniqueId === placeholder.id.uniqueId,
  );
  return index == -1 ? undefined : index;
}

export function findPlaceholderIndex(
  context: Context,
  placeholder: PlaceholderType,
): number {
  const index = maybeFindPlaceholderIndex(context, placeholder);
  if (index === undefined) {
    throw new Error("Placeholder missing");
  }

  return index;
}

export function solve(
  context: Context,
  placeholder: PlaceholderType,
  type: Type,
): void {
  const index = findPlaceholderIndex(context, placeholder);
  context.elements[index] = {
    kind: "element:solved-placeholder",
    id: placeholder.id,
    type,
  };
}

export function insertBeforePlaceholder(
  context: Context,
  element: ContextElement,
  position: PlaceholderType,
): void {
  const index = findPlaceholderIndex(context, position);
  context.elements.splice(index, 0, element);
}

export function newPlaceholder(label: string): PlaceholderType {
  return {
    kind: "placeholder",
    id: uniqueTypeId(label),
  };
}

export function placeholderSolution(
  context: Context,
  placeholder: PlaceholderType,
): Type | undefined {
  for (const element of context.elements) {
    if (
      element.kind === "element:solved-placeholder" &&
      element.id.uniqueId === placeholder.id.uniqueId
    ) {
      return element.type;
    }
  }
  return undefined;
}

export function discardPlaceholderAndFollowing(
  context: Context,
  placeholder: PlaceholderType,
): void {
  const index = findPlaceholderIndex(context, placeholder);
  context.elements.splice(index);
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
