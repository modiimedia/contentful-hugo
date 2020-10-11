const removeLeadingAndTrailingSlashes = (string: string): string => {
    return string.replace(/^\/+|\/+$/g, '');
};

const isMultilineString = (string: string): boolean => {
    const array = string.split(`\n`);
    if (array.length && array.length > 1) {
        return true;
    }
    return false;
};

const specialEntities: { [key: string]: string } = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&circ;': '^',
    '&nbsp;': ' ',
};

const replaceSpecialEntities = (string: string): string => {
    const checks = Object.keys(specialEntities);
    let finalString = string;
    for (const check of checks) {
        const regex = new RegExp(`${check}`, 'g');
        const replacementValue = specialEntities[check];
        if (typeof replacementValue === 'string') {
            finalString = finalString.replace(regex, replacementValue);
        }
    }
    return finalString;
};

export {
    isMultilineString,
    replaceSpecialEntities,
    specialEntities,
    removeLeadingAndTrailingSlashes,
};
