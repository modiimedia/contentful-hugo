import { pathExists, remove } from 'fs-extra';
import { ContentSettings } from './index';
import { prepDirectory } from './getContentType';

afterAll(async () => {
    await remove('./.temp');
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
    };
    await prepDirectory(settings);
    expect(await pathExists('./.temp/blah/_index.md')).toBe(false);

    settings.isHeadless = true;
    await prepDirectory(settings);
    expect(await pathExists('./.temp/blah/_index.md')).toBe(true);

    settings.locale = {
        code: 'en-US',
        mapTo: 'en-US',
    };
    await prepDirectory(settings);
    expect(await pathExists('./.temp/blah/_index.en-us.md')).toBe(true);
});
