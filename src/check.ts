import { applyContext } from "./apply-context.js";
import { inChildScope } from "./child-scope.js";
import {
  makeAnnotationElement,
  makeVariableElement,
} from "./context-element.js";
import {
  cloneContext,
  commitContext,
  Context,
  pushElement,
} from "./context.js";
import { Expression } from "./expression.js";
import { isSubtype } from "./subtype.js";
import { synthesize } from "./synthesize.js";
import { Type } from "./type.js";

// Checks an expression against a specified type.
//
// If the expression checks, it may also modify the passed-in context to include additional
// placeholder definitions.
export function check(
  context: Context,
  type: Type,
  expression: Expression,
): boolean {
  // `void` is of type `void`.
  if (expression.kind === "expression:void" && type.kind === "void") {
    return true;
  }

  // An expression checks against `ForAll a. A` if it checks against `A` after defining `a` in the
  // context.
  if (type.kind === "forall") {
    const childContext = cloneContext(context);

    // We enter a special scope to investigate the forall variable. At the end, the newly pushed
    // variable and any other additions that are added will be discarded, but modifications to
    // the rest of the context will be retained.
    const success = inChildScope(childContext, () => {
      pushElement(childContext, makeVariableElement(type.quantifiedName));
      return check(childContext, type.body, expression);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  // A lambda checks against a function type `A -> B` if we set the type of the argument to `A` and
  // the expression checks against `B`.
  if (expression.kind === "expression:lambda" && type.kind === "function") {
    const childContext = cloneContext(context);

    // We enter a special scope to investigate the body of the lambda. At the end, the newly pushed
    // annotation and any other additions that are added will be discarded, but modifications to
    // the rest of the context will be retained.
    const success = inChildScope(childContext, () => {
      pushElement(
        childContext,
        makeAnnotationElement(expression.argumentId, type.parameter),
      );
      return check(childContext, type.result, expression.expression);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  // Synthesize the type of the expression, and check whether that type is a subtype of the given
  // one.
  if (true) {
    const childContext = cloneContext(context);
    const rawSynthesizedType = synthesize(childContext, expression);
    if (rawSynthesizedType === undefined) {
      return false;
    }
    const synthesizedType = applyContext(childContext, rawSynthesizedType);
    const updatedType = applyContext(childContext, type);
    if (isSubtype(childContext, synthesizedType, updatedType)) {
      commitContext(context, childContext);
      return true;
    }
  }

  return false;
}
