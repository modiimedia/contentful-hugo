module.exports = entry => {
    let obj = {};
    if (entry.sys) {
        obj = {
            id: entry.sys.id,
            contentType: entry.sys.contentType.sys.id,
        };
    }
    return obj;
};
