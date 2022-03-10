export function instanceOf<T>(): T {
  return undefined as unknown as T;
}

// const f: (x: string) => void =
//     instanceOf<<T>(x: T) => void>();
// Pass

// const f: (cb: <T>(x: T) => void) => void =
//   instanceOf<(cb: (x: string) => void) => void>();
// Pass

// const f: <T>(x: T, y: T) => void =
//     instanceOf<<U, V>(x: U, y: V) => void>();
// Pass

// const f: (fn: (x: string) => void) => void =
//     instanceOf<<T>(fn: (x: T) => void) => void>();
// Pass

// const f: (fn: (x: string) => void) => void =
//     instanceOf<<T>(fn: (x: T) => void) => void>();
// Pass

// const f: (x: number, fn: (x: string) => void) => void =
//     instanceOf<<T>(x: T, fn: (x: T) => void) => void>();
// Fail

// const f: (x: string, fn: <U>(x: U) => void) => void =
//     instanceOf<<T>(x: T, fn: (x: T) => void) => void>();
// Pass

// const f: (x: string, fn: (x: string) => void) => void =
//     instanceOf<<T>(x: T, fn: <U>(x: U) => void) => void>();
// Fail

// const f: (x: number, fn: (fn2: (y: string, z: number) => void) => void) => void =
//     instanceOf<<T>(x: T, fn: (fn2: (y: string, z: T) => void) => void) => void>();
// Pass

// const f: (x: number, fn: (fn2: (y: string, z: number) => void) => void) => void =
//     instanceOf<<T>(x: T, fn: (fn2: <U>(y: U, z: T) => void) => void) => void>();
// Pass

// const f: (x: number, fn: (fn2: (y: string, z: boolean) => void) => void) => void =
//     instanceOf<<T>(x: T, fn: (fn2: <U>(y: U, z: T) => void) => void) => void>();
// Fail

// const f: <T>(x: T) => T =
//     instanceOf<<U>(x: U) => U>();
// Pass

// const f: <T>(x: T) => T =
//     instanceOf<(x: number) => number>();
// Fail

// const f: <T>(x: T) => T =
//     instanceOf<<U>(x: U) => number>();
// Fail

//console.log(f);


// Introduce helpers to shorten tests
// Rename expression to term
// Rename unit to voidType
// Rename _void to void_
// Prefix type kinds
// Add Readme
// Add licence
