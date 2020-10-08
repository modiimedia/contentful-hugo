const resultMessage = (typeId: string, totalItems: number): string => {
    let grammarStuff;
    if (Number(totalItems) === 1) {
        grammarStuff = 'item';
    } else {
        grammarStuff = 'items';
    }
    return `   ${typeId} - ${totalItems} ${grammarStuff}`;
};

export default resultMessage;
