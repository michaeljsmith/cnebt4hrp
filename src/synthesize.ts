import { check } from "./check.js";
import { applyContext } from "./context/apply-context.js";
import { inChildScope } from "./context/child-scope.js";
import { cloneContext, commitContext, Context } from "./context/context.js";
import { introducePlaceholder } from "./context/placeholders.js";
import { bindType, lookupBindingType } from "./context/type-bindings.js";
import { typeWellFormed } from "./context/type-well-formed.js";
import { synthesizeApplication } from "./synthesize-application.js";
import { Term } from "./terms/term.js";
import { makeFunctionType, Type, voidType } from "./types/type.js";

// Determines the type of an term.
//
// If successful, it may also modify the passed-in context to include additional placeholder
// definitions.
export function synthesize(context: Context, term: Term): Type | undefined {
  if (term.kind === "term:void") {
    return voidType;
  } else if (term.kind === "term:annotation") {
    // If the term has a type annotation, check whether the term checks against that
    // type, and if so return it.
    if (!typeWellFormed(context, term.annotation)) {
      // TODO: Report to user that their annotation is invalid.
      return undefined;
    }

    const childContext = cloneContext(context);
    if (!check(childContext, term.annotation, term.term)) {
      // TODO: Report error to user.
      return undefined;
    }

    commitContext(context, childContext);
    return term.annotation;
  } else if (term.kind === "term:reference") {
    // If the term is a reference, check whether the context contains a type for the
    // variable.
    return lookupBindingType(context, term.id);
  } else if (term.kind === "term:lambda") {
    // If the term is a lambda, the result will be a function type, but we need to determine
    // the argument and result. To do so, we add two new placeholders, as well as an annotation
    // giving the type of the argument. We then typecheck the body of the lambda against the result
    // placeholder, resulting in both the placeholders being instantiated. We then discard the
    // annotation element and everything after it, but leave the two placeholders as they appear in
    // the resulting type.
    const childContext = cloneContext(context);
    const argumentPlaceholder = introducePlaceholder(
      childContext,
      term.argumentId.label + "-param",
    );
    const resultPlaceholder = introducePlaceholder(
      childContext,
      term.argumentId.label + "-result",
    );
    const success = inChildScope(childContext, () => {
      bindType(childContext, term.argumentId, argumentPlaceholder);
      return check(childContext, resultPlaceholder, term.term);
    });
    if (success) {
      commitContext(context, childContext);
      return makeFunctionType(argumentPlaceholder, resultPlaceholder);
    }
    return undefined;
  } else if (term.kind === "term:application") {
    const childContext = cloneContext(context);
    // If the term is an application, we synthesize the function type, then synthesize the
    // result of applying the type, making sure to apply the intermediate context to the types
    // before doing so.
    const functionType = synthesize(childContext, term.fn);
    if (functionType === undefined) {
      return undefined;
    }

    const resultType = synthesizeApplication(
      childContext,
      applyContext(childContext, functionType),
      term.arg,
    );

    if (resultType !== undefined) {
      commitContext(context, childContext);
    }
    return resultType;
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(term));
  }
}
