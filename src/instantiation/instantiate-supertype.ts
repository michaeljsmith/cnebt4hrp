import { inChildScope } from "../context/child-scope.js";
import { cloneContext, commitContext, Context } from "../context/context.js";
import { introducePlaceholder } from "../context/placeholders.js";
import { substituteTypeReferences } from "../types/substitute-type-references.js";
import { PlaceholderType, Type } from "../types/type.js";
import { instantiateFunction } from "./instantiate-function.js";
import { maybeInstantiateIfMonotype } from "./instantiate-monotype.js";

// Tries to resolve a placeholder type to a monotype that is well-formed in the context, which is
// a subtype of the given type.
//
// On exit, the solved monotype should be in the context.

export function instantiateSupertype(
  context: Context,
  placeholder: PlaceholderType,
  type: Type,
): boolean {
  if (maybeInstantiateIfMonotype(context, placeholder, type)) {
    return true;
  }

  if (type.kind === "type:function") {
    return instantiateFunction("contravariant", context, placeholder, type);
  } else if (type.kind === "type:forall") {
    const childContext = cloneContext(context);
    // For A to be a supertype of (ForAll b. B), there needs to be at least one value of b for
    // which B < A. To find this value, we declare a new placeholder and instantiate that against B.
    //
    // The new placeholder is created inside a scope, so that it and any other new placeholders
    // are discarded at the end of the process. However any changes made to existing placeholders
    // are retained.
    const success = inChildScope(childContext, () => {
      const childPlaceholder = introducePlaceholder(
        childContext,
        type.quantifiedName.label,
      );

      // Substitute the placeholder for the quantified variable in the quantified term.
      const updatedBody = substituteTypeReferences(
        type.body,
        type.quantifiedName,
        childPlaceholder,
      );

      return instantiateSupertype(childContext, placeholder, updatedBody);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  return false;
}
