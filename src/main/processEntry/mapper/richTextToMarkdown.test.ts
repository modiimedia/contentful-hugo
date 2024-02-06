import richTextToMarkdown from './richTextToMarkdown';

const nodeText = (value: any, marks: any[] = []) => {
    return {
        nodeType: 'text',
        value,
        marks,
        data: {},
    };
};

/**
 *
 * @param {String} nodeType
 * @param {String} value
 * @param {Array} marks
 * @param {Object} data
 */
const contentNodeFactory = (
    nodeType: string,
    value: any,
    marks: any[] = [],
    data: any = {}
) => {
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
const contentListFactory = (nodeType: string, listItems: any[] = []) => {
    const node: any = {
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

const contentParagraph = (contentItems: any[] = []) => {
    const paragraph: any = {
        nodeType: 'paragraph',
        content: [],
    };
    for (const item of contentItems) {
        paragraph.content.push({
            nodeType: 'text',
            value: item.value || '',
            marks: item.marks || [],
            data: item.data || {},
        });
    }
    return paragraph;
};

const contentQuoteFactory = (contentItems: any[] = []) => {
    const quoteNote = {
        nodeType: 'blockquote',
        content: contentItems,
    };
    return quoteNote;
};

const richTextFactory = (nodes: any[] = []): any => {
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
    test('Bold With Extra Spaces', () => {
        const node = contentNodeFactory(
            'paragraph',
            '    bold text example  ',
            [{ type: 'bold' }]
        );
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n    **bold text example**  \n\n`
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
            `\n_italic text example_\n\n`
        );
    });
    test('Italic with Extra Spaces', () => {
        const node = contentNodeFactory(
            'paragraph',
            '      italic text example   ',
            [{ type: 'italic' }]
        );
        const richText = richTextFactory([node]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n      _italic text example_   \n\n`
        );
    });
    test('Bold Mark Inside Italic Mark', () => {
        const nodes = [
            {
                data: {},
                content: [
                    {
                        data: {},
                        marks: [],
                        value: 'Information collected from other sources',
                        nodeType: 'text',
                    },
                ],
                nodeType: 'heading-3',
            },
            {
                data: {},
                content: [
                    {
                        data: {},
                        marks: [
                            {
                                type: 'italic',
                            },
                            {
                                type: 'bold',
                            },
                        ],
                        value: 'In Short:  ',
                        nodeType: 'text',
                    },
                    {
                        data: {},
                        marks: [
                            {
                                type: 'italic',
                            },
                        ],
                        value: 'We may collect limited data from public databases, marketing partners, social media platforms, and other outside sources.',
                        nodeType: 'text',
                    },
                ],
                nodeType: 'paragraph',
            },
        ];
        const document = richTextFactory(nodes);
        const expectedResult = `\n### Information collected from other sources\n\n**_In Short:_**  _We may collect limited data from public databases, marketing partners, social media platforms, and other outside sources._\n\n`;
        expect(richTextToMarkdown(document)).toBe(expectedResult);
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
            `\n1. List item 1\n2. List item 2\n3. List item 3\n\n`
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
            `\n- List item 1\n- List item 2\n- List item 3\n\n`
        );
    });
});

