---
updated: "2020-08-11T01:56:23.528Z"
createdAt: "2019-08-23T21:34:33.719Z"
date: "2019-08-23T21:34:33.719Z"
title: "Example With Text, Assets, and Entries"
slug: "example-with-text-assets-and-entries"
featuredImage:
  assetType: "image/jpeg"
  url: "//images.ctfassets.net/6fc4s4k6v9co/4up9JEFDVOMp1zLOqbAbRN/0054a3bbfc0c5cf4ae172c6957b5b42c/photo-1533227268428-f9ed0900fb3b"
  title: "Man in Red Shirt"
  description: "Man in red shirt excited because he was able to use port his rich text fields over to Hugo."
  width: 1779
  height: 1539
tags:
  - "rich text"
  - "text"
  - "assets"
  - "entries"
mainContent:
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "In this example we will see a bit of everything. Below me is an embedded asset."
        marks: []
        data: {}
    data:
      id: "nTLo2ffSJJp5QrnrO5IU9"
      contentType: "gallery"
  - nodeType: "embedded-asset-block"
    content: []
    data:
      assetType: "image/jpeg"
      url: "//images.ctfassets.net/6fc4s4k6v9co/4up9JEFDVOMp1zLOqbAbRN/0054a3bbfc0c5cf4ae172c6957b5b42c/photo-1533227268428-f9ed0900fb3b"
      title: "Man in Red Shirt"
      description: "Man in red shirt excited because he was able to use port his rich text fields over to Hugo."
      width: 1779
      height: 1539
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Below me here is an "
        marks: []
        data: {}
      - nodeType: "text"
        value: "embedded entry"
        marks:
          - "bold"
        data: {}
      - nodeType: "text"
        value: " where "
        marks: []
        data: {}
      - nodeType: "text"
        value: "contentType === gallery. "
        marks:
          - "code"
        data: {}
      - nodeType: "text"
        value: "I already have created a template for this which is why it displays below."
        marks: []
        data: {}
    data: {}
  - nodeType: "embedded-entry-block"
    content: []
    data:
      id: "nTLo2ffSJJp5QrnrO5IU9"
      contentType: "gallery"
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Here is an "
        marks: []
        data: {}
      - nodeType: "entry-hyperlink"
        content:
          - nodeType: "text"
            value: "entry hyperlink"
            marks: []
            data: {}
        data:
          id: "6WpgTH2wCLQNldpJw8fFoK"
          contentType: "post"
      - nodeType: "text"
        value: ""
        marks: []
        data: {}
    data: {}
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Here is an "
        marks: []
        data: {}
      - nodeType: "asset-hyperlink"
        content:
          - nodeType: "text"
            value: "asset hyperlink"
            marks: []
            data: {}
        data:
          assetType: "image/jpeg"
          url: "//images.ctfassets.net/6fc4s4k6v9co/61Vr40rLmmpyK4X9hD8Z2P/779cac848bddac52e025fcb5fddf03bc/photo-1533158307587-828f0a76ef46"
          title: "Lots of photos"
          width: 967
          height: 725
      - nodeType: "text"
        value: ""
        marks: []
        data: {}
    data: {}
  - nodeType: "embedded-asset-block"
    content: []
    data:
      assetType: "video/mp4"
      url: "//videos.ctfassets.net/6fc4s4k6v9co/70b2qVy19qzOdpGQjl79M8/860af3e1c27237cb1726b9cc3939d32d/Guild_Wars_2_06_26_17_2_47_35_AM.mp4"
      title: "Guild Wars 2 08 11 17 5 58 04 PM"
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: ""
        marks: []
        data: {}
    data: {}
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Next to me is an inline entry "
        marks: []
        data: {}
      - nodeType: "embedded-entry-inline"
        content: []
        data:
          id: "743Y9PAirb8FodggmzLdVn"
          contentType: "categories"
      - nodeType: "text"
        value: ". Pretty neat "
        marks: []
        data: {}
    data: {}
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Here is an "
        marks: []
        data: {}
      - nodeType: "entry-hyperlink"
        content:
          - nodeType: "text"
            value: "bold entry hyperlink"
            marks:
              - "bold"
            data: {}
        data:
          id: "2FJ57uwDeQcKhTzq1fil7Y"
          contentType: "post"
      - nodeType: "text"
        value: ". Followed by a "
        marks: []
        data: {}
      - nodeType: "asset-hyperlink"
        content:
          - nodeType: "text"
            value: "italicized asset hyperlink"
            marks:
              - "italic"
            data: {}
        data:
          assetType: "image/jpeg"
          url: "//images.ctfassets.net/6fc4s4k6v9co/5VdF15Q4Gzd3oU5WH2rl8n/447670d645f98d5cfcf42fa49e42c889/photo-1543769657-fcf1236421bc"
          title: "Handwritten note on paper"
          width: 1950
          height: 2600
      - nodeType: "text"
        value: "."
        marks: []
        data: {}
    data: {}
  - nodeType: "blockquote"
    content:
      - nodeType: "paragraph"
        content:
          - nodeType: "text"
            value: "And we have an inline entry "
            marks: []
            data: {}
          - nodeType: "embedded-entry-inline"
            content: []
            data:
              id: "2FJ57uwDeQcKhTzq1fil7Y"
              contentType: "post"
          - nodeType: "text"
            value: ". All inside the quote block. Pretty cool."
            marks: []
            data: {}
        data: {}
    data: {}
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Below me is an embedded asset with a assetType that I haven't created a template for."
        marks: []
        data: {}
    data: {}
  - nodeType: "embedded-asset-block"
    content: []
    data:
      assetType: "text/plain"
      url: "//assets.ctfassets.net/6fc4s4k6v9co/3rhYPMI6hBpgrTpxUDrITD/6b327926f69dbff550bb0307f71e7e66/asset.txt"
      title: "Example Text File"
      description: "This is a text file that was uploaded as an asset to contentful"
  - nodeType: "blockquote"
    content:
      - nodeType: "paragraph"
        content:
          - nodeType: "text"
            value: "This is a "
            marks: []
            data: {}
          - nodeType: "text"
            value: "multiline"
            marks:
              - "bold"
            data: {}
        data: {}
      - nodeType: "paragraph"
        content:
          - nodeType: "text"
            value: "quoteblock"
            marks: []
            data: {}
        data: {}
    data: {}
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: "Below me is an embedded entry that I have not created a template for."
        marks: []
        data: {}
    data: {}
  - nodeType: "embedded-entry-block"
    content: []
    data:
      id: "6WpgTH2wCLQNldpJw8fFoK"
      contentType: "post"
  - nodeType: "paragraph"
    content:
      - nodeType: "text"
        value: ""
        marks: []
        data: {}
    data: {}
mainContent_plaintext: "In this example we will see a bit of everything. Below me is an embedded asset. Below me here is an embedded entry where contentType === gallery. I already have created a template for this which is why it displays below. Here is an entry hyperlink Here is an asset hyperlink Next to me is an inline entry . Pretty neat  Here is an bold entry hyperlink. Followed by a italicized asset hyperlink. And we have an inline entry . All inside the quote block. Pretty cool. Below me is an embedded asset with a assetType that I haven't created a template for. This is a multiline quoteblock Below me is an embedded entry that I have not created a template for. "
---
