function swap<T, U>(a: T, b: U): [U, T] {  // ✅ T and U are conventional
    return [b, a];
}