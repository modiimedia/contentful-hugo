import {
    determineFileType,
    isContentfulHugoConfig,
    isValidFileExtension,
} from './utilities';

describe('File Ext Checks', () => {
    test('js file', () => {
        expect(determineFileType('myfile.js')).toBe('javascript');
        expect(determineFileType('myfile.config.yaml.ts.js')).toBe(
            'javascript'
        );
    });
    test('yaml file', () => {
        expect(determineFileType('myfile.yaml')).toBe('yaml');
        expect(determineFileType('myfile.yml')).toBe('yaml');
        expect(determineFileType('myfile.config.js.yaml')).toBe('yaml');
        expect(determineFileType('myfile.js.yaml.ts.yml')).toBe('yaml');
    });
    test('unknown file type', () => {
        expect(determineFileType('myfile.css')).toBe(null);
        expect(determineFileType('hi')).toBe(null);
        expect(determineFileType('myfile.txt')).toBe(null);
    });
});

describe('Validate fileExtension checks', () => {
    test('Valid fileExtension', () => {
        expect(isValidFileExtension('md')).toBe(true);
        expect(isValidFileExtension('yaml')).toBe(true);
        expect(isValidFileExtension('yml')).toBe(true);
        expect(isValidFileExtension('de.md')).toBe(true);
        expect(isValidFileExtension('en.yaml')).toBe(true);
        expect(isValidFileExtension('fr.yml')).toBe(true);
    });

    test('Invalid fileExtension', () => {
        expect(isValidFileExtension('js')).toBe(false);
        expect(isValidFileExtension('json')).toBe(false);
        expect(isValidFileExtension('txt')).toBe(false);
        expect(isValidFileExtension('md.js')).toBe(false);
        expect(isValidFileExtension('yml.json')).toBe(false);
        expect(isValidFileExtension('yaml.txt')).toBe(false);
    });
});

describe('Contentful Config Checker', () => {
    test('Should Fail', () => {
        expect(isContentfulHugoConfig({ somekey: 'somestring' })).toBe(false);
        expect(
            isContentfulHugoConfig({
                contentful: null,
                singleTypes: [],
                repeatableTypes: [],
            })
        ).toBe(false);
        expect(
            isContentfulHugoConfig({
                contentful: {
                    space: 'myspace',
                    token: 'my-token',
                    previewToken: 'my-preview-token',
                    environment: 'my-env',
                },
                singleTypes: [
                    {
                        id: 'test',
                    },
                ],
                repeatableTypes: [],
            })
        ).toBe(false);
    });
    test('Should Pass', () => {
        const config = {
            contentful: {
                space: 'my-space',
                token: 'my-token',
                previewToken: 'my-preview-token',
                environment: 'my-env',
            },
            singleTypes: [],
            repeatableTypes: [],
        };
        expect(isContentfulHugoConfig(config)).toBe(true);
    });
});
