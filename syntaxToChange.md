## Overrides

```js
const oldSyntax = {
    overrides: [
        // 6 lines long
        {
            field: 'url',
            options: {
                fieldName: 'link',
            },
        },
        // 10 lines long
        {
            field: 'my-other-field',
            options: {
                fieldName: 'my-new-field-name',
                valueTransformer: (val) => {
                    // do something with val
                    return val;
                },
            },
        },
    ],
};

const newSyntax = {
    overrides: {
        // 3 lines long
        url: {
            fieldName: 'link',
        },
        // 7 lines long
        'my-other-field': {
            fieldName: 'my-new-field-name',
            valueTransformer: (val) => {
                // do something with val
                return val;
            },
        },
    },
};
```

## Resolve Entries

```js
// 10 lines long
const oldSyntax = {
    resolveEntries: [
        {
            field: 'author',
            resolveTo: 'sys.id',
        },
        {
            field: 'featuredImage',
            resolveTo: 'fields.file.details.url',
        },
    ],
};

// 4 lines long
const newSyntax = {
    resolveEntries: {
        author: 'sys.id',
        featuredImage: 'fields.file.details.url',
    },
};
```
