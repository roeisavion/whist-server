"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Sync object
const config = {
    roots: [
        "<rootDir>/src"
    ],
    verbose: true,
    transform: { '^.+\\.tsx?$': 'ts-jest' },
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx)",
        "**/?(*.)+(spec|test).+(ts|tsx)"
    ]
};
exports.default = config;
