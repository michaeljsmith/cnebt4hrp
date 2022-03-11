import { TypeId } from "./type-id.js";
import {
  makeForAllType,
  makeFunctionType,
  PlaceholderType,
  Type,
} from "./type.js";

export function substituteTypeReferences(
  type: Type,
  existingVariableId: TypeId,
  newVariable: PlaceholderType,
): Type {
  const recurse = (t: Type) =>
    substituteTypeReferences(t, existingVariableId, newVariable);

  if (type.kind === "type:void" || type.kind === "type:placeholder") {
    return type;
  } else if (type.kind === "type:variable") {
    return type.id.uniqueId === existingVariableId.uniqueId
      ? newVariable
      : type;
  } else if (type.kind === "type:function") {
    return makeFunctionType(recurse(type.parameter), recurse(type.result));
  } else if (type.kind === "type:forall") {
    return makeForAllType(type.quantifiedName, recurse(type.body));
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}
