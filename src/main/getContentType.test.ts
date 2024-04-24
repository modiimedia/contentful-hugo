import fs from 'fs-extra';
import { ContentSettings } from './index';
import { prepDirectory } from './getContentType';

afterAll(async () => {
    await fs.remove('./.temp');
});

test('PrepDirectory', async () => {
    const settings: ContentSettings = {
        typeId: 'blah',
        directory: '.temp/blah',
        isSingle: false,
        isHeadless: false,
        isTaxonomy: false,
        locale: {
            code: '',
            mapTo: '',
        },
        customFields: {},
    };
    await prepDirectory(settings);
    expect(await fs.pathExists('./.temp/blah/_index.md')).toBe(false);

    settings.isHeadless = true;
    await prepDirectory(settings);
    expect(await fs.pathExists('./.temp/blah/_index.md')).toBe(true);

    settings.locale = {
        code: 'en-US',
        mapTo: 'en-US',
    };
    await prepDirectory(settings);
    expect(await fs.pathExists('./.temp/blah/_index.en-us.md')).toBe(true);
});
