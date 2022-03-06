import { PlaceholderType, Type } from "./type.js";

export function typeReferences(
  type: Type,
  placeholder: PlaceholderType,
): boolean {
  if (type.kind === "void") {
    return false;
  } else if (type.kind === "variable") {
    return false;
  } else if (type.kind === "placeholder") {
    return type.id.uniqueId === placeholder.id.uniqueId;
  } else if (type.kind === "function") {
    return (
      typeReferences(type.parameter, placeholder) ||
      typeReferences(type.result, placeholder)
    );
  } else if (type.kind === "forall") {
    return typeReferences(type.body, placeholder);
  } else {
    throw new Error("Unreachable " + ((x: never) => x)(type));
  }
}
