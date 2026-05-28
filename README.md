# Omnisend Personalization Path Builder

A lightweight web tool to explore JSON payloads and generate **Omnisend personalization tags**.

It helps marketers and developers quickly find event fields, preview sample values, and copy them as tags for use in Omnisend campaigns.

---

## 🚀 Features

- **Paste & Parse JSON**  
  Paste any valid JSON payload and the tool automatically parses it. You can also click **JSON Breakdown** or press `Ctrl/⌘ + Enter`.

- **Smart JSON Error Helper**  
  If the pasted JSON is invalid, the tool shows the exact line and column where the issue was found, including a caret preview pointing to the problem.

- **Expandable Tree Navigation**  
  Explore nested objects and arrays in a clear tree view. Click nodes to expand/collapse them, or use keyboard navigation.

- **Quick Search**  
  Search fields by key or sample value. Clicking a search result automatically expands the tree, reveals the matching field, highlights it, focuses it, and scrolls it into view.

- **Tag Builder**  
  Generates valid Omnisend tags like:

  ```liquid
  [[ event.raw.order_status_url ]]
  ```

  Optional fallback values are supported:

  ```liquid
  [[ event.raw.order_status_url | default: '' ]]
  ```

- **Copy Helpers**  
  Copy generated tags or preview values with one click.

- **Dark Mode**  
  Toggle between light and dark themes. The preference is saved in `localStorage`.

- **Accessibility**  
  Includes keyboard-navigable tree controls, ARIA roles, focus handling, and status messages.

- **Performance-Friendly Rendering**  
  Handles complex JSON structures with a clean, collapsible interface.

---

## 🛠️ Setup

Access the tool here:

