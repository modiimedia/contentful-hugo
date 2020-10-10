import { Asset, Entry } from 'contentful';

const getEntryFields = (
    entry: Entry<any> | Asset
): { id?: string; contentType?: string } => {
    let obj = {};
    if (entry.sys) {
        obj = {
            id: entry.sys.id,
            contentType: entry.sys.contentType.sys.id,
        };
    }
    return obj;
};

export default getEntryFields;
