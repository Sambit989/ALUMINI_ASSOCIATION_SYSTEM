function containsNumberOrSpecialCharacter(str) {
    return /[\d\W]/.test(str);
}

// Example usage:
console.log(containsNumberOrSpecialCharacter("Hello")); // false
console.log(containsNumberOrSpecialCharacter("Hello123")); // true
console.log(containsNumberOrSpecialCharacter("Hello@")); // true
