import getEntryFields from './getEntryFields';

const entry: any = {
    sys: {
        id: '12345',
        contentType: {
            sys: {
                id: 'exampleEntry',
            },
        },
        fields: {
            title: 'Example Entry',
            slug: 'example-entry',
        },
    },
};

test('Get Entry', () => {
    const entryData = getEntryFields(entry);
    expect(entryData.id).toBe(entry.sys.id);
    expect(entryData.contentType).toBe(entry.sys.contentType.sys.id);
});
