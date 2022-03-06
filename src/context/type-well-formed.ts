import {
  Context,
  pushTypeVariable,
  cloneContext,
} from "./context.js";
import { PlaceholderType, Type, TypeVariable } from "../types/type.js";

export function typeWellFormed(context: Context, type: Type): boolean {
  if (type.kind === "variable") {
    return contextContainsTypeVariable(context, type);
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
    pushTypeVariable(childContext, type.quantifiedName);
    return typeWellFormed(childContext, type.body);
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}

function contextContainsTypeVariable(
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
