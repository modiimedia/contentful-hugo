const resultMessage = (typeId, totalItems) => {
    let grammarStuff;
    if (Number(totalItems) === 1) {
        grammarStuff = 'item';
    } else {
        grammarStuff = 'items';
    }
    return `   ${typeId} - ${totalItems} ${grammarStuff}`;
};

module.exports = resultMessage;