[Omnisend Personalization Path Builder](https://johnnyreis-omni.github.io/json_parser/)

No installation is required.

If running locally, make sure the files are placed together like this:

```text
index.html
scripts.js
README.md
```

The HTML file loads:

```html
<script src="scripts.js"></script>
```

So the JavaScript file should be named `scripts.js`.

---

## 📖 Usage Guide

### 1. Paste JSON

Go to the **Paste JSON** section and paste a valid JSON payload.

The tool will automatically parse valid JSON after paste.

You can also manually parse by:

- Clicking **JSON Breakdown**
- Pressing `Ctrl/⌘ + Enter`

Example input:

```json
{
  "raw": {
    "subtotal": "99",
    "order_number": "123456",
    "order_status_url": "https://example.com/orders/123456"
  }
}
```

---

### 2. Fix Invalid JSON

If the JSON is invalid, the tool shows where the issue is located.

Example invalid JSON:

```json
{
  "raw": {
    "order_number": "123",
  }
}
```

Example error message:

```text
Invalid JSON at line 3, column 26: Trailing comma found. Remove the comma before "}".
    "order_number": "123",
                         ^
```

The textarea also focuses the problematic character so it is easier to fix.

Common JSON issues the helper can catch include:

- Trailing commas
- Missing commas
- Missing colons
- Unquoted property names
- Single quotes instead of double quotes
- Unclosed strings
- Invalid escape characters
- Invalid numbers
- Extra content after the JSON document

---

### 3. Explore Fields

After parsing, the JSON appears as a tree.

You can:

- Click nodes to expand or collapse them
- Select any field to generate a tag
- Use keyboard navigation to move through the tree
- Expand all nodes using the **Expand all** button

Selecting a field shows:

- The generated Omnisend tag
- A preview of the selected value

Example selected field:

```json
{
  "raw": {
    "order_number": "123456"
  }
}
```

Generated tag:

```liquid
[[ event.raw.order_number ]]
```

Preview value:

```text
"123456"
```

---

### 4. Generate Omnisend Tags

When a field is selected, the tool builds a personalization tag automatically.

Default format:

```liquid
[[ event.raw.order_number ]]
```

You can control the tag prefix using the **Tag prefix** dropdown.

Available options:

```text
event
none
```

With `event` prefix:

```liquid
[[ event.raw.order_number ]]
```

With no prefix:

```liquid
[[ raw.order_number ]]
```

---

### 5. Add a Fallback Value

Use the **Optional fallback** input to add a default value.

Example fallback:

```text
there
```

Generated tag:

```liquid
[[ event.raw.first_name | default: 'there' ]]
```

This is useful when the field may be missing or empty.

---

### 6. Use Quick Search

Use the **Quick search** box to search by:

- Field name
- Path
- Sample value

Example searches:

```text
email
order_number
line_items
city
example@example.com
```

Search results are labeled as either:

- `key`
- `value`

Clicking a Quick Search result will:

1. Expand the needed parent nodes in the tree
2. Reveal the matching field
3. Highlight the selected field
4. Focus the field for keyboard navigation
5. Scroll the matching field into view
6. Generate the corresponding Omnisend tag

This makes it easier to jump directly to deeply nested fields.

---

### 7. Copy Tags or Values

After selecting a field, use:

- **Copy tag** to copy the Omnisend tag
- **Copy value** to copy the preview value

A status message confirms whether the copy was successful.

---

### 8. Toggle Theme

Use the sun/moon button in the header to switch between light and dark mode.

The selected theme is saved in the browser using `localStorage`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `↑ / ↓` | Move between tree nodes |
| `→` | Expand node or move into children |
| `←` | Collapse node or move to parent |
| `Enter` | Select node and toggle expansion |
| `Space` | Select node and toggle expansion |
| `Home` | Jump to first node |
| `End` | Jump to last node |
| `Ctrl/⌘ + Enter` | Parse JSON manually |

---

## ✅ Example

### Input JSON

```json
{
  "raw": {
    "subtotal": "99",
    "order_number": "123456",
    "customer": {
      "email": "customer@example.com",
      "first_name": "Jane"
    }
  }
}
```

### Selecting `raw.order_number`

Generated tag:

```liquid
[[ event.raw.order_number ]]
```

Preview value:

```text
"123456"
```

### Selecting `raw.customer.first_name` with fallback `there`

Generated tag:

```liquid
[[ event.raw.customer.first_name | default: 'there' ]]
```

Preview value:

```text
"Jane"
```

---

## 🧪 Testing Checklist

Before publishing changes, test the following:

### Valid JSON

- Paste valid JSON
- Confirm the tree builds automatically
- Confirm **JSON Breakdown** still works
- Confirm `Ctrl/⌘ + Enter` still works

### Invalid JSON

- Paste JSON with a trailing comma
- Paste JSON with a missing comma
- Paste JSON with an unclosed string
- Paste JSON with an unquoted key
- Confirm the error shows line, column, and caret
- Confirm the textarea focuses the problem area

### Quick Search

- Search for a top-level field
- Search for a deeply nested field
- Search for a sample value
- Click a search result
- Confirm the tree expands to the matching field
- Confirm the field is highlighted and scrolled into view
- Confirm the generated tag is correct

### Copy Buttons

- Copy tag
- Copy preview value
- Confirm the status message updates

### Theme

- Toggle dark mode
- Refresh the page
- Confirm the theme preference is remembered

---

## 🧑‍💻 Notes for Developers

The main JavaScript file handles:

- JSON parsing
- Custom JSON syntax validation
- Error line/column detection
- Tree rendering
- Search indexing
- Search result reveal behavior
- Tag generation
- Fallback formatting
- Clipboard copy
- Keyboard navigation
- Theme persistence

Important functions include:

```js
tryParse()
getJsonSyntaxError()
formatJsonError()
buildTree()
makeNode()
revealTreeItem()
selectNode()
buildTag()
```

The Quick Search reveal behavior depends on indexing tree nodes by their generated path, so each tree item can be found and expanded when a search result is clicked.

---

## 📌 Roadmap Ideas

Possible future improvements:

- Copy full path without the Omnisend tag wrapper
- Tag format presets
- Recent JSON history
- Search result text highlighting
- Favorite or pinned fields
- Better array loop suggestions for line items
- Shareable state using URL parameters
- Download generated tag list
- Beautify/minify JSON controls

---

## 📝 License

Internal utility for Omnisend-related personalization workflows.
