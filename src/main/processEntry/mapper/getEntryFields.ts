import { EntryFields, EntrySkeletonType } from 'contentful';

const getEntryFields = (
    entry: EntryFields.EntryLink<EntrySkeletonType>
): { id?: string; contentType?: string } => {
    let obj = {};
    if (entry.sys) {
        obj = {
            id: entry.sys.id,
            // contentType is missing if an deleted entry get's referenced
            contentType: entry.sys.contentType?.sys.id,
        };
    }
    return obj;
};

export default getEntryFields;
