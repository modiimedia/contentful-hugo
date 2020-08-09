const richTextToMarkdown = require('./richTextToMarkdown');

const richText = {
    nodeType: 'document',
    data: {},
    content: [
        {
            nodeType: 'heading-1',
            content: [
                {
                    nodeType: 'text',
                    value: 'Heading 1',
                    marks: [],
                    data: {},
                },
            ],
            data: {},
        },
    ],
};

// describe('Headings', () => {
//     test('H1', () => {
//         const markdown = richTextToMarkdown(richText);
//         const expectedResult = `# Heading 1`;
//         expect(markdown).toBe(expectedResult);
//     });
// });

console.log(richTextToMarkdown(richText));
