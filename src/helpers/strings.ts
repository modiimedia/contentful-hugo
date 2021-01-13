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

interface StringSpaceCleanupObject {
    exists: boolean;
    newString: string;
    removedSpaces: string;
    count: number;
}
const characterIsWhiteSpace = (char: string): boolean => {
    return /\s/.test(char);
};

const leadingSpaces = (string: string, count = 0): StringSpaceCleanupObject => {
    if (characterIsWhiteSpace(string.charAt(0))) {
        return leadingSpaces(string.slice(1), count + 1);
    }
    let removedSpaces = '';
    for (let i = 0; i < count; i++) {
        removedSpaces += ' ';
    }
    return {
        exists: count > 0,
        newString: string,
        removedSpaces,
        count,
    };
};

const trailingSpaces = (
    string: string,
    count = 0
): StringSpaceCleanupObject => {
    const str = string.replace(/\s/g, ' ');
    if (characterIsWhiteSpace(str.charAt(str.length - 1))) {
        return trailingSpaces(str.slice(0, -1), count + 1);
    }
    let removedSpaces = '';
    for (let i = 0; i < count; i++) {
        removedSpaces += ' ';
    }
    return {
        exists: count > 0,
        newString: str,
        removedSpaces,
        count,
    };
};

/**
 * Check if string ends with ext
 * @param {String} str
 * @param {String} ext
 * @returns {boolean}
 */
const endsWith = (str: string | undefined | null, ext: string): boolean => {
    return new RegExp(`${ext}$`).test(str || '');
};

export {
    characterIsWhiteSpace,
    isMultilineString,
    replaceSpecialEntities,
    specialEntities,
    removeLeadingAndTrailingSlashes,
    leadingSpaces,
    trailingSpaces,
    endsWith,
};
