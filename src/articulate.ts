import { Context } from "./context/context.js";
import {
  findPlaceholderIndex,
  placeholderElement,
  solvePlaceholder,
} from "./context/placeholders.js";
import { makeFunctionType, newPlaceholder, PlaceholderType } from "./types/type.js";

// Introduces two new placeholders to represent the input and output of a function, and define the
// given placeholder to be that function type.
//
// The new parameters are just to the left of the existing placeholder, so that:
//   - they are in scope for the placeholder to refer to them.
//   - they are to the right of the marker that separates the scope of the placeholder, so that
//     when the placeholder goes out of scope they will be taken out too.
export function articulatePlaceholder(
  context: Context,
  placeholder: PlaceholderType,
): { parameterType: PlaceholderType; resultType: PlaceholderType } {
  const resultType = introduceArticulatingPlaceholder(
    "-result",
    context,
    placeholder,
  );
  const parameterType = introduceArticulatingPlaceholder(
    "-param",
    context,
    placeholder,
  );
  solvePlaceholder(
    context,
    placeholder,
    makeFunctionType(parameterType, resultType),
  );
  return { parameterType, resultType };
}

function introduceArticulatingPlaceholder(
  labelSuffix: string,
  context: Context,
  existingPlaceholder: PlaceholderType,
): PlaceholderType {
  const placeholder = newPlaceholder(
    existingPlaceholder.id.label + labelSuffix,
  );
  insertPlaceholderBeforePlaceholder(context, placeholder, existingPlaceholder);
  return placeholder;
}

function insertPlaceholderBeforePlaceholder(
  context: Context,
  placeholder: PlaceholderType,
  position: PlaceholderType,
): void {
  const index = findPlaceholderIndex(context, position);
  context.elements.splice(index, 0, placeholderElement(placeholder));
}