describe('Blockquote', () => {
    test('Single Line Quote', () => {
        const paragraph = [
            contentParagraph([
                { value: 'This is a single line quote with ' },
                { value: 'bold text.', marks: [{ type: 'bold' }] },
            ]),
        ];
        const quoteNode = contentQuoteFactory(paragraph);
        const richText = richTextFactory([quoteNode]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n> This is a single line quote with **bold text.**\n\n`
        );
    });
    test('Multi Line Quote', () => {
        const paragraphs = [
            contentParagraph([{ value: 'First line of the quote' }]),
            contentParagraph([{ value: 'Third line of the quote' }]),
        ];
        const quoteNode = contentQuoteFactory(paragraphs);
        const richText = richTextFactory([quoteNode]);
        expect(richTextToMarkdown(richText)).toBe(
            `\n> First line of the quote\n> \n> Third line of the quote\n\n`
        );
    });
});

const entryDataFactory = (entryId: string, contentType: string) => {
    const data = {
        target: {
            sys: {
                id: entryId,
                type: 'Entry',
                contentType: {
                    sys: {
                        id: contentType,
                    },
                },
            },
        },
    };
    return data;
};

/**
 *
 * @param {String} nodeType - embedded-entry-block || embedded-entry-inline
 * @param {*} entryId
 * @param {*} contentType
 * @param {*} parentContentType
 */
const entryFactory = (
    nodeType: string,
    entryId: string,
    contentType: string,
    parentContentType?: string,
    content: any[] = []
) => {
    const node = {
        nodeType,
        content,
        data: entryDataFactory(entryId, contentType),
    };
    const richText = richTextFactory([node]);
    const result = richTextToMarkdown(richText, parentContentType);
    return result;
};

describe('Entries', () => {
    test('Entry Block', () => {
        const entryId = '12345';
        const contentType = 'gallery';
        const parentContentType = 'post';
        const result = entryFactory(
            'embedded-entry-block',
            entryId,
            contentType,
            parentContentType
        );
        const expectedResult = `\n{{< contentful-hugo/embedded-entry id="${entryId}" contentType="${contentType}" parentContentType="${parentContentType}" >}}\n\n`;
        expect(result).toBe(expectedResult);
    });
    test('Entry Inline', () => {
        const entryId = '12345';
        const contentType = 'gallery';
        const parentContentType = 'post';
        const result = entryFactory(
            'embedded-entry-inline',
            entryId,
            contentType,
            parentContentType
        );
        const expectedResult = `\n{{< contentful-hugo/inline-entry id="${entryId}" contentType="${contentType}" parentContentType="${parentContentType}" >}}`;
        expect(result).toBe(expectedResult);
    });
    test('Entry Hyperlink', () => {
        const entryId = '12345';
        const contentType = 'gallery';
        const parentContentType = 'post';
        const content = [
            nodeText('my '),
            nodeText('hyperlink text', [{ type: 'bold' }]),
        ];
        const result = entryFactory(
            'entry-hyperlink',
            entryId,
            contentType,
            parentContentType,
            content
        );
        const expectedResult = `\n{{< contentful-hugo/entry-hyperlink id="${entryId}" contentType="${contentType}" parentContentType="${parentContentType}" >}}my **hyperlink text**{{< /contentful-hugo/entry-hyperlink >}}`;
        expect(result).toBe(expectedResult);
    });
});

/**
 *
 * @param {String} nodeType - 'embedded-asset-block' ||
 */
const assetFactory = (
    nodeType: string,
    title?: string,
    description?: string,
    url?: string,
    fileName?: string,
    assetType?: string,
    size?: number,
    width?: number,
    height?: number,
    parentContentType?: string,
    content: any[] = []
) => {
    const node = {
        nodeType,
        content,
        data: {
            target: {
                sys: {
                    id: '12345',
                    type: 'Asset',
                },
                fields: {
                    title,
                    description,
                    file: {
                        url,
                        fileName,
                        contentType: assetType,
                        details: {
                            size,
                            image:
                                assetType && assetType.includes('image')
                                    ? {
                                          width,
                                          height,
                                      }
                                    : null,
                        },
                    },
                },
            },
        },
    };
    const richText = richTextFactory([node]);
    return richTextToMarkdown(richText, parentContentType);
};

describe('Assets', () => {
    test('Asset Block', () => {
        const title = 'My Photo';
        const description = 'Description of my photo';
        const url = 'https://source.unsplash.com/random';
        const fileName = 'myphoto.jpg';
        const assetType = 'image/jpeg';
        const size = 1000;
        const width = 1920;
        const height = 1080;
        const parentContentType = 'post';
        const result = assetFactory(
            'embedded-asset-block',
            title,
            description,
            url,
            fileName,
            assetType,
            size,
            width,
            height,
            parentContentType
        );
        const expectedResult = `\n{{< contentful-hugo/embedded-asset title="${title}" description="${description}" url="${url}" filename="${fileName}" assetType="${assetType}" size="${size}" width="${width}" height="${height}" parentContentType="${parentContentType}" >}}\n\n`;
        expect(result).toBe(expectedResult);
    });
    test('Asset Block (Image with quotations in description)', () => {
        const title = 'My "Photo"';
        const description = 'Description of "my photo"';
        const url = 'https://source.unsplash.com/random';
        const fileName = 'myphoto.jpg';
        const assetType = 'image/jpeg';
        const size = 1000;
        const width = 1920;
        const height = 1080;
        const parentContentType = 'post';
        const result = assetFactory(
            'embedded-asset-block',
            title,
            description,
            url,
            fileName,
            assetType,
            size,
            width,
            height,
            parentContentType
        );
        const expectedResult = `\n{{< contentful-hugo/embedded-asset title="My \\"Photo\\"" description="Description of \\"my photo\\"" url="${url}" filename="${fileName}" assetType="${assetType}" size="${size}" width="${width}" height="${height}" parentContentType="${parentContentType}" >}}\n\n`;
        expect(result).toBe(expectedResult);
    });
    test('Asset Block (Non Image)', () => {
        const title = 'My Video';
        const description = 'Description of my video';
        const url = 'https://www.youtube.com';
        const fileName = 'video.mp4';
        const assetType = 'video/mp4';
        const size = 1000;
        const width = 1920;
        const height = 1080;
        const parentContentType = 'post';
        const result = assetFactory(
            'embedded-asset-block',
            title,
            description,
            url,
            fileName,
            assetType,
            size,
            width,
            height,
            parentContentType
        );
        const expectedResult = `\n{{< contentful-hugo/embedded-asset title="${title}" description="${description}" url="${url}" filename="${fileName}" assetType="${assetType}" size="${size}" width="" height="" parentContentType="${parentContentType}" >}}\n\n`;
        expect(result).toBe(expectedResult);
    });
    test('Asset Hyperlink', () => {
        const title = 'My Photo';
        const description = 'Description of my photo';
        const url = 'https://source.unsplash.com/random';
        const fileName = 'myphoto.jpg';
        const assetType = 'image/jpeg';
        const size = 1000;
        const width = 1920;
        const height = 1080;
        const parentContentType = 'post';
        const content = [
            nodeText('my '),
            nodeText('hyperlink text', [{ type: 'bold' }]),
        ];
        const result = assetFactory(
            'asset-hyperlink',
            title,
            description,
            url,
            fileName,
            assetType,
            size,
            width,
            height,
            parentContentType,
            content
        );
        const expectedResult = `\n{{< contentful-hugo/asset-hyperlink title="${title}" description="${description}" url="${url}" filename="${fileName}" assetType="${assetType}" size="${size}" width="${width}" height="${height}" parentContentType="${parentContentType}" >}}my **hyperlink text**{{< /contentful-hugo/asset-hyperlink >}}`;
        expect(result).toBe(expectedResult);
    });
});
