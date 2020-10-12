import { determineFileType, isContentfulConfig } from './utilities';

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

describe('Contentful Config Checker', () => {
    test('Should Fail', () => {
        expect(isContentfulConfig({ somekey: 'somestring' })).toBe(false);
        expect(
            isContentfulConfig({
                contentful: null,
                singleTypes: [],
                repeatableTypes: [],
            })
        ).toBe(false);
        expect(
            isContentfulConfig({
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
        expect(isContentfulConfig(config)).toBe(true);
    });
});
