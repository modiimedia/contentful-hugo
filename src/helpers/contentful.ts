import { ConfigContentfulSettings } from '@/main/config/types';
import { ContentfulClientApi, createClient } from 'contentful';
import dotenv from 'dotenv';

dotenv.config();

const createContentfulClient = (
    settings: ConfigContentfulSettings,
    previewMode = false
): ContentfulClientApi => {
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
    return createClient(options);
};

export default createContentfulClient;
