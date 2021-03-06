import { TypeId, uniqueTypeId } from "./type-id.js";

export type Type =
  | TypeVariable
  | PlaceholderType
  | VoidType
  | ForAllType
  | FunctionType;

export interface VoidType {
  readonly kind: "type:void";
}

export const voidType: VoidType = { kind: "type:void" };

export interface BaseNamedType {
  readonly id: TypeId;
}

export interface TypeVariable extends BaseNamedType {
  readonly kind: "type:variable";
}

export function makeTypeVariable(id: TypeId): TypeVariable {
  return {
    kind: "type:variable",
    id,
  };
}

export interface PlaceholderType extends BaseNamedType {
  readonly kind: "type:placeholder";
}

export function newPlaceholder(label: string): PlaceholderType {
  return {
    kind: "type:placeholder",
    id: uniqueTypeId(label),
  };
}

export interface ForAllType {
  readonly kind: "type:forall";
  readonly quantifiedName: TypeId;
  readonly body: Type;
}

export function makeForAllType(quantifiedName: TypeId, body: Type): ForAllType {
  return {
    kind: "type:forall",
    quantifiedName,
    body,
  };
}

export function newForAllType(
  label: string,
  fn: (quantifiedVariable: TypeVariable) => Type,
): ForAllType {
  const quantifiedName = uniqueTypeId(label);
  const quantifiedVariable = makeTypeVariable(quantifiedName);
  const universalBody = fn(quantifiedVariable);
  return makeForAllType(quantifiedName, universalBody);
}

export interface FunctionType {
  readonly kind: "type:function";
  readonly parameter: Type;
  readonly result: Type;
}

export function makeFunctionType(parameter: Type, result: Type): FunctionType {
  return {
    kind: "type:function",
    parameter,
    result,
  };
}
