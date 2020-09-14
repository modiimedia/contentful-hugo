const {
    replaceSpecialEntities,
    isMultilineString,
    removeLeadingAndTrailingSlashes,
} = require('./strings');

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
