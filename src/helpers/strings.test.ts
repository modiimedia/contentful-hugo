const {
    replaceSpecialEntities,
    isMultilineString,
    removeLeadingAndTrailingSlashes,
    leadingSpaces,
    trailingSpaces,
    characterIsWhiteSpace,
    endsWith,
} = require('./strings');

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

describe('Detect Whitespace', () => {
    test('Normal space', () => {
        expect(characterIsWhiteSpace(' ')).toBe(true);
    });
    test('Non breaking space', () => {
        expect(characterIsWhiteSpace('\xC2\xA0'));
    });
});

describe('Detect Multiline String', () => {
    test('Unescaped New Line', () => {
        const string1 = `Multiline
        String`;
        expect(isMultilineString(string1)).toBe(true);
        const string2 = `Three
        Line
        String`;
        expect(isMultilineString(string2)).toBe(true);
    });
    test('Escaped New Line', () => {
        expect(isMultilineString(`Multiline\nString`)).toBe(true);
        expect(isMultilineString(`\n\n\n\n\n`)).toBe(true);
        expect(isMultilineString(`Three\nLine\nString`)).toBe(true);
    });
    test('Single Line (Should Fail)', () => {
        expect(isMultilineString(`Single Line String`)).toBe(false);
    });
});

describe('Testing HTML Special Entity Replacements', () => {
    test('Quote entitity', () => {
        const input = '`const string = &quot;some value&quot;`';
        const expectedResult = '`const string = "some value"`';
        expect(replaceSpecialEntities(input)).toBe(expectedResult);
    });
    test('Ampersand entity', () => {
        const input = `John &amp; Joseph`;
        const expectedResult = `John & Joseph`;
        expect(replaceSpecialEntities(input)).toBe(expectedResult);
    });
    test('Less than sign', () => {
        expect(replaceSpecialEntities('1 &lt; 2')).toBe('1 < 2');
    });
    test('Greater than sign', () => {
        expect(replaceSpecialEntities('2 &gt; 1')).toBe('2 > 1');
    });
    test('Circumvent symbol', () => {
        expect(replaceSpecialEntities('2&circ;4')).toBe('2^4');
    });
    test('Multiple enitities in a string', () => {
        const input = `John &amp; Joseph are &gt; Mary &amp; Rachel concerning &quot;fitness&quot;. However, John &amp; Joseph are &lt; Mary &amp; Rachel concerning &quot;music&quot;.`;
        const expectedResult = `John & Joseph are > Mary & Rachel concerning "fitness". However, John & Joseph are < Mary & Rachel concerning "music".`;
        expect(replaceSpecialEntities(input)).toBe(expectedResult);
    });
});

describe('file path', () => {
    test('single leading slash', () => {
        expect(removeLeadingAndTrailingSlashes('/content/posts/12345.md')).toBe(
            'content/posts/12345.md'
        );
    });
    test('double leading slashes', () => {
        expect(
            removeLeadingAndTrailingSlashes('//content/posts/12345.md')
        ).toBe('content/posts/12345.md');
    });
    test('single trailing slash', () => {
        expect(removeLeadingAndTrailingSlashes('content/posts/')).toBe(
            'content/posts'
        );
    });
    test('double trailing slashes', () => {
        expect(removeLeadingAndTrailingSlashes('content/posts//')).toBe(
            'content/posts'
        );
    });
    test('single leading and trailing slash', () => {
        expect(removeLeadingAndTrailingSlashes('/content/posts/')).toBe(
            'content/posts'
        );
    });
    test('double leading and trailing slashes', () => {
        expect(
            removeLeadingAndTrailingSlashes('//content/posts/something//')
        ).toBe('content/posts/something');
    });
});

describe('Leading Spaces', () => {
    test('One Leading Space', () => {
        const str = ' johnathon slayter';
        const spaces = leadingSpaces(str);
        expect(spaces.exists).toBe(true);
        expect(spaces.count).toBe(1);
        expect(spaces.newString).toBe('johnathon slayter');
    });
    test('No Leading Spaces', () => {
        const str = 'john doe smith  ';
        const spaces = leadingSpaces(str);
        expect(spaces.exists).toBe(false);
        expect(spaces.count).toBe(0);
        expect(spaces.newString).toBe('john doe smith  ');
    });
    test('Four Leading Spaces', () => {
        const str = '    john doe';
        const spaces = leadingSpaces(str);
        expect(spaces.exists).toBe(true);
        expect(spaces.count).toBe(4);
        expect(spaces.newString).toBe('john doe');
    });
    test('Markdown Rendering Test', () => {
        const str = '  john smith';
        const spaces = leadingSpaces(str);
        const newString = `${spaces.removedSpaces}**${spaces.newString}**`;
        expect(newString).toBe('  **john smith**');
    });
});

describe('Trailing Spaces', () => {
    test('One Trailing Space', () => {
        const str = 'johnathon slayter ';
        const spaces = trailingSpaces(str);
        expect(spaces.exists).toBe(true);
        expect(spaces.count).toBe(1);
        expect(spaces.newString).toBe('johnathon slayter');
    });
    test('No Trailing Spaces', () => {
        const str = '  john doe smith';
        const spaces = trailingSpaces(str);
        expect(spaces.exists).toBe(false);
        expect(spaces.count).toBe(0);
        expect(spaces.newString).toBe('  john doe smith');
    });
    test('Four Trailing Spaces', () => {
        const str = 'john doe    ';
        const spaces = trailingSpaces(str);
        expect(spaces.exists).toBe(true);
        expect(spaces.count).toBe(4);
        expect(spaces.newString).toBe('john doe');
    });
    test('Trailing Spaces with Colon', () => {
        const str = 'In Short: ';
        const spaces = trailingSpaces(str);
        expect(spaces.exists).toBe(true);
        expect(spaces.count).toBe(1);
        expect(spaces.newString).toBe('In Short:');
    });
});

describe('Markdown Rendering', () => {
    test('Input with leading and trailing spaces', () => {
        const input = '  john smith ';
        const expectedValue = '  **john smith** ';
        const leading = leadingSpaces(input);
        const trailing = trailingSpaces(leading.newString);
        const result = `${leading.removedSpaces}**${trailing.newString}**${trailing.removedSpaces}`;
        expect(result).toBe(expectedValue);
    });
});
