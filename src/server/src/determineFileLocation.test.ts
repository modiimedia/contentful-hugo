import fs from 'fs';
import { ensureDir, unlink, writeFile } from 'fs-extra';
import { ContentfulConfig } from '../../main/src/config/src/types';
import determineFileLocations from './determineFileLocation';

const YAML = require('json-to-pretty-yaml');

const testConfig: ContentfulConfig = {
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
    ],
};

const testEntryId = 'my-test-entry-id';

beforeAll(async () => {
    await ensureDir('content');
    const fileContent = {
        sys: {
            id: testEntryId,
        },
    };
    await writeFile('./content/home.md', YAML.stringify(fileContent));
});

afterAll(async () => {
    await unlink('./content/home.md');
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
