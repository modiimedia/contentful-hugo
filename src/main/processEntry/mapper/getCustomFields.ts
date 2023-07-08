import { Entry } from 'contentful';
import { CustomFieldsConfig } from '@/main/config/types';

interface AppendableFieldsResult {
    [key: string]: unknown;
}

const getCustomFields = (
    appendFields: CustomFieldsConfig,
    entry: Entry
): AppendableFieldsResult => {
    const fields: AppendableFieldsResult = {};
    if (typeof appendFields === 'object') {
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
    }
    return fields;
};

export default getCustomFields;
