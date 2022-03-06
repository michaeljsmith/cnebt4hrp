import { inChildScope } from "../context/child-scope.js";
import { makeVariableElement } from "../context/context-element.js";
import {
  cloneContext,
  commitContext,
  Context,
  pushElement,
} from "../context/context.js";
import { PlaceholderType, Type } from "../types/type.js";
import { instantiateFunction } from "./instantiate-function";
import { maybeInstantiateIfMonotype } from "./instantiate-monotype";

// Tries to resolve a placeholder type to a monotype that is well-formed in the context, which is
// a subtype of the given type.
//
// On exit, the solved monotype should be in the context.
export function instantiateSubtype(
  context: Context,
  placeholder: PlaceholderType,
  type: Type,
): boolean {
  if (maybeInstantiateIfMonotype(context, placeholder, type)) {
    return true;
  }

  if (type.kind === "function") {
    return instantiateFunction("covariant", context, placeholder, type);
  } else if (type.kind === "forall") {
    const childContext = cloneContext(context);
    // For A to be a subtype of (ForAll b. B), then A needs to be a subtype of B for any value of
    // b.
    //
    // To check this, we push the quantified variable into the context and then instantiate the body
    // of the forall. The quantified variable and any other new variables are then discarded.
    const success = inChildScope(childContext, () => {
      pushElement(childContext, makeVariableElement(type.quantifiedName));
      return instantiateSubtype(childContext, placeholder, type.body);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  return false;
}
