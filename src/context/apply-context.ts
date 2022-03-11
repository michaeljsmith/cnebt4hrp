import { Type } from "../types/type.js";
import { Context } from "./context.js";
import { placeholderSolution } from "./placeholders.js";

export function applyContext(context: Context, type: Type): Type {
  if (type.kind === "type:variable") {
    return type;
  } else if (type.kind === "type:void") {
    return type;
  } else if (type.kind === "type:placeholder") {
    const substitute = placeholderSolution(context, type);
    // Recurse in case we have been bound to another placeholder.
    //
    // If there is no solution, there should be an unsolved entry in the context, but this doesn't
    // help us. We just assume it is there.
    return substitute ? applyContext(context, substitute) : type;
  } else if (type.kind === "type:forall") {
    return {
      ...type,
      body: applyContext(context, type.body),
    };
  } else if (type.kind === "type:function") {
    return {
      kind: "type:function",
      parameter: applyContext(context, type.parameter),
      result: applyContext(context, type.result),
    };
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}
