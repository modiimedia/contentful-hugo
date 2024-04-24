import fs from 'fs-extra';
import { ContentfulHugoConfig } from '../main/config/types';
import determineFileLocations from './determineFileLocation';
import YAML from 'json-to-pretty-yaml';

const testConfig: ContentfulHugoConfig = {
    locales: [],
    contentful: {
        space: '',
        token: '',
        previewToken: '',
        environment: '',
    },
    singleTypes: [
        {
            id: 'post',
            directory: 'content',
            fileName: 'post-test',
            fileExtension: 'md',
        },
        {
            id: 'homepage',
            directory: 'content',
            fileName: 'home',
            fileExtension: 'md',
        },
        {
            id: 'settings',
            directory: 'data',
            fileName: 'settings',
            fileExtension: 'yaml',
        },
    ],
    repeatableTypes: [
        {
            id: 'post',
            directory: 'content/post',
            fileExtension: 'md',
        },
        {
            id: 'fr-post',
            directory: 'content/fr-post',
            fileExtension: 'fr.md',
        },
        {
            id: 'category',
            directory: 'content/category',
            isTaxonomy: true,
            fileExtension: 'md',
        },
        {
            id: 'person',
            directory: 'content/person',
            isHeadless: true,
            fileExtension: 'md',
        },
        {
            id: 'manual-slug',
            directory: 'content/manual-slug',
            fileName: 'fields.slug',
        },
    ],
    staticContent: [],
};

const testEntryId = 'my-test-entry-id';

beforeAll(async () => {
    await fs.ensureDir('content');
    const fileContent = {
        sys: {
            id: testEntryId,
        },
    };
    await fs.writeFile('./content/home.md', YAML.stringify(fileContent));
});

afterAll(async () => {
    await fs.unlink('./content/home.md');
});
test('Single Type', async () => {
    const result = await determineFileLocations(
        testConfig,
        testEntryId,
        'homepage'
    );
    expect(result.length).toBe(1);
    expect(result[0]).toBe('./content/home.md');
});

test('Multiple Locations', async () => {
    const result = await determineFileLocations(
        testConfig,
        testEntryId,
        'post'
    );
    expect(result.length).toBe(2);
    expect(result[0]).toBe('./content/post-test.md');
    expect(result[1]).toBe(`./content/post/${testEntryId}.md`);
});

test('Taxonomy Entry', async () => {
    const result = await determineFileLocations(
        testConfig,
        testEntryId,
        'category'
    );
    expect(result.length).toBe(1);
    expect(result[0]).toBe(`./content/category/${testEntryId}/_index.md`);
});

test('Headless Entry', async () => {
    const result = await determineFileLocations(
        testConfig,
        testEntryId,
        'person'
    );
    expect(result.length).toBe(1);
    expect(result[0]).toBe(`./content/person/${testEntryId}/index.md`);
});

test('Uncommon file Extension', async () => {
    const result = await determineFileLocations(
        testConfig,
        testEntryId,
        'fr-post'
    );
    expect(result.length).toBe(1);
    expect(result[0]).toBe(`./content/fr-post/${testEntryId}.fr.md`);
});

test('Non-Existent Content Type', async () => {
    const result = await determineFileLocations(
        testConfig,
        'my-other-id',
        'blah'
    );
    expect(result.length).toBe(0);
});

test('Non-Existent Entry (Single Type)', async () => {
    const result = await determineFileLocations(
        testConfig,
        'my-other-id',
        'homepage',
        true
    );
    expect(result.length).toBe(0);
});

test('Repeatable Type with Locales', async () => {
    const settings = { ...testConfig };
    settings.locales = ['en-US', 'fr-FR'];
    settings.singleTypes = [];
    const result = await determineFileLocations(
        settings,
        'my-entry-id',
        'post',
        false
    );
    for (const item of result) {
        const localeIncluded =
            item === './content/post/my-entry-id.en-us.md' ||
            item === './content/post/my-entry-id.fr-fr.md';
        expect(localeIncluded).toBe(true);
    }
});
