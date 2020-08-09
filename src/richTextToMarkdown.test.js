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

/**
 *
 * @param {String} nodeType - unordered-list || ordered-list
 * @param {Array} listItems
 */
const contentListFactory = (nodeType, listItems = []) => {
    const node = {
        nodeType,
        content: [],
        data: {},
    };
    for (const item of listItems) {
        const listNode = {
            nodeType: 'list-item',
            content: [
                {
                    nodeType: 'paragraph',
                    data: {},
                    content: [
                        {
                            nodeType: 'text',
                            value: item.value,
                            marks: item.marks || [],
                            data: item.data || {},
                        },
                    ],
                },
            ],
        };
        node.content.push(listNode);
    }
    return node;
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
    test('Code (Single-Line)', () => {
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
    test('Code (Multi-Line)', () => {
        const codeToRender = `const codeTest = "this is a code test"\nconsole.log(codeTest)`;
        const node = contentNodeFactory('paragraph', codeToRender, [
            { type: 'code' },
        ]);
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n\`\`\`\n${codeToRender}\n\`\`\`\n\n`
        );
    });
});

describe('Lists', () => {
    test('Ordered List', () => {
        const listItems = [
            {
                value: 'List item 1',
            },
            { value: 'List item 2' },
            { value: 'List item 3' },
        ];
        const node = contentListFactory('ordered-list', listItems);
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n1. List item 1\n\n2. List item 2\n\n3. List item 3\n\n`
        );
    });
    test('Unordered List', () => {
        const listItems = [
            {
                value: 'List item 1',
            },
            {
                value: 'List item 2',
            },
            {
                value: 'List item 3',
            },
        ];
        const node = contentListFactory('unordered-list', listItems);
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n- List item 1\n\n- List item 2\n\n- List item 3\n\n`
        );
    });
});
