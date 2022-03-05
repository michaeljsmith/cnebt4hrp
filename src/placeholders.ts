import { makePlaceholderElement, PlaceholderElement } from './context-element.js';
import { Context, pushElement } from "./context.js";
import { uniqueTypeId } from "./type-id.js";
import { PlaceholderType, Type } from "./type.js";

export function maybeFindPlaceholderIndex(
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

export function solvePlaceholder(
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

export function newPlaceholder(label: string): PlaceholderType {
  return {
    kind: "placeholder",
    id: uniqueTypeId(label),
  };
}

export function placeholderElement(placeholder: PlaceholderType): PlaceholderElement {
  return makePlaceholderElement(placeholder.id);
}

export function pushPlaceholder(context: Context, placeholder: PlaceholderType): void {
  pushElement(context, placeholderElement(placeholder));
}

export function introducePlaceholder(
  context: Context,
  label: string,
): PlaceholderType {
  const placeholder = newPlaceholder(label);
  pushPlaceholder(context, placeholder);
  return placeholder;
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
