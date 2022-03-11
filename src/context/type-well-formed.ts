import { PlaceholderType, Type } from "../types/type.js";
import { cloneContext, Context } from "./context.js";
import { declareTypeVariable, typeVariableDeclared } from "./type-variables.js";

export function typeWellFormed(context: Context, type: Type): boolean {
  if (type.kind === "type:variable") {
    return typeVariableDeclared(context, type);
  } else if (type.kind === "type:placeholder") {
    return contextContainsPlaceholderType(context, type);
  } else if (type.kind === "type:void") {
    return true;
  } else if (type.kind === "type:function") {
    return (
      typeWellFormed(context, type.parameter) &&
      typeWellFormed(context, type.result)
    );
  } else if (type.kind === "type:forall") {
    const childContext = cloneContext(context);
    declareTypeVariable(childContext, type.quantifiedName);
    return typeWellFormed(childContext, type.body);
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}

function contextContainsPlaceholderType(
  context: Context,
  type: PlaceholderType,
): boolean {
  for (const element of context.elements) {
    if (
      (element.kind === "element:placeholder" ||
        element.kind === "element:solved-placeholder") &&
      element.id.uniqueId === type.id.uniqueId
    ) {
      return true;
    }
  }
  return false;
}
