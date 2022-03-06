import { TypeVariable } from "../types/type.js";
import { Context, pushElement } from "./context.js";

export function declareTypeVariable(
  context: Context,
  typeVariable: TypeVariable,
): void {
  pushElement(context, { kind: "element:variable", id: typeVariable.id });
}

export function typeVariableDeclared(
  context: Context,
  type: TypeVariable,
): boolean {
  for (const element of context.elements) {
    if (
      element.kind === "element:variable" &&
      element.id.uniqueId === type.id.uniqueId
    ) {
      return true;
    }
  }
  return false;
}
