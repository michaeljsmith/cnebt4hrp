export interface TypeId {
  __brand: "TypeId";
  uniqueId: number;
  label: string;
}

function asTypeId(input: Omit<TypeId, "__brand">): TypeId {
  return input as TypeId;
}

let nextId = 101;
export function uniqueTypeId(label: string): TypeId {
  return asTypeId({
    uniqueId: nextId++,
    label,
  });
}
