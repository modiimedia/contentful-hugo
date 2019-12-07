module.exports = (entry, resolve = null) => {
    let obj = {};
    // default behaviour
    if (entry.sys) {
        obj = {
            id: entry.sys.id,
            contentType: entry.sys.contentType.sys.id,
        };
    }
    if (resolve) {
        // check if the key we want it to resolve to exists
        if (entry.fields[resolve.to]) {
            obj = entry.fields[resolve.to];
        }
    }
    return obj;
};
