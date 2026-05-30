# Omnisend Personalization Path Builder

A lightweight, single-page web tool for exploring JSON payloads and generating **Omnisend personalization tags**.

It helps marketers, CSMs, implementation specialists, and developers quickly inspect event payloads, find usable fields, preview sample values, validate tags, and compare payloads without needing a local setup or build step.

Live tool:

[Omnisend Personalization Path Builder](https://johnnyreis-omni.github.io/json_parser/)

---

## What this tool helps with

Use this tool when you need to:

- Find the correct personalization path for an Omnisend event field
- Generate tags like `[[ event.raw.order_number ]]`
- Preview the value behind a field before using it in a campaign
- Check whether a field exists in a pasted payload
- Validate multiple tags against the current payload
- Compare two event payloads to understand what changed
- Debug invalid JSON with a clear line and column pointer

---

## Features

### Paste and auto-parse JSON

Paste a valid JSON payload into the **Load your JSON payload** section and the tool parses it automatically.

You can also manually parse with:

- **JSON Breakdown**
- `Ctrl/⌘ + Enter`

### Smart JSON error helper

If the payload is invalid, the tool shows:

- The exact line
- The exact column
- A short explanation
- A caret pointing to the problem location

Example:

```text
Invalid JSON at line 3, column 26: Trailing comma found. Remove the comma before "}".
    "order_number": "123",
                         ^
```

### Guided interface

The UI is organized into a simple workflow:

1. **Load payload**
2. **Find a field**
3. **Copy or validate**

The header also includes:

- Payload status indicator
- **Help me** button
- **Compare Payloads** button
- Dark/light mode toggle

### Help me modal

The **Help me** button opens an instruction modal explaining how to:

- Load JSON
- Fix JSON errors
- Find fields
- Build tags
- Check one field
- Validate multiple tags
- Compare payloads
- Use keyboard shortcuts

### Interactive JSON tree

Parsed JSON appears as an expandable/collapsible tree.

You can:

- Expand and collapse objects or arrays
- Select fields to generate tags
- Navigate using the keyboard
- Expand all tree nodes
- See object and array counts
- See scalar value previews

### Quick Search

Use **Quick search** to find fields by:

- Key name
- Full path
- Sample value

Clicking a search result:

1. Expands the required parent nodes
2. Reveals the matching field in the tree
3. Highlights the selected field
4. Focuses it for keyboard navigation
5. Scrolls it into view
6. Generates the corresponding Omnisend tag

Search results are displayed in a compact layout so long paths do not create horizontal scrolling.

### Tag Builder

Selecting a field generates an Omnisend personalization tag.

Example:

```liquid
[[ event.raw.order_status_url ]]
```

The tool supports:

- `event.` prefix
- No prefix
- Optional fallback values

Example with fallback:

```liquid
[[ event.raw.first_name | default: 'there' ]]
```

### Does this field exist?

Use the **Does this field exist?** checker to test a single path or full tag.

Accepted examples:

```text
raw.order_number
[[ event.raw.order_number ]]
[[ event.raw.customer.first_name | default: 'there' ]]
```

The checker returns:

- Found value
- Not found
- Found but empty
- Invalid path syntax

### Validate multiple tags

The **Validate multiple tags** section lets you paste one tag per line and validate all of them against the currently loaded payload.

Example input:

```liquid
[[ event.raw.order_number ]]
[[ event.raw.tracking_number ]]
[[ event.raw.customer.email ]]
```

Each result is labeled as:

- Valid — path resolves to a non-empty value
- Invalid — path does not exist
- Empty — path exists but value is `null`, `undefined`, or an empty string

### Compare Payloads

The **Compare Payloads** mode lets you paste two JSON payloads side by side.

This is useful for comparing:

- A working event vs. a broken event
- Old payload format vs. new payload format
- Shopify payload variations
- QA/test payloads vs. production payloads

The comparison shows:

- **Only in Payload A** — fields present in A but missing in B
- **Only in Payload B** — fields present in B but missing in A
- **In both but different values** — fields present in both with different values

### Copy helpers

Use one-click buttons to copy:

- Generated Omnisend tag
- Preview value

A status message confirms whether the copy succeeded.

### Dark mode

Use the sun/moon button in the header to switch between light and dark mode.

The theme preference is saved in `localStorage`.

### Accessibility

The tool includes:

- Keyboard-navigable tree controls
- ARIA roles for tree and dialog behavior
- Focus handling
- Status messages
- Escape-to-close help modal
- Skip-to-content link

---

## Setup

No installation is required for the hosted version.

Open:

[https://johnnyreis-omni.github.io/json_parser/](https://johnnyreis-omni.github.io/json_parser/)

### Local setup

Place the files together:

```text
index.html
scripts.js
README.md
```

The HTML file loads the JavaScript file with:

```html
<script src="scripts.js"></script>
```

So the JavaScript file should be named:

```text
scripts.js
```

There is no framework, no npm dependency, and no build step.

---

## Usage Guide

### 1. Load a JSON payload

Paste a valid JSON payload into **Load your JSON payload**.

Example:

```json
{
  "raw": {
    "subtotal": "99",
    "order_number": "123456",
    "order_status_url": "https://example.com/orders/123456",
    "customer": {
      "email": "customer@example.com",
      "first_name": "Jane"
    }
  }
}
```

The tool parses valid JSON automatically after paste.

You can also click **JSON Breakdown** or press `Ctrl/⌘ + Enter`.

---

### 2. Fix invalid JSON

If your JSON is invalid, the tool shows the error location.

Example invalid JSON:

```json
{
  "raw": {
    "order_number": "123",
  }
}
```

Example error:

```text
Invalid JSON at line 3, column 26: Trailing comma found. Remove the comma before "}".
    "order_number": "123",
                         ^
```

Common issues the helper can catch include:

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

### 3. Find a field

After parsing, you can find fields in three ways.

#### Option A — Use Quick Search

Search by key, path, or value.

Examples:

```text
email
order_number
line_items
city
example@example.com
```

Click any search result to jump to that field in the tree.

#### Option B — Browse the JSON tree

Click nodes to expand or collapse them.

Selecting a field shows:

- Generated Omnisend tag
- Preview value

#### Option C — Use Does this field exist?

Paste a path or tag into the single-field checker.

Examples:

```text
raw.order_number
[[ event.raw.order_number ]]
```

Then click **Check** or press `Enter`.

---

### 4. Generate a tag

When you select a field, the tool generates a tag automatically.

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

### 5. Change tag prefix

Use the **Tag prefix** dropdown.

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

### 6. Add a fallback value

Use **Optional fallback** to add a default value.

Fallback:

```text
there
```

Generated tag:

```liquid
[[ event.raw.customer.first_name | default: 'there' ]]
```

Fallbacks are useful when a field may be missing or empty.

---

### 7. Validate multiple tags

Open **Validate multiple tags**.

Paste one tag per line:

```liquid
[[ event.raw.order_number ]]
[[ event.raw.tracking_number ]]
[[ event.raw.customer.email ]]
```

Click **Validate Tags**.

The results show:

```text
Valid   - path exists and has a value
Invalid - path does not exist in the payload
Empty   - path exists but is null, undefined, or empty string
```

---

### 8. Compare two payloads

Click **Compare Payloads** in the header.

Paste:

- Payload A
- Payload B

Click **Compare**.

The tool shows:

- Fields only in Payload A
- Fields only in Payload B
- Shared fields with different values

Click **Back to main view** to return to the main builder.

---

### 9. Use Help me

Click **Help me** in the header to open the built-in usage guide.

Close it by:

- Clicking **Close**
- Pressing `Escape`
- Clicking outside the modal

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `↑ / ↓` | Move between tree nodes |
| `→` | Expand node or move into children |
| `←` | Collapse node or move to parent |
| `Enter` | Select node and toggle expansion |
| `Space` | Select node and toggle expansion |
| `Home` | Jump to first tree node |
| `End` | Jump to last tree node |
| `Ctrl/⌘ + Enter` in JSON input | Parse JSON manually |
| `Enter` in field checker | Check field |
| `Ctrl/⌘ + Enter` in tag validator | Validate tags |
| `Escape` | Close Help modal |

---

## Examples

### Basic payload

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

### Generated order number tag

```liquid
[[ event.raw.order_number ]]
```

Preview:

```text
"123456"
```

### Generated first name tag with fallback

```liquid
[[ event.raw.customer.first_name | default: 'there' ]]
```

Preview:

```text
"Jane"
```

### Field checker examples

```text
raw.order_number
[[ event.raw.order_number ]]
[[ event.raw.customer.email ]]
```

### Tag validator example

```liquid
[[ event.raw.order_number ]]
[[ event.raw.customer.email ]]
[[ event.raw.tracking_number ]]
```

---

## Testing Checklist

Before publishing changes, test the following.

### JSON parsing

- Paste valid JSON
- Confirm it parses automatically
- Confirm **JSON Breakdown** still works
- Confirm `Ctrl/⌘ + Enter` still works
- Confirm the payload status pill updates

### JSON errors

- Paste JSON with a trailing comma
- Paste JSON with a missing comma
- Paste JSON with an unclosed string
- Paste JSON with an unquoted key
- Confirm line, column, and caret are shown
- Confirm the textarea focuses the problem area

### Tree navigation

- Expand and collapse nested objects
- Select a scalar value
- Select an object
- Select an array
- Use arrow keys
- Use Home and End
- Use Expand all tree nodes

### Quick Search

- Search for a top-level field
- Search for a deeply nested field
- Search for a sample value
- Click a result
- Confirm the tree expands to the matching field
- Confirm the field is highlighted
- Confirm the selected field scrolls into view
- Confirm long paths do not create horizontal scrolling

### Tag Builder

- Select a field and confirm the tag is generated
- Switch prefix from `event` to `none`
- Add a fallback value
- Confirm tag updates when prefix or fallback changes

### Field checker

- Check a valid path
- Check a full tag
- Check a tag with a fallback filter
- Check a missing path
- Check an empty/null field
- Check invalid path syntax

### Tag validator

- Paste multiple valid tags
- Include invalid tags
- Include empty/null fields
- Confirm counts update correctly
- Confirm `Ctrl/⌘ + Enter` validates

### Compare Payloads

- Compare two identical payloads
- Compare payloads with missing fields
- Compare payloads with different values
- Test invalid JSON in Payload A
- Test invalid JSON in Payload B
- Confirm **Back to main view** works

### Help modal

- Open Help me
- Close with Close button
- Close with Escape
- Confirm focus returns correctly

### Theme

- Toggle dark mode
- Refresh the page
- Confirm theme preference is remembered

---

## Notes for Developers

The app is built with:

- HTML
- Tailwind CDN
- Vanilla CSS
- Vanilla JavaScript

There is:

- No React
- No Vue
- No npm
- No bundler
- No build step

### Main JavaScript responsibilities

`scripts.js` handles:

- JSON parsing
- Custom JSON syntax validation
- Error line/column detection
- Tree rendering
- Tree keyboard navigation
- Search indexing
- Search result reveal behavior
- Tag generation
- Fallback formatting
- Field existence checks
- Multi-tag validation
- Payload diffing
- Clipboard copy
- Help modal behavior
- Compare mode behavior
- Theme persistence
- Payload status updates

### Important functions

```js
tryParse()
getJsonSyntaxError()
formatJsonError()
buildTree()
makeNode()
revealTreeItem()
selectNode()
buildTag()
normalizeTagOrPath()
parsePathToTokens()
resolvePath()
runFieldCheck()
validateTags()
flattenPayload()
comparePayloads()
openHelpModal()
closeHelpModal()
```

### Search reveal behavior

Quick Search depends on a path-to-node index.

Each tree item receives a generated path, and `nodeIndex` stores the matching tree element. When a user clicks a search result, the tool expands all parent nodes, selects the matched node, focuses it, and scrolls it into view.

### Compare behavior

Compare mode flattens both payloads into dot-notation paths, then checks:

- Keys present only in A
- Keys present only in B
- Keys present in both with different serialized values

---

## Roadmap Ideas

Possible future improvements:

- Copy full path without tag wrapper
- Tag format presets
- Recent JSON history
- Search result text highlighting
- Favorite or pinned fields
- Better array loop suggestions for line items
- Shareable state using URL parameters
- Download generated tag list
- Beautify/minify JSON controls
- Export compare results
- Load sample payloads
- Add path suggestions for common ecommerce fields

---

## License

Internal utility for Omnisend-related personalization workflows.