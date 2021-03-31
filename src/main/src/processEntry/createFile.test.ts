import { ContentSettings } from '../../index';
import { LocaleConfig } from '../config/src/types';
import { determineFilePath, parseDirectoryPath } from './createFile';

const settingsFactory = (
    typeId: string,
    directory: string,
    isSingle = false,
    fileName = '',
    isHeadless = false,
    isTaxonomy = false,
    fileExtension = 'md',
    locale: LocaleConfig = { code: '', mapTo: '' },
    filters: ContentSettings['filters'] = {},
    resolveEntries: ContentSettings['resolveEntries'] = []
): ContentSettings => {
    return {
        typeId,
        locale,
        isHeadless,
        isSingle,
        isTaxonomy,
        directory,
        fileName,
        fileExtension: fileExtension || 'md',
        filters,
        resolveEntries,
    };
};

describe('Determine File Path', () => {
    test('Single Type', () => {
        const settings = settingsFactory('home', 'content', true, '_index');
        expect(determineFilePath(settings, '12345')).toBe(
            `./content/_index.md`
        );
        settings.directory = 'data';
        settings.fileName = 'settings';
        settings.fileExtension = 'yaml';
        expect(determineFilePath(settings, '12345')).toBe(
            './data/settings.yaml'
        );
    });
    test('Repeatable Type', () => {
        const settings = settingsFactory(
            'post',
            'content/post',
            false,
            '',
            false,
            false
        );
        expect(determineFilePath(settings, 'my-post-id')).toBe(
            `./content/post/my-post-id.md`
        );
        // test locale mapping
        settings.locale = {
            code: 'en-US',
            mapTo: 'en-US',
        };
        expect(determineFilePath(settings, 'my-post-id')).toBe(
            './content/post/my-post-id.en-us.md'
        );
        settings.locale = {
            code: 'fr-FR',
            mapTo: 'fr',
        };
        expect(determineFilePath(settings, 'my-post-id')).toBe(
            './content/post/my-post-id.fr.md'
        );
        settings.directory = 'content/[locale]/post';
        expect(determineFilePath(settings, 'my-post-id')).toBe(
            './content/fr/post/my-post-id.md'
        );
    });
    test('Repeatable Type (Headless)', () => {
        const settings = settingsFactory(
            'gallery',
            'content/gallery',
            false,
            '',
            true
        );
        expect(determineFilePath(settings, 'my-gallery-id')).toBe(
            './content/gallery/my-gallery-id/index.md'
        );
    });
    test('Repeatable Type (Taxonomy', () => {
        const settings = settingsFactory(
            'category',
            'content/categories',
            false,
            '',
            false,
            true
        );
        expect(determineFilePath(settings, 'my-category-id')).toBe(
            './content/categories/my-category-id/_index.md'
        );
    });
});

describe('Parse Directory', () => {
    test('No Locale', () => {
        const result = parseDirectoryPath('content/post', 'en');
        expect(result.path).toBe('content/post');
    });
    test('Locale', () => {
        const result = parseDirectoryPath('content/[locale]/post', 'en');
        expect(result.path).toBe('content/en/post');
    });
});
