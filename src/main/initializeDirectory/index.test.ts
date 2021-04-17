import {
    getVariablesFromTemplate,
    replaceVariablesWithValues,
    templateVariableValues,
} from './index';

const template = `<div style="background: <<BACKGROUND_COLOR>>; color: <<TEXT_COLOR>>; border: 1px solid <<BORDER_COLOR>>;">test</div>`;

test('Parse Template For Variables', () => {
    const matchArray = getVariablesFromTemplate(template);
    expect(matchArray !== null).toBe(true);
    expect(matchArray?.includes('<<BACKGROUND_COLOR>>')).toBe(true);
    expect(matchArray?.includes('<<TEXT_COLOR>>')).toBe(true);
    expect(matchArray?.includes('<<BORDER_COLOR>>')).toBe(true);
});

test('Replace Template Variables', () => {
    expect(replaceVariablesWithValues(template)).toBe(
        `<div style="background: ${templateVariableValues['<<BACKGROUND_COLOR>>']}; color: ${templateVariableValues['<<TEXT_COLOR>>']}; border: 1px solid ${templateVariableValues['<<BORDER_COLOR>>']};">test</div>`
    );
});
