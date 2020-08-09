const richTextToMarkdown = require('./richTextToMarkdown');

/**
 *
 * @param {String} nodeType
 * @param {String} value
 * @param {Array} marks
 * @param {Object} data
 */
const contentNodeFactory = (nodeType, value, marks = [], data = {}) => {
    return {
        nodeType,
        content: [
            {
                nodeType: 'text',
                value,
                marks,
                data,
            },
        ],
        data: {},
    };
};

const richTextFactory = (nodes = []) => {
    const document = {
        nodeType: 'document',
        data: {},
        content: nodes,
    };
    return document;
};

describe('Headings', () => {
    test('H1', () => {
        const node = contentNodeFactory('heading-1', 'Heading 1');
        const richText = richTextFactory([node]);
        const markdown = richTextToMarkdown(richText);
        const expectedResult = `\n# Heading 1\n\n`;
        expect(markdown).toBe(expectedResult);
    });
    test('H2', () => {
        const node = contentNodeFactory('heading-2', 'Heading 2');
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(`\n## Heading 2\n\n`);
    });
    test('H3', () => {
        const node = contentNodeFactory('heading-3', 'Heading 3');
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(`\n### Heading 3\n\n`);
    });
    test('H4', () => {
        const node = contentNodeFactory('heading-4', 'Heading 4');
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(`\n#### Heading 4\n\n`);
    });
    test('H5', () => {
        const node = contentNodeFactory('heading-5', 'Heading 5');
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(`\n##### Heading 5\n\n`);
    });
    test('H6', () => {
        const node = contentNodeFactory('heading-6', 'Heading 6');
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(`\n###### Heading 6\n\n`);
    });
});

describe('Marks', () => {
    test('Bold', () => {
        const node = contentNodeFactory('paragraph', 'bold text example', [
            { type: 'bold' },
        ]);
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n**bold text example**\n\n`
        );
    });
    test('Underline', () => {
        const node = contentNodeFactory(
            'paragraph',
            'underlined text example',
            [{ type: 'underline' }]
        );
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n<u>underlined text example</u>\n\n`
        );
    });
    test('Italic', () => {
        const node = contentNodeFactory('paragraph', 'italic text example', [
            { type: 'italic' },
        ]);
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n*italic text example*\n\n`
        );
    });
    test('Code', () => {
        const node = contentNodeFactory(
            'paragraph',
            'const codeTest = "this is a code test"',
            [{ type: 'code' }]
        );
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n\`const codeTest = "this is a code test"\`\n\n`
        );
    });
});
