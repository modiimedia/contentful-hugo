const { replaceSpecialEntities } = require('./specialEntities');

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
