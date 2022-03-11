import { PlaceholderType, Type } from "./type.js";

export function typeReferences(
  type: Type,
  placeholder: PlaceholderType,
): boolean {
  if (type.kind === "type:void") {
    return false;
  } else if (type.kind === "type:variable") {
    return false;
  } else if (type.kind === "type:placeholder") {
    return type.id.uniqueId === placeholder.id.uniqueId;
  } else if (type.kind === "type:function") {
    return (
      typeReferences(type.parameter, placeholder) ||
      typeReferences(type.result, placeholder)
    );
  } else if (type.kind === "type:forall") {
    return typeReferences(type.body, placeholder);
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}
