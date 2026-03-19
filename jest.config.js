/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 60000,
    testMatch: ['**/**/*.test.ts'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'MarketWatchWeb Test Report',
            outputPath: './test-report.html',
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};
