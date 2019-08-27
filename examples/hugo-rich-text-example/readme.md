# Using A Rich Text Field In Hugo

In this repo I've created a couple posts with a field that mimicks the markup created by a rich text field in Contentful. You can use this as a reference when building a site that uses Rich Text.

## Methodology

This example uses "recursive partials" to traverse the rich text schema and generate markup based on the node type of each node. The idea is based on [recursive functions](https://en.wikipedia.org/wiki/Recursion_(computer_science)). Since you need to traverse an unknown number of layers deep you can keep calling a "checker partial" over and over until you run into a partial that doesn't need to call the checker. The checker will call partials depending on the node type.

The node types that never need a checker are: "text", "hr", "embedded-asset-block", "embedded-entry-block". This is because they will never have a deeper layer of data that needs to be traversed. You can treat reaching one of these node types as an exit condition.

### Example Traversing A Rich Text Field

Let's take the following frontmatter

```yaml
---
mainContent:
  - data: {}
    content:
      - data: {}
        marks: []
        value: "This is a simple paragraph"
        nodeType: "text"
    nodeType: "paragraph"
  - data: {}
    content:
      - data: {}
        content:
          - data: {}
            content:
              - data: {}
                marks: []
                value: "Here is a list item"
                nodeType: "text"
            nodeType: "paragraph"
        nodeType: "list-item"
      - data: {}
        content:
          - data: {}
            content:
              - data: {}
                marks: []
                value: "Here is another list item."
                nodeType: "text"
            nodeType: "paragraph"
        nodeType: "list-item"
    nodeType: "unordered-list"
---
```

In order to convert this to markup this we need to call the "rich-text.html" partial to begin traversing the data.

```GO
{{ partial "rich-text.html" (dict "This" .Params.mainContent "Site" $.Site) }}
```
Both the current context and the sitewide context need to be passed down into the partial (which can be done with the [dict function](https://gohugo.io/functions/dict/)). Using what was declared above, the current context can now be called using ```{{ .This }}``` and the sitewide context can be called using ```{{ .Site }}```

Both contexts need to be passed down so that you can use ```.Site``` to access the ```.GetPage``` function even when deeply nested. This will be necessary when dealing with Embedded Entry Blocks and Inline Entries.

Once "rich-text.html" is called it will call another partial depending on the node type. The first node is a simple paragraph with no marks. 

```yaml
  - data: {}
    content:
      - data: {}
        marks: []
        value: "This is a simple paragraph"
        nodeType: "text"
    nodeType: "paragraph"
```

The process for traversing this will work as follows:

- start recursion with **rich-text.html**
- rich-text.html calls **rich-text/standard-blocks/paragraph.html** because nodeType is set to "paragraph"
- paragraph.html calls **rich-text/node-checker.html** to loop through ```.data.content```
- node-checker.html calls **rich-text/standard-blocks/text.html** which is an exit condition
- recursion ends

The final markup looks like this

```HTML
<p>This is a simple paragraph</p>
```

The second node is an unordered-list so it contains more nested data. 

```YAML
  - data: {}
    content:
      - data: {}
        content:
          - data: {}
            content:
              - data: {}
                marks: []
                value: "Here is a list item"
                nodeType: "text"
            nodeType: "paragraph"
        nodeType: "list-item"
      - data: {}
        content:
          - data: {}
            content:
              - data: {}
                marks: []
                value: "Here is another list item."
                nodeType: "text"
            nodeType: "paragraph"
        nodeType: "list-item"
    nodeType: "unordered-list"
```

The process for it would look like this

- start recursion with **rich-text.html**
- rich-text.html calls **rich-text/standard-blocks/unordered-list.html** because "nodeType" is set to unordered-list
- unordered-list.html loops through `content` and calls **rich-text/node-checker.html** for each item in the array.
- in the first item, node-checker.html calls **rich-text/standard-blocks/paragraph.html** since "nodeType" is set to paragraph
- paragraph.html calls **rich-text/node-checker.html**
- node-checker.html calls **rich-text/standard-blocks/text.html** because "nodeType" is set to text
- text.html is an exit condition so recursion for the first item ends
- the second item repeats the process from the first item

This ends up creating the following markup

```html
<ul>
    <li>
        <p>Here is a list item</p>
    </li>
    <li>
        <p>Here is another list item</p>
    </li>
</ul>
```