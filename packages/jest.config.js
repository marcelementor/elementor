module.exports = {
	verbose: true,
	rootDir: __dirname,
	testEnvironment: 'jsdom',
	transform: {
		'\\.(j|t)sx?$': [ 'babel-jest', {
			presets: [
				[
					'@babel/preset-react', {
						runtime: 'automatic',
					},
				],
				'@babel/preset-typescript',
			],
			plugins: [
				[ '@babel/plugin-transform-modules-commonjs' ],
			],
		} ],
	},
	moduleNameMapper: {
		'^@elementor/(?!ui)(.*)$': '<rootDir>/packages/$1/src',
	},
	// By default jest will treat everything under `__tests__` as a test file, we only need `__tests__/*.test.ts`.
	testMatch: [
		'<rootDir>/packages/**/__tests__/**/*.test.[jt]s?(x)',
	],
	// By default jest avoids transforming files in node_modules.
	transformIgnorePatterns: [
		// Excluding elementor ui which is external package without commonjs build.
		'node_modules/(?!@elementor/ui)',
	],
	// Code coverage.
	collectCoverageFrom: [
		'packages/*/src/**/*.{js,jsx,ts,tsx}',
	],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
};
