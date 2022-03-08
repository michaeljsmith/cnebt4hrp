import { applyContext } from "./context/apply-context.js";
import { inChildScope } from "./context/child-scope.js";
import { cloneContext, commitContext, Context } from "./context/context.js";
import { introducePlaceholder } from "./context/placeholders.js";
import { declareTypeVariable } from "./context/type-variables.js";
import { instantiateSubtype } from "./instantiation/instantiate-subtype.js";
import { instantiateSupertype } from "./instantiation/instantiate-supertype.js";
import { substituteTypeReferences } from "./types/substitute-type-references.js";
import { typeReferences } from "./types/type-references.js";
import { Type } from "./types/type.js";

// Checks whether one type is a subtype of another.
//
// If so, it may also update the passed-in context to contain additional definitions.
export function isSubtype(
  context: Context,
  subType: Type,
  superType: Type,
): boolean {
  if (
    subType.kind === "placeholder" &&
    superType.kind === "placeholder" &&
    subType.id.uniqueId === superType.id.uniqueId
  ) {
    // Placeholders are subtypes of themselves.
    return true;
  }

  if (
    subType.kind === "variable" &&
    superType.kind === "variable" &&
    subType.id.uniqueId === superType.id.uniqueId
  ) {
    // Variables are subtypes of themselves.
    return true;
  }

  if (subType.kind === "void" && superType.kind === "void") {
    // Void is a subtype of itself.
    return true;
  }

  if (subType.kind === "function" && superType.kind === "function") {
    const childContext = cloneContext(context);
    // A function type `A1 -> A2` is a subtype of another function type `B1 -> B2` if `B1 < A1`
    // and `A2 < B2`.
    const paramOk = isSubtype(
      childContext,
      superType.parameter,
      subType.parameter,
    );

    const subTypeResult = applyContext(childContext, subType.result);
    const superTypeResult = applyContext(childContext, superType.result);
    const resultOk = isSubtype(childContext, subTypeResult, superTypeResult);
    if (paramOk && resultOk) {
      commitContext(context, childContext);
      return true;
    }
  }

  if (subType.kind === "forall") {
    const childContext = cloneContext(context);

    // `ForAll a. A` is a subtype of `B` if there is any `a` for which A < B. To find this `a`, we
    // add a placeholder and then check whether `A < B`. This recursive subtyping check, if
    // successful, may define other placeholders in the context. We then discard the placeholder and
    // other variables that were added.
    const success = inChildScope(childContext, () => {
      const childPlaceholder = introducePlaceholder(
        childContext,
        subType.quantifiedName.label,
      );

      // Substitute the placeholder for the quantified variable in the quantified expression.
      const updatedBody = substituteTypeReferences(
        subType.body,
        subType.quantifiedName,
        childPlaceholder,
      );

      return isSubtype(childContext, updatedBody, superType);
    });

    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  if (superType.kind === "forall") {
    const childContext = cloneContext(context);

    // `A < ForAll b.B` if `A < B` for any value of `b`.
    //
    // To check this, we push the quantified variable into the context and then instantiate the body
    // of the forall. The quantified variable and any other new variables are then discarded.
    const success = inChildScope(childContext, () => {
      declareTypeVariable(childContext, superType.quantifiedName);
      return isSubtype(childContext, subType, superType.body);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  if (subType.kind === "placeholder" && !typeReferences(superType, subType)) {
    const childContext = cloneContext(context);
    if (instantiateSubtype(childContext, subType, superType)) {
      commitContext(context, childContext);
      return true;
    }
  }

  if (superType.kind === "placeholder" && !typeReferences(subType, superType)) {
    const childContext = cloneContext(context);
    if (instantiateSupertype(childContext, superType, subType)) {
      commitContext(context, childContext);
      return true;
    }
  }

  return false;
}
