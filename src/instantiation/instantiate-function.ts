import { articulatePlaceholder } from "../articulate.js";
import { applyContext } from "../context/apply-context.js";
import { cloneContext, commitContext, Context } from "../context/context.js";
import { FunctionType, PlaceholderType } from "../types/type.js";
import { instantiateSubtype } from "./instantiate-subtype.js";
import { instantiateSupertype } from "./instantiate-supertype.js";

export function instantiateFunction(
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
