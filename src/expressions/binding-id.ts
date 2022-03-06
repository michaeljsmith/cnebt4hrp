export interface BindingId {
  __brand: "BindingId";
  uniqueId: number;
  label: string;
}

function asBindingId(input: Omit<BindingId, "__brand">): BindingId {
  return input as BindingId;
}

let nextId = 101;
export function uniqueBindingId(label: string): BindingId {
  return asBindingId({
    uniqueId: nextId++,
    label,
  });
}
