// Converts Contentful rich text to Hugo-flavored markdown

function rtListToMarkdown(nodes, listMode) {
    markdown = ""
    listIndex = 0
    for (node of nodes){
        listIndex += 1
        markdown += richTextToMarkdown(node, listMode, listIndex)
    }
    return markdown
}

function rtArrayToMarkdown(nodes, listMode=null, listIndex=0) {
    markdown = ""
    for (node of nodes){
        markdown += richTextToMarkdown(node, listMode, listIndex)
    }
    return markdown
}

function richTextToMarkdown(node, listMode=null, listIndex=0) {
    markdown = "";
    nodeType = node['nodeType'];
    content = node['content'];
    marks = node['marks']
    if (marks) {
        marks = marks.map(x => x.type);
    }
    data = node['data'];
    switch (nodeType) {
        case 'text':
            preMarks = "";
            postMarks = "";
            if (marks.indexOf('underline') >= 0) {
                preMarks = "<u>" + preMarks;
                postMarks = postMarks + "</u>";
            }
            if (marks.indexOf('bold') >= 0) {
                preMarks = "**" + preMarks;
                postMarks = postMarks + "** ";
            }
            if (marks.indexOf('italic') >= 0) {
                preMarks = "_" + preMarks;
                postMarks = postMarks + "_ ";
            }
            if (marks.indexOf('code') >= 0) {
                preMarks = "`" + preMarks;
                postMarks = postMarks + "`";
            }
            if (node['value']) {
                markdown += preMarks + node['value'].trim() + postMarks;
            }
            break;
        case 'paragraph':
            if (listMode === null) {
                markdown += "\n";
            }
            markdown += rtArrayToMarkdown(content, listMode, listIndex) + "\n";
            break;
        case 'blockquote':
            markdown += "\n> " + rtArrayToMarkdown(content, 'blockquote');
            break;
        case 'heading-1':
            markdown += "\n# " + rtArrayToMarkdown(content) + "\n";
            break;
        case 'heading-2':
            markdown += "\n## " + rtArrayToMarkdown(content) + "\n";
            break;
        case 'heading-3':
            markdown += "\n### " + rtArrayToMarkdown(content) + "\n";
            break;
        case 'heading-4':
            markdown += "\n#### " + rtArrayToMarkdown(content) + "\n";
            break;
        case 'heading-5':
            markdown += "\n##### " + rtArrayToMarkdown(content) + "\n";
            break;
        case 'entry-hyperlink':
            // not yet implemented
            break;
        case 'hyperlink':
            uri = data.uri
            markdown += "[" + rtArrayToMarkdown(content) + "](" + uri + ") ";
            break;
        case 'hr':
            markdown += "\n---\n\n";
            break;
        case 'list-item':
            if (listMode === 'ordered') {
                markdown += " " + listIndex + ". " + rtArrayToMarkdown(content, listMode, listIndex);
            } else {
                markdown += " - " + rtArrayToMarkdown(content, listMode, listIndex);
            }
            break;
        case 'unordered-list':
            markdown += "\n" + rtListToMarkdown(content, 'unordered');
            break;
        case 'ordered-list':
            markdown += "\n" + rtListToMarkdown(content, 'ordered');
            break;
        case 'embedded-asset-block':
            // not yet implemented
            break;
        case 'document':
            markdown += rtArrayToMarkdown(content);
            break;
    }
    return markdown;
}

module.exports = richTextToMarkdown;