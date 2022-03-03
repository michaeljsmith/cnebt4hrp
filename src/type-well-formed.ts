import {
  Context,
  contextContainsTypeVariable,
  contextContainsPlaceholderType,
  pushTypeVariable,
  cloneContext,
} from "./context.js";
import { Type } from "./type.js";

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
    return typeWellFormed(childContext, type);
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}
