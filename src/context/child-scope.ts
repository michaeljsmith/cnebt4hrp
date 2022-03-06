import { MarkerElement, newMarkerElement } from "./context-element.js";
import { Context, pushElement } from "./context.js";

// Executes `fn` inside a new child scope.
//
// In the new scope, existing variables remain defined. The function is free to define new
// variables in the scope, and to define them to contain values. After `fn` completes, all new
// variables will be discarded.
//
// *However*, any changes to pre-defined variables will be retained.
export function inChildScope<T>(context: Context, fn: () => T): T {
  const marker = enterForAllScope(context);
  try {
    return fn();
  } finally {
    exitForAllScope(context, marker);
  }
}

function enterForAllScope(context: Context): MarkerElement {
  // Add a marker to the context so we can remove everything from this point later on.
  // TODO: Can we keep the new array separate from the old one so we don't need this mechanism?
  const marker = newMarkerElement();
  pushElement(context, marker);
  return marker;
}

function exitForAllScope(context: Context, marker: MarkerElement): void {
  // Find the marker and remove it and everything after it.
  const markerPosition = findMarkerIndex(context, marker.id);
  context.elements.splice(markerPosition);
}

// TODO: Remove marker mechanism, so each typeID is referred to only once in context.
// In that case, we wouldn't need separate search functions.
function maybeFindMarkerIndex(
  context: Context,
  id: number,
): number | undefined {
  const index = context.elements.findIndex(
    (element) => element.kind === "element:marker" && element.id === id,
  );
  return index == -1 ? undefined : index;
}

function findMarkerIndex(context: Context, id: number): number {
  const index = maybeFindMarkerIndex(context, id);
  if (index === undefined) {
    throw new Error("Marker missing");
  }

  return index;
}
