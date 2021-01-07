import { endsWith } from './createFile';

describe('File Ending Tests', () => {
    test('Regular md file', () => {
        const result = endsWith('md', 'md');
        expect(result).toBe(true);
    });
    test("Shouldn't pass", () => {
        expect(endsWith('dsmdsh', 'md')).toBe(false);
        expect(endsWith('yaml.hi', 'yaml')).toBe(false);
        expect(endsWith('yaml.md.js', 'md')).toBe(false);
    });
    test('Should Pass', () => {
        expect(endsWith('config.md', 'md')).toBe(true);
        expect(endsWith('en.config.md', 'md')).toBe(true);
        expect(endsWith('yaml.en.md', 'md')).toBe(true);
    });
});
