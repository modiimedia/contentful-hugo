const isMultilineString = string => {
    const array = string.split(`\n`);
    if (array.length && array.length > 1) {
        return true;
    }
    return false;
};

const specialEntities = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&circ;': '^',
    '&nbsp;': ' ',
};

const replaceSpecialEntities = string => {
    const checks = Object.keys(specialEntities);
    let finalString = string;
    for (const check of checks) {
        const regex = new RegExp(`${check}`, 'g');
        const replacementValue = specialEntities[check];
        finalString = finalString.replace(regex, replacementValue);
    }
    return finalString;
};

module.exports = {
    isMultilineString,
    replaceSpecialEntities,
    specialEntities,
};
