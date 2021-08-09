import { Entry } from 'contentful';
import getCustomFields from './getCustomFields';

test('Appendable Fields', () => {
    const appendableFields = {
        field1: 'my-first-field',
        field2: {
            blah: 'blah',
        },
        fullName: (entry: Entry<any>) => {
            const { firstName, lastName } = entry.fields;
            let name = firstName || '';
            if (lastName) {
                name += ` ${lastName}`;
            }
            return name;
        },
    };
    const entry = {
        fields: {
            firstName: 'John',
            lastName: 'Doe',
        },
    };
    const result = getCustomFields(appendableFields, entry as any);
    expect(result.field1).toBe('my-first-field');
    expect((result.field2 as any).blah).toBe('blah');
    expect(result.fullName).toBe('John Doe');
});
