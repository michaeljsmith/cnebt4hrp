import { makeTypeVariable, PlaceholderType, Type } from "../types/type.js";
import { cloneContext, Context } from "./context.js";
import { declareTypeVariable, typeVariableDeclared } from "./type-variables.js";

export function typeWellFormed(context: Context, type: Type): boolean {
  if (type.kind === "variable") {
    return typeVariableDeclared(context, type);
  } else if (type.kind === "placeholder") {
    return contextContainsPlaceholderType(context, type);
  } else if (type.kind === "void") {
    return true;
  } else if (type.kind === "function") {
    return (
      typeWellFormed(context, type.parameter) &&
      typeWellFormed(context, type.result)
    );
  } else if (type.kind === "forall") {
    const childContext = cloneContext(context);
    declareTypeVariable(childContext, makeTypeVariable(type.quantifiedName));
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
