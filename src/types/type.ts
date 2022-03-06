import { TypeId, uniqueTypeId } from "./type-id.js";

export type Type =
  | TypeVariable
  | PlaceholderType
  | VoidType
  | ForAllType
  | FunctionType;

export interface VoidType {
  readonly kind: "void";
}

export const Void: VoidType = { kind: "void" };

export interface BaseNamedType {
  readonly id: TypeId;
}

export interface TypeVariable extends BaseNamedType {
  readonly kind: "variable";
}

export function makeTypeVariable(id: TypeId): TypeVariable {
  return {
    kind: "variable",
    id,
  };
}

export interface PlaceholderType extends BaseNamedType {
  readonly kind: "placeholder";
}

export function newPlaceholder(label: string): PlaceholderType {
  return {
    kind: "placeholder",
    id: uniqueTypeId(label),
  };
}

export interface ForAllType {
  readonly kind: "forall";
  readonly quantifiedName: TypeId;
  readonly body: Type;
}

export function makeForAllType(quantifiedName: TypeId, body: Type): ForAllType {
  return {
    kind: "forall",
    quantifiedName,
    body,
  };
}

export interface FunctionType {
  readonly kind: "function";
  readonly parameter: Type;
  readonly result: Type;
}

export function makeFunctionType(parameter: Type, result: Type): FunctionType {
  return {
    kind: "function",
    parameter,
    result,
  };
}
