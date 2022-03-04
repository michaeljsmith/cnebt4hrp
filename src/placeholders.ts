import { Context } from './context.js';
import { uniqueTypeId } from './type-id.js';
import { PlaceholderType, Type } from './type.js';

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
