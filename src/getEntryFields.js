module.exports = (entry, resolve = null) => {
    let obj = {};
    if (resolve) {
        return entry.fields[resolve.key];
    }
    if (entry.sys) {
        obj = {
            id: entry.sys.id,
            contentType: entry.sys.contentType.sys.id,
        };
    }
    return obj;
};
