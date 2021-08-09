import { CustomFieldsConfig } from '@/main/config/types';
import { Entry } from 'contentful';

interface AppendableFieldsResult {
    [key: string]: unknown;
}

const getCustomFields = (
    appendFields: CustomFieldsConfig = {},
    entry: Entry<unknown>
): AppendableFieldsResult => {
    const fields: AppendableFieldsResult = {};
    Object.keys(appendFields).forEach((key) => {
        const fieldVal = appendFields[key];
        switch (typeof fieldVal) {
            case 'function':
                fields[key] = fieldVal(entry);
                break;
            default:
                fields[key] = fieldVal;
                break;
        }
    });
    return fields;
};

export default getCustomFields;
