const resultMessage = (
    typeId: string,
    totalItems: number,
    locale = ''
): string => {
    let grammarStuff;
    if (Number(totalItems) === 1) {
        grammarStuff = 'item';
    } else {
        grammarStuff = 'items';
    }
    if (locale) {
        return `   ${typeId} (${locale}) - ${totalItems} ${grammarStuff}`;
    }
    return `   ${typeId} - ${totalItems} ${grammarStuff}`;
};

export default resultMessage;
