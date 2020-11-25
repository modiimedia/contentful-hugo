import { Entry } from 'contentful';
import { OverrideConfig } from '../config/src/types';
import {
    mapArrayField,
    resolveField,
    shouldOverride,
    mapFields,
} from './mapper';

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

const entryFactory = (fields: { [key: string]: any } = {}): Entry<any> => {
    const entry: Entry<any> = {
        sys: {
            id: 'my-id',
            createdAt: '2016-01-10',
            updatedAt: '2016-01-10',
            type: 'Entry',
            contentType: {
                sys: {
                    type: 'Link',
                    id: 'post',
                    linkType: 'ContentType',
                },
            },
            locale: 'en-US',
        },
        fields: {},
        toPlainObject: () => {
            return {};
        },
        update: () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(entry);
                });
            });
        },
    };
    entry.fields = fields;
    return entry;
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

describe('Override Tests', () => {
    test('Should override', () => {
        const fieldName = 'post';
        const overrides: OverrideConfig[] = [
            {
                field: 'gallery',
                options: {
                    fieldName: 'galleries',
                },
            },
            {
                field: 'post',
                options: {
                    fieldName: 'posts',
                },
            },
        ];
        const result = shouldOverride(fieldName, overrides);
        expect(typeof result).toBe('object');
    });
    test('Should not override', () => {
        const fieldName = 'post';
        const overrides: OverrideConfig[] = [
            {
                field: 'gallery',
                options: {
                    fieldName: 'galleries',
                },
            },
            {
                field: 'posts',
                options: {
                    fieldName: 'post',
                },
            },
        ];
        const result = shouldOverride(fieldName, overrides);
        expect(result).toBe(false);
    });
    test('Override Value', () => {
        const entry: Entry<any> = entryFactory({
            title: 'My Awesome Title',
            slug: 'my-awesome-title',
            content: 'content goes here',
            locale: 'en-US',
        });
        const overrides = [
            {
                field: 'content',
                options: {
                    valueTransformer: (val: any) => {
                        return val.toUpperCase();
                    },
                },
            },
        ];
        const result = mapFields(entry, '', false, '', '', [], overrides);
        expect(result.content).toBe('CONTENT GOES HERE');
    });
    test('override field name', () => {
        const entry = entryFactory({ title: 'My Title' });
        const overrides = [
            {
                field: 'title',
                options: {
                    fieldName: 'name',
                },
            },
        ];
        const result = mapFields(entry, '', false, '', '', [], overrides);
        expect(result.title).toBe(undefined);
        expect(result.name).toBe('My Title');
    });
});
