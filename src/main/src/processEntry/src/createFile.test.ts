import { ContentSettings } from '../../../../../dist/main';
import { LocaleConfig } from '../../../../../dist/main/src/config/src/types';
import { determineFilePath } from './createFile';

const settingsFactory = (
    typeId: string,
    directory: string,
    isSingle = false,
    fileName = '',
    isHeadless = false,
    isTaxonomy = false,
    fileExtension = 'md',
    locale: LocaleConfig = { name: '', mapTo: '' },
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
        fileExtension,
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
            name: 'en-US',
            mapTo: 'en-US',
        };
        expect(determineFilePath(settings, 'my-post-id')).toBe(
            './content/post/my-post-id.en-us.md'
        );
        settings.locale = {
            name: 'fr-FR',
            mapTo: 'fr',
        };
        expect(determineFilePath(settings, 'my-post-id')).toBe(
            './content/post/my-post-id.fr.md'
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
