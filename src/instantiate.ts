import { applyContext } from "./apply-context.js";
import { articulatePlaceholder } from "./articulate.js";
import { inChildScope } from "./child-scope.js";
import {
  makePlaceholderElement,
  makeVariableElement,
} from "./context-element.js";
import {
  cloneContext,
  commitContext,
  Context,
  discardPlaceholderAndFollowing,
  newPlaceholder,
  pushElement,
  solve,
} from "./context.js";
import { substituteTypeReferences } from "./substitute-type-references.js";
import { typeWellFormed } from "./type-well-formed.js";
import { FunctionType, PlaceholderType, Type } from "./type.js";

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

  if (type.kind === "function") {
    instantiateFunction("contravariant", context, placeholder, type);
  } else if (type.kind === "forall") {
    const childContext = cloneContext(context);
    // For A to be a supertype of (ForAll b. B), there needs to be at least one value of b for
    // which B < A. To find this value, we declare a new placeholder and instantiate that against B.
    //
    // The new placeholder is created inside a scope, so that it and any other new placeholders
    // are discarded at the end of the process. However any changes made to existing placeholders
    // are retained.
    const success = inChildScope(childContext, () => {
      const childPlaceholder = newPlaceholder(type.quantifiedName.label);
      pushElement(childContext, makePlaceholderElement(childPlaceholder.id));

      // Substitute the placeholder for the quantified variable in the quantified expression.
      const updatedBody = substituteTypeReferences(
        type.body,
        type.quantifiedName,
        childPlaceholder,
      );

      return instantiateSupertype(childContext, childPlaceholder, updatedBody);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  return false;
}

function maybeInstantiateIfMonotype(
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
      solve(context, placeholder, type);
      return true;
    } else if (type.kind === "placeholder") {
      // We cannot instantiate to the type, because the type is itself a placeholder which is
      // defined *afterwards*. Instead, we define the *type* (which is a placeholder) to be equal
      // to the *placeholder*.
      solve(context, type, placeholder);
      return true;
    }
  }

  return false;
}

function instantiateFunction(
  variance: "covariant" | "contravariant",
  context: Context,
  placeholder: PlaceholderType,
  type: FunctionType,
): boolean {
  const childContext = cloneContext(context);
  // Since we are instantiating a function, we need to choose a solution of the form `a -> b`.
  // To do this, we create two new placeholders to represent the input and output of the
  // function, and define the placeholder to be a function type consisting of those.
  //
  // We then recursively instantiate the new parameters - the return type covariantly, the
  // parameter type contravariantly.
  const { parameterType, resultType } = articulatePlaceholder(
    childContext,
    placeholder,
  );

  // Select the functions for instantiating the children based on the passed-in variance.
  const [instantiateParameter, instantiateResult] =
    variance === "covariant"
      ? [instantiateSupertype, instantiateSubtype]
      : [instantiateSubtype, instantiateSupertype];

  // Instantiate the new placeholders recursively.
  if (!instantiateParameter(childContext, parameterType, type.parameter)) {
    return false;
  }

  // Apply the results of the first instantiation (in terms of defined placeholders), to the
  // second type before proceeding.
  const appliedResult = applyContext(childContext, type.result);
  const success = instantiateResult(childContext, resultType, appliedResult);
  if (success) {
    commitContext(context, childContext);
  }
  return success;
}
