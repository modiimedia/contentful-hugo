import { shouldCreate, shouldDelete } from './index';

describe('Should Create', () => {
    test('Publish Mode', () => {
        expect(shouldCreate('ContentManagement.Entry.create', false)).toBe(
            false
        );
        expect(shouldCreate('ContentManagement.Entry.publish', false)).toBe(
            true
        );
        expect(shouldCreate('ContentManagement.Entry.auto_save', false)).toBe(
            false
        );
        expect(shouldCreate('ContentManagement.Entry.unarchive', false)).toBe(
            true
        );
    });
    test('Preview Mode', () => {
        expect(shouldCreate('ContentManagement.Entry.create', true)).toBe(true);
        expect(shouldCreate('ContentManagement.Entry.publish', true)).toBe(
            true
        );
        expect(shouldCreate('ContentManagement.Entry.auto_save', true)).toBe(
            true
        );
        expect(shouldCreate('ContentManagement.Entry.unarchive', true)).toBe(
            true
        );
    });
});

describe('Should Delete', () => {
    test('Publish Mode', () => {
        expect(shouldDelete('ContentManagement.Entry.delete', false)).toBe(
            true
        );
        expect(shouldDelete('ContentManagement.Entry.unpublish', false)).toBe(
            true
        );
        expect(shouldDelete('ContentManagement.Entry.archive', false)).toBe(
            true
        );
    });
    test('Preview Mode', () => {
        expect(shouldDelete('ContentManagement.Entry.delete', true)).toBe(true);
        expect(shouldDelete('ContentManagement.Entry.unpublish', true)).toBe(
            false
        );
        expect(shouldDelete('ContentManagement.Entry.archive', true)).toBe(
            true
        );
    });
});
