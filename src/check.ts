import { applyContext } from "./context/apply-context.js";
import { inChildScope } from "./context/child-scope.js";
import { cloneContext, commitContext, Context } from "./context/context.js";
import { bindType } from "./context/type-bindings.js";
import { declareTypeVariable } from "./context/type-variables.js";
import { isSubtype } from "./subtype.js";
import { synthesize } from "./synthesize.js";
import { Term } from "./terms/term.js";
import { Type } from "./types/type.js";

// Checks a term against a specified type.
//
// If the term checks, it may also modify the passed-in context to include additional
// placeholder definitions.
export function check(context: Context, type: Type, term: Term): boolean {
  // `void` is of type `void`.
  if (term.kind === "term:void" && type.kind === "type:void") {
    return true;
  }

  // An term checks against `ForAll a. A` if it checks against `A` after defining `a` in the
  // context.
  if (type.kind === "type:forall") {
    const childContext = cloneContext(context);

    // We enter a special scope to investigate the forall variable. At the end, the newly pushed
    // variable and any other additions that are added will be discarded, but modifications to
    // the rest of the context will be retained.
    const success = inChildScope(childContext, () => {
      declareTypeVariable(childContext, type.quantifiedName);
      return check(childContext, type.body, term);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  // A lambda checks against a function type `A -> B` if we set the type of the argument to `A` and
  // the term checks against `B`.
  if (term.kind === "term:lambda" && type.kind === "type:function") {
    const childContext = cloneContext(context);

    // We enter a special scope to investigate the body of the lambda. At the end, the newly pushed
    // annotation and any other additions that are added will be discarded, but modifications to
    // the rest of the context will be retained.
    const success = inChildScope(childContext, () => {
      bindType(childContext, term.argumentId, type.parameter);
      return check(childContext, type.result, term.term);
    });
    if (success) {
      commitContext(context, childContext);
      return true;
    }
  }

  // Synthesize the type of the term, and check whether that type is a subtype of the given
  // one.
  if (true) {
    const childContext = cloneContext(context);
    const rawSynthesizedType = synthesize(childContext, term);
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
