module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
        '^@main/(.*)$': '<rootDir>/src/main/$1',
        '^@server/(.*)$': '<rootDir>/src/server/$1',
    },
};
