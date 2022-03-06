import { cloneContext, Context } from "../context/context.js";
import {
  findPlaceholderIndex,
  solvePlaceholder,
} from "../context/placeholders.js";
import { typeWellFormed } from "../context/type-well-formed.js";
import { PlaceholderType, Type } from "../types/type.js";

export function maybeInstantiateIfMonotype(
  context: Context,
  placeholder: PlaceholderType,
  type: Type,
): boolean {
  // Check whether type is a monotype.
  if (type.kind !== "forall") {
    // Instantiate placeholders to monotypes directly, if the type is well-formed prior to the
    // definition of the placeholder.
    const childContext = cloneContext(context);
    discardPlaceholderAndFollowing(childContext, placeholder);
    const canInstantiate = typeWellFormed(childContext, type);

    if (canInstantiate) {
      solvePlaceholder(context, placeholder, type);
      return true;
    } else if (type.kind === "placeholder") {
      // We cannot instantiate to the type, because the type is itself a placeholder which is
      // defined *afterwards*. Instead, we define the *type* (which is a placeholder) to be equal
      // to the *placeholder*.
      solvePlaceholder(context, type, placeholder);
      return true;
    }
  }

  return false;
}

function discardPlaceholderAndFollowing(
  context: Context,
  placeholder: PlaceholderType,
): void {
  const index = findPlaceholderIndex(context, placeholder);
  context.elements.splice(index);
}
