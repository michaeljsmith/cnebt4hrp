import { articulatePlaceholder } from "./articulate.js";
import { check } from "./check.js";
import { cloneContext, commitContext, Context } from "./context/context.js";
import { introducePlaceholder } from "./context/placeholders.js";
import { Term } from "./terms/term.js";
import { substituteTypeReferences } from "./types/substitute-type-references.js";
import { Type } from "./types/type.js";

// Determines the type of a function application.
//
// If successful, it may also modify the passed-in context to include additional placeholder
// definitions.
export function synthesizeApplication(
  context: Context,
  functionType: Type,
  term: Term,
): Type | undefined {
  // If the function type is `A -> B`, and the input checks against `A`, then the result is of type
  // `B`.
  if (functionType.kind === "function") {
    const childContext = cloneContext(context);
    const success = check(childContext, functionType.parameter, term);
    if (success) {
      commitContext(context, childContext);
      return functionType.result;
    }
  }

  // If the function type is `ForAll a. A`, we need to work out the result type. To do this, we
  // introduce a placeholder variable to represent the quantified variable and then check against
  // the forall body. Doing so will result in the placeholder variable being instantiated, and
  // the return type will become apparent as a result.
  if (functionType.kind === "forall") {
    const childContext = cloneContext(context);

    // Unlike other places where placeholders are introduced, we don't discard it once it is
    // determined. This is because the function result is likely to depend on it.
    const placeholder = introducePlaceholder(
      childContext,
      functionType.quantifiedName.label,
    );

    // Substitute the placeholder for the quantified variable in the quantified term.
    const updatedFunctionType = substituteTypeReferences(
      functionType.body,
      functionType.quantifiedName,
      placeholder,
    );

    const resultType = synthesizeApplication(
      childContext,
      updatedFunctionType,
      term,
    );
    if (resultType !== undefined) {
      commitContext(context, childContext);
      return resultType;
    }
  }

  // If the function is a placeholder, we need to instantiate the placeholder to a function type.
  // However, we don't yet know the parameter or return types of the function. So we introduce
  // two new placeholders to represent them, and then update the placeholder to reference them.
  // We then typecheck against the parameter placeholder. If this succeeds, it will cause the
  // placeholder representing the return type also to be determined.
  //
  // NOTE: I honestly don't understand how this code can get called - how do we end up with a
  // placeholder in the function position? Isn't that an ill-formed type? Something like
  // `forall a. a 1`?
  if (functionType.kind === "placeholder") {
    const childContext = cloneContext(context);
    const { parameterType, resultType } = articulatePlaceholder(
      childContext,
      functionType,
    );

    // Now we check the term against the parameter type placeholder, and return the second
    // placeholder as the return type.
    if (check(childContext, parameterType, term)) {
      commitContext(context, childContext);
      return resultType;
    }
  }
}
