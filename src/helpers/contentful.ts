import * as contentful from 'contentful';
import { ConfigContentfulSettings } from '@/main/config/types';

const createContentfulClient = (
    settings: ConfigContentfulSettings,
    previewMode = false
): contentful.ContentfulClientApi<undefined> => {
    const { token, previewToken, space, environment } = settings;
    if (previewMode && !previewToken) {
        throw new Error(
            'Environment variable CONTENTFUL_PREVIEW_TOKEN not set'
        );
    } else if (!previewMode && !token) {
        throw new Error('Environment variable CONTENTFUL_TOKEN not set');
    }
    let accessToken = token;
    if (previewMode) {
        accessToken = previewToken || token || '';
    }
    const options = {
        space,
        host: previewMode ? 'preview.contentful.com' : 'cdn.contentful.com',
        accessToken,
        environment,
    };
    return contentful.createClient(options);
};

export default createContentfulClient;
