import { Context, placeholderSolution } from "./context.js";
import { Type } from "./type.js";

export function applyContext(context: Context, type: Type): Type {
  if (type.kind === "variable") {
    return type;
  } else if (type.kind === "void") {
    return type;
  } else if (type.kind === "placeholder") {
    // TODO: This probably needs to be done recursively in case the placeholder solution includes
    // other placeholders?
    (undefined as unknown as () => {})();

    const substitute = placeholderSolution(context, type);
    // If there is no solution, there should be an unsolved entry in the context, but this doesn't
    // help us. We just assume it is there.
    return substitute ?? type;
  } else if (type.kind === "forall") {
    return {
      ...type,
      body: applyContext(context, type.body),
    };
  } else if (type.kind === "function") {
    return {
      kind: "function",
      parameter: applyContext(context, type.parameter),
      result: applyContext(context, type.result),
    };
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}
