import { BindingId } from "../expressions/binding-id.js";
import { TypeId } from "../types/type-id.js";
import { Type } from "../types/type.js";

export type ContextElement =
  | VariableElement
  | AnnotationElement
  | PlaceholderElement
  | SolvedPlaceholderElement
  | MarkerElement;

interface BaseNamedElement {
  readonly id: TypeId;
}

export interface VariableElement extends BaseNamedElement {
  readonly kind: "element:variable";
}

export function makeVariableElement(id: TypeId): VariableElement {
  return {
    kind: "element:variable",
    id,
  };
}

export interface AnnotationElement {
  readonly kind: "element:annotation";
  readonly bindingId: BindingId;
  readonly type: Type;
}

export function makeAnnotationElement(
  bindingId: BindingId,
  type: Type,
): AnnotationElement {
  return {
    kind: "element:annotation",
    bindingId,
    type,
  };
}

export interface PlaceholderElement extends BaseNamedElement {
  readonly kind: "element:placeholder";
}

export function makePlaceholderElement(id: TypeId): PlaceholderElement {
  return {
    kind: "element:placeholder",
    id,
  };
}

export interface SolvedPlaceholderElement extends BaseNamedElement {
  readonly kind: "element:solved-placeholder";
  readonly type: Type;
}

export interface MarkerElement {
  readonly kind: "element:marker";
  id: number;
}

let nextMarkerId = 1001;
export function newMarkerElement(): MarkerElement {
  return {
    kind: "element:marker",
    id: nextMarkerId++,
  };
}
