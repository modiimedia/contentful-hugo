## Overrides

```js
// 18 lines long
const oldSyntax = {
    overrides: [
        {
            field: 'url',
            options: {
                fieldName: 'link',
            },
        },
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

// 12 lines long
const newSyntax = {
    overrides: {
        url: {
            fieldName: 'link',
        },
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
