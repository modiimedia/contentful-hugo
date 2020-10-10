import { mapArrayField, resolveField } from './mapper';

const assetFactory = (
    title: string,
    description: string,
    url: string,
    fileName: string,
    assetType: string,
    width?: number,
    height?: number,
    size?: number
) => {
    const asset = {
        sys: {
            id: '12345',
            type: 'Asset',
        },
        fields: {
            title,
            description,
            file: {
                url,
                fileName,
                contentType: assetType,
                details: {
                    size,
                    image: assetType.includes('image')
                        ? {
                              width,
                              height,
                          }
                        : null,
                },
            },
        },
    };
    return asset;
};

describe('Array Fields', () => {
    test('Simple Array', () => {
        const arrayContent = ['dog', 'cat', 'duck'];
        const fieldValue = mapArrayField(arrayContent);
        expect(fieldValue[0]).toBe('dog');
        expect(fieldValue[2]).toBe('duck');
    });
    test('Array of Assets', () => {
        const asset1 = assetFactory(
            'Some Image',
            'Some Image Description',
            'https://source.unsplash.com',
            'some-image-1.png',
            'image/png',
            1200,
            1200
        );
        const asset2 = assetFactory(
            'Some Image 2',
            'Some Image Description 2',
            'https://source.unsplash.com',
            'some-image-2.jpg',
            'image/jpeg',
            100,
            100
        );
        const array: any[] = [asset1, asset2];
        const fieldValue = mapArrayField(array);
        expect(fieldValue[0].assetType).toBe('image/png');
        expect(fieldValue[0].width).toBe(1200);
        expect(fieldValue[1].assetType).toBe('image/jpeg');
        expect(fieldValue[1].width).toBe(100);
    });
});

describe('resolveable entries', () => {
    test('single entry', () => {
        const entry = {
            sys: {
                id: 'my-id',
            },
            fields: {
                title: 'My Awesome Title',
                slug: 'my-awesome-title',
                content: 'content goes here',
            },
        };
        const result = resolveField(entry, 'fields.slug');
        expect(result).toBe('my-awesome-title');
    });
    test('array of entries', () => {
        const entries = [
            {
                sys: {
                    id: 'entry-1',
                },
                fields: {
                    title: 'My Entry 1',
                },
            },
            {
                sys: {
                    id: 'entry-2',
                },
                fields: {
                    title: 'My Entry 2',
                },
            },
        ];
        const result = resolveField(entries, 'sys.id');
        expect(result[0]).toBe('entry-1');
        expect(result[1]).toBe('entry-2');
    });
    test('single asset', () => {
        const asset = assetFactory(
            'my asset',
            'my asset description',
            'https://source.unsplash.com/200x200',
            'my-image.jpg',
            'image/jpeg'
        );
        const result = resolveField(asset, 'fields.file.url');
        expect(result).toBe('https://source.unsplash.com/200x200');
    });
});
