# Omnisend Personalization Path Builder

A lightweight web tool to explore JSON payloads and generate **Omnisend personalization tags**.  
It helps marketers and developers quickly find event fields, preview sample values, and copy them as tags for use in Omnisend campaigns.

---

## 🚀 Features

- **Paste & Parse JSON** → Automatically builds an expandable/collapsible tree view of your data.
- **Tree Navigation** → Click through nested objects/arrays, or use keyboard arrows to explore.
- **Search** → Find fields by key or sample value.
- **Tag Builder** → Generates valid Omnisend tags (`[[ event.field ]]`) with optional fallback support.
- **Copy Helpers** → Copy tags or preview values with one click.
- **Dark Mode** → Toggle between light and dark themes, with preference saved in `localStorage`.
- **Accessibility** → Keyboard-navigable tree and proper ARIA roles.
- **Performance** → Handles large JSON payloads with incremental rendering.

---

## 🛠️ Setup

- Just need to acesss this url : [Tool](https://johnnyreis-omni.github.io/json_parser/)

## 📖 Usage Guide

### 1. Paste JSON
- Go to the **“Paste JSON”** section.
- Paste any valid JSON payload (e.g., an Omnisend event object).
- Click **JSON Breakdown** or press `Ctrl/⌘ + Enter`.

### 2. Explore Fields
- The JSON appears as a **tree**:
  - Click nodes to expand/collapse.
  - Use **Arrow keys** to navigate.
  - `Enter` / `Space` toggles expansion.
  - `Home` / `End` jumps to start or end.

### 3. Generate Omnisend Tags
- Selecting a field shows:
  - **Omnisend tag** (`[[ event.raw.order_status_url ]]`)
  - **Preview value** (actual sample from JSON)
- Optional controls:
  - **Tag Prefix**: choose whether tags start with `event.` or no prefix.
  - **Fallback Value**: add `| default: 'value'`.

**Example**:  
```liquid
[[ event.raw.order_status_url | default: '' ]]
``` 




### 4. Search
- Use the **Quick Search** box to find keys or values.  
- Clicking a result highlights it in the tree.

### 5. Copy
- Use **Copy tag** or **Copy value** buttons.
- Status message confirms clipboard copy.

### 6. Theme Toggle
- Use the **sun/moon button** in the header.
- Choice is remembered in browser storage.

---

## 🧑‍💻 Keyboard Shortcuts

- `↑ / ↓` → Move between nodes  
- `→` → Expand node / move into children  
- `←` → Collapse node / move to parent  
- `Enter` or `Space` → Select and expand/collapse  
- `Home / End` → Jump to first or last node  
- `Ctrl/⌘ + Enter` → Parse JSON  


---

## ✅ Example

**Input JSON**:
```json
{
  "raw": {
    "subtotal": "99",
    "order_number": "123456"
  }
}
```

Generated tag:

```

[[ event.raw.order_number ]]

```

Preview:

``` 
123456
```