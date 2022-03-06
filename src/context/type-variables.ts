import { TypeId } from "../types/type-id.js";
import { makeTypeVariable, TypeVariable } from "../types/type.js";
import { Context, pushElement } from "./context.js";

export function pushTypeVariable(
  context: Context,
  typeVariable: TypeVariable,
): void {
  pushElement(context, { kind: "element:variable", id: typeVariable.id });
}

export function declareTypeVariable(
  context: Context,
  typeId: TypeId,
): TypeVariable {
  const typeVariable = makeTypeVariable(typeId);
  pushTypeVariable(context, typeVariable);
  return typeVariable;
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
