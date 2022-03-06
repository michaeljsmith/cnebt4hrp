import { Type } from "../types/type.js";
import { BindingId } from "./binding-id.js";

export type Expression =
  | AnnotationExpression
  | VoidExpression
  | ReferenceExpression
  | LambdaExpression
  | ApplicationExpression;

export interface AnnotationExpression {
  kind: "expression:annotation";
  expression: Expression;
  annotation: Type;
}

export function makeAnnotationExpression(
  expression: Expression,
  annotation: Type,
): AnnotationExpression {
  return {
    kind: "expression:annotation",
    expression,
    annotation,
  };
}

export interface VoidExpression {
  kind: "expression:void";
}

export const _void: VoidExpression = { kind: "expression:void" };

export interface ReferenceExpression {
  kind: "expression:reference";
  id: BindingId;
}

export function makeReferenceExpression(id: BindingId): ReferenceExpression {
  return {
    kind: "expression:reference",
    id,
  };
}

export interface LambdaExpression {
  kind: "expression:lambda";
  argumentId: BindingId;
  expression: Expression;
}

export function makeLambda(
  argumentId: BindingId,
  expression: Expression,
): LambdaExpression {
  return {
    kind: "expression:lambda",
    argumentId,
    expression,
  };
}

export interface ApplicationExpression {
  kind: "expression:application";
  fn: Expression;
  arg: Expression;
}

export function makeApplication(
  fn: Expression,
  arg: Expression,
): ApplicationExpression {
  return {
    kind: "expression:application",
    fn,
    arg,
  };
}
