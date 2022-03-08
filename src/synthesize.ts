import { check } from "./check.js";
import { applyContext } from "./context/apply-context.js";
import { inChildScope } from "./context/child-scope.js";
import { cloneContext, commitContext, Context } from "./context/context.js";
import { introducePlaceholder } from "./context/placeholders.js";
import { bindType, lookupBindingType } from "./context/type-bindings.js";
import { typeWellFormed } from "./context/type-well-formed.js";
import { Expression } from "./expressions/expression.js";
import { synthesizeApplication } from "./synthesize-application.js";
import { makeFunctionType, Type, unit } from "./types/type.js";

// Determines the type of an expression.
//
// If successful, it may also modify the passed-in context to include additional placeholder
// definitions.
export function synthesize(
  context: Context,
  expression: Expression,
): Type | undefined {
  if (expression.kind === "expression:void") {
    return unit;
  } else if (expression.kind === "expression:annotation") {
    // If the expression has a type annotation, check whether the expression checks against that
    // type, and if so return it.
    if (!typeWellFormed(context, expression.annotation)) {
      // TODO: Report to user that their annotation is invalid.
      throw new Error("Ill-formed annotation");
    }

    const childContext = cloneContext(context);
    if (!check(childContext, expression.annotation, expression.expression)) {
      // TODO: Report error to user.
      throw new Error("Typecheck error against annotation");
    }

    commitContext(context, childContext);
    return expression.annotation;
  } else if (expression.kind === "expression:reference") {
    // If the expression is a reference, check whether the context contains a type for the
    // variable.
    return lookupBindingType(context, expression.id);
  } else if (expression.kind === "expression:lambda") {
    // If the expression is a lambda, the result will be a function type, but we need to determine
    // the argument and result. To do so, we add two new placeholders, as well as an annotation
    // giving the type of the argument. We then typecheck the body of the lambda against the result
    // placeholder, resulting in both the placeholders being instantiated. We then discard the
    // annotation element and everything after it, but leave the two placeholders as they appear in
    // the resulting type.
    const childContext = cloneContext(context);
    const argumentPlaceholder = introducePlaceholder(
      childContext,
      expression.argumentId.label,
    );
    const resultPlaceholder = introducePlaceholder(
      childContext,
      expression.argumentId.label + "-result",
    );
    const success = inChildScope(childContext, () => {
      bindType(childContext, expression.argumentId, argumentPlaceholder);
      return check(childContext, resultPlaceholder, expression.expression);
    });
    if (success) {
      commitContext(context, childContext);
      return makeFunctionType(argumentPlaceholder, resultPlaceholder);
    }
    return undefined;
  } else if (expression.kind === "expression:application") {
    const childContext = cloneContext(context);
    // If the expression is an application, we synthesize the function type, then synthesize the
    // result of applying the type, making sure to apply the intermediate context to the types
    // before doing so.
    const functionType = synthesize(childContext, expression.fn);
    if (functionType === undefined) {
      return undefined;
    }

    const resultType = synthesizeApplication(
      childContext,
      applyContext(childContext, functionType),
      expression.arg,
    );

    if (resultType !== undefined) {
      commitContext(context, childContext);
    }
    return resultType;
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(expression));
  }
}
