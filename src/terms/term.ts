import { Type } from "../types/type.js";
import { BindingId, uniqueBindingId } from "./binding-id.js";

export type Term =
  | AnnotationTerm
  | VoidTerm
  | ReferenceTerm
  | LambdaTerm
  | ApplicationTerm;

export interface AnnotationTerm {
  kind: "term:annotation";
  term: Term;
  annotation: Type;
}

export function makeAnnotation(term: Term, annotation: Type): AnnotationTerm {
  return {
    kind: "term:annotation",
    term,
    annotation,
  };
}

export interface VoidTerm {
  kind: "term:void";
}

export const void_: VoidTerm = { kind: "term:void" };

export interface ReferenceTerm {
  kind: "term:reference";
  id: BindingId;
}

export function makeReference(id: BindingId): ReferenceTerm {
  return {
    kind: "term:reference",
    id,
  };
}

export interface LambdaTerm {
  kind: "term:lambda";
  argumentId: BindingId;
  term: Term;
}

export function makeLambda(argumentId: BindingId, term: Term): LambdaTerm {
  return {
    kind: "term:lambda",
    argumentId,
    term,
  };
}

export function newLambda(
  argLabel: string,
  fn: (arg: Term) => Term,
): LambdaTerm {
  const bindingId = uniqueBindingId(argLabel);
  const body = fn(makeReference(bindingId));
  return makeLambda(bindingId, body);
}

export interface ApplicationTerm {
  kind: "term:application";
  fn: Term;
  arg: Term;
}

export function makeApplication(fn: Term, arg: Term): ApplicationTerm {
  return {
    kind: "term:application",
    fn,
    arg,
  };
}
