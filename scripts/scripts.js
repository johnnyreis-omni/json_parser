(() => {
  const input = document.getElementById('jsonInput');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const treeEl = document.getElementById('tree');
  const out = document.getElementById('out');
  const emptyOutputHint = document.getElementById('emptyOutputHint');
  const tagEl = document.getElementById('tag');
  const previewEl = document.getElementById('preview');
  const prefixSelect = document.getElementById('prefixSelect');
  const fallbackInput = document.getElementById('fallbackInput');
  const searchBox = document.getElementById('searchBox');
  const resultsEl = document.getElementById('results');
  const expandAllBtn = document.getElementById('expandAll');
  const liveStatus = document.getElementById('live-status');
  const copyStatus = document.getElementById('copy-status');
  const themeBtn = document.getElementById('themeBtn');
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  const payloadStatusPill = document.getElementById('payloadStatusPill');

  const samplePayloadSelect = document.getElementById('samplePayloadSelect');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const samplePayloadInfo = document.getElementById('samplePayloadInfo');

  const fieldCheckInput = document.getElementById('fieldCheckInput');
  const fieldCheckBtn = document.getElementById('fieldCheckBtn');
  const fieldCheckResult = document.getElementById('fieldCheckResult');

  const tagValidatorInput = document.getElementById('tagValidatorInput');
  const validateTagsBtn = document.getElementById('validateTagsBtn');
  const tagValidationResults = document.getElementById('tagValidationResults');
  const tagValidatorStatus = document.getElementById('tagValidatorStatus');

  const compareModeBtn = document.getElementById('compareModeBtn');
  const mainView = document.getElementById('mainView');
  const compareView = document.getElementById('compareView');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const compareInputA = document.getElementById('compareInputA');
  const compareInputB = document.getElementById('compareInputB');
  const compareBtn = document.getElementById('compareBtn');
  const compareStatus = document.getElementById('compareStatus');
  const onlyAList = document.getElementById('onlyAList');
  const onlyBList = document.getElementById('onlyBList');
  const diffValuesList = document.getElementById('diffValuesList');

  let leafIndex = [];
  let nodeIndex = new Map();
  let lastTokens = null;
  let currentPayload;
  let hasParsedPayload = false;
  let lastFocusedBeforeHelp = null;

  const isObject = v => v && typeof v === 'object' && !Array.isArray(v);
  const isScalar = v => v === null || typeof v !== 'object';
  const isValidIdent = k => /^[A-Za-z_][A-Za-z0-9_]*$/.test(k);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const samplePayloads = [
      {
          "id": "shopify-paid-order",
          "label": "Shopify - Paid order",
          "description": "Use this to practice order, customer, discount, shipping, product, and order status URL paths.",
          "searchTerms": [
              "order_number",
              "email",
              "line_items",
              "order_status_url"
          ],
          "usefulPaths": [
              "raw.order_number",
              "raw.customer.email",
              "raw.line_items[0].title",
              "raw.line_items[0].product.product_url",
              "raw.order_status_url"
          ],
          "payload": {
              "raw": {
                  "id": 7001002003001,
                  "name": "#1024",
                  "order_number": 1024,
                  "confirmation_number": "SAMPLE1024",
                  "created_at": "2026-06-17T14:13:19Z",
                  "processed_at": "2026-06-17T14:13:18Z",
                  "currency": "USD",
                  "financial_status": "paid",
                  "fulfillment_status": null,
                  "current_subtotal_price": "89.90",
                  "current_total_discounts": "39.95",
                  "current_total_tax": "0.00",
                  "current_total_price": "89.90",
                  "order_status_url": "https://example-store.myshopify.com/orders/sample-1024/authenticate?key=sample",
                  "contact_email": "jane.customer@example.com",
                  "customer": {
                      "id": 9001002001,
                      "email": "jane.customer@example.com",
                      "first_name": "Jane",
                      "last_name": "Customer",
                      "verified_email": true,
                      "default_address": {
                          "city": "Austin",
                          "province_code": "TX",
                          "country_code": "US",
                          "zip": "78701"
                      }
                  },
                  "billing_address": {
                      "first_name": "Jane",
                      "last_name": "Customer",
                      "address1": "123 Sample Street",
                      "city": "Austin",
                      "province_code": "TX",
                      "country_code": "US",
                      "zip": "78701"
                  },
                  "shipping_address": {
                      "first_name": "Jane",
                      "last_name": "Customer",
                      "address1": "123 Sample Street",
                      "city": "Austin",
                      "province_code": "TX",
                      "country_code": "US",
                      "zip": "78701"
                  },
                  "discount_applications": [
                      {
                          "title": "BUY 2 GET 1 FREE",
                          "type": "automatic",
                          "value": "100.0",
                          "value_type": "percentage"
                      }
                  ],
                  "line_items": [
                      {
                          "id": 15856130981982,
                          "title": "Sunset Waves Punch Needle Kit",
                          "name": "Sunset Waves Punch Needle Kit",
                          "sku": "PN010-30x30",
                          "quantity": 1,
                          "price": "39.95",
                          "vendor": "Sample Brand",
                          "product_id": 7496050212958,
                          "variant_id": 42180052090974,
                          "variant_title": null,
                          "product": {
                              "id": "7496050212958",
                              "product_url": "https://example-store.myshopify.com/products/sunset-waves-punch-needle",
                              "product_image_urls": [
                                  "https://cdn.example.com/products/sunset-waves.jpg"
                              ],
                              "collections": [
                                  {
                                      "id": "292557881438",
                                      "title": "Punch Needle Kits"
                                  },
                                  {
                                      "id": "293063917662",
                                      "title": "New Arrivals"
                                  }
                              ],
                              "tags": [
                                  "beginner craft",
                                  "coastal art",
                                  "punch needle"
                              ]
                          },
                          "properties": []
                      },
                      {
                          "id": 15856131014750,
                          "title": "Custom Pet Punch Needle Kit",
                          "name": "Custom Pet Punch Needle Kit - Small",
                          "sku": "custom-30x30cm",
                          "quantity": 1,
                          "price": "49.95",
                          "vendor": "Sample Brand",
                          "product_id": 7629664616542,
                          "variant_id": 42680391663710,
                          "variant_title": "Small - 12x12",
                          "properties": [
                              {
                                  "name": "Your photo",
                                  "value": "https://uploads.example.com/customer-photo.jpg"
                              },
                              {
                                  "name": "thumbnail",
                                  "value": "https://uploads.example.com/customer-photo-thumb.jpg"
                              }
                          ]
                      }
                  ],
                  "shipping_lines": [
                      {
                          "code": "Tracked and Insured Shipping",
                          "price": "0.00",
                          "discounted_price": "0.00"
                      }
                  ]
              }
          }
      },
      {
          "id": "shopify-fulfilled-order",
          "label": "Shopify - Fulfilled order",
          "description": "Use this to practice fulfillment, tracking number, carrier, tracking URL, and fulfilled item paths.",
          "searchTerms": [
              "tracking_number",
              "tracking_company",
              "fulfillment",
              "line_items"
          ],
          "usefulPaths": [
              "fulfillment.name",
              "fulfillment.tracking_company",
              "fulfillment.tracking_number",
              "fulfillment.tracking_url",
              "fulfillment.line_items[0].title"
          ],
          "payload": {
              "fulfillment": {
                  "id": 5854925291677,
                  "name": "#1024.1",
                  "status": "success",
                  "created_at": "2026-06-17T14:02:30Z",
                  "updated_at": "2026-06-17T14:02:30Z",
                  "tracking_company": "USPS",
                  "tracking_number": "9400111202555012345678",
                  "tracking_numbers": [
                      "9400111202555012345678"
                  ],
                  "tracking_url": "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111202555012345678",
                  "tracking_urls": [
                      "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111202555012345678"
                  ],
                  "line_items": [
                      {
                          "id": 14702953824413,
                          "title": "The Itch-Free Foods List",
                          "sku": "DIGITAL-GUIDE",
                          "quantity": 1,
                          "fulfillment_status": "fulfilled",
                          "requires_shipping": false
                      }
                  ]
              },
              "order": {
                  "id": 6551151706269,
                  "name": "#1024",
                  "order_number": 1024,
                  "email": "jane.customer@example.com"
              }
          }
      },
      {
          "id": "shopify-started-checkout",
          "label": "Shopify - Started checkout",
          "description": "Use this to practice checkout URL, cart token, totals, customer email, and line item paths.",
          "searchTerms": [
              "checkout",
              "checkout_url",
              "cart_token",
              "subtotal_price"
          ],
          "usefulPaths": [
              "raw.checkout_id",
              "raw.checkout_token",
              "raw.checkout_url",
              "raw.customer.email",
              "raw.line_items[0].title"
          ],
          "payload": {
              "raw": {
                  "checkout_id": 31053465452701,
                  "checkout_token": "sample-checkout-token",
                  "checkout_url": "https://example-store.myshopify.com/checkouts/cn/sample-checkout-token",
                  "cart_token": "sample-cart-token",
                  "created_at": "2026-06-17T13:58:12Z",
                  "currency": "USD",
                  "subtotal_price": "46.20",
                  "total_discounts": "15.00",
                  "total_tax": "0.00",
                  "total_price": "31.20",
                  "customer": {
                      "email": "jane.customer@example.com",
                      "first_name": "Jane",
                      "last_name": "Customer"
                  },
                  "line_items": [
                      {
                          "title": "Night Relief Balm",
                          "quantity": 2,
                          "price": "23.10",
                          "variant_title": "Two pack",
                          "product": {
                              "handle": "night-relief-balm",
                              "product_url": "https://example-store.myshopify.com/products/night-relief-balm",
                              "image": "https://cdn.example.com/products/night-relief-balm.png"
                          }
                      }
                  ]
              }
          }
      },
      {
          "id": "shopify-add-to-cart",
          "label": "Shopify - Add to cart",
          "description": "Use this to practice product, cart, variant, quantity, image, discount, and option paths.",
          "searchTerms": [
              "added_item",
              "variant",
              "discounts",
              "image"
          ],
          "usefulPaths": [
              "added_item.title",
              "added_item.quantity",
              "added_item.product.product_url",
              "added_item.options_with_values[0].value",
              "cart.items[0].key"
          ],
          "payload": {
              "added_item": {
                  "id": 48378136952989,
                  "key": "48378136952989:sample-key",
                  "title": "Night Relief Balm",
                  "product_title": "Night Relief Balm",
                  "variant_title": "Two pack",
                  "quantity": 2,
                  "sku": "BALM-2PK",
                  "price": 3900,
                  "final_price": 3350,
                  "line_price": 6700,
                  "currency": "USD",
                  "image": "https://cdn.example.com/products/night-relief-balm.png",
                  "discounts": [
                      {
                          "amount": 1100,
                          "title": "Feel More Comfortable - 2 Jars"
                      }
                  ],
                  "options_with_values": [
                      {
                          "name": "Size",
                          "value": "Two pack"
                      }
                  ],
                  "product": {
                      "handle": "night-relief-balm",
                      "product_url": "https://example-store.myshopify.com/products/night-relief-balm",
                      "collections": [
                          {
                              "id": "skin-care",
                              "title": "Skin Care"
                          }
                      ],
                      "tags": [
                          "balm",
                          "night care",
                          "sensitive skin"
                      ]
                  }
              },
              "cart": {
                  "token": "sample-cart-token",
                  "total_price": 6700,
                  "item_count": 2,
                  "items": [
                      {
                          "key": "48378136952989:sample-key",
                          "quantity": 2,
                          "title": "Night Relief Balm"
                      }
                  ]
              },
              "city": "Chicago",
              "country": "US",
              "device": "mobile"
          }
      },
      {
          "id": "woocommerce-completed-order",
          "label": "WooCommerce - Completed order",
          "description": "Use this to practice WooCommerce-style billing, shipping, product, coupon, and order total paths.",
          "searchTerms": [
              "billing",
              "line_items",
              "coupon_lines",
              "payment_method"
          ],
          "usefulPaths": [
              "raw.id",
              "raw.billing.email",
              "raw.line_items[0].name",
              "raw.coupon_lines[0].code",
              "raw.total"
          ],
          "payload": {
              "raw": {
                  "id": 120045,
                  "number": "120045",
                  "status": "completed",
                  "currency": "USD",
                  "date_created": "2026-06-17T13:42:10",
                  "payment_method": "stripe",
                  "payment_method_title": "Credit card",
                  "discount_total": "10.00",
                  "shipping_total": "4.95",
                  "total": "64.90",
                  "billing": {
                      "first_name": "Jane",
                      "last_name": "Customer",
                      "email": "jane.customer@example.com",
                      "phone": "555-0100",
                      "city": "Austin",
                      "state": "TX",
                      "country": "US"
                  },
                  "shipping": {
                      "first_name": "Jane",
                      "last_name": "Customer",
                      "address_1": "123 Sample Street",
                      "city": "Austin",
                      "state": "TX",
                      "country": "US"
                  },
                  "line_items": [
                      {
                          "id": 55,
                          "name": "Flower Power Punch Needle Kit",
                          "product_id": 7496050442334,
                          "variation_id": 42180052320350,
                          "quantity": 1,
                          "sku": "PN017-30x30",
                          "subtotal": "39.95",
                          "total": "39.95",
                          "image": {
                              "src": "https://cdn.example.com/products/flower-power.jpg"
                          }
                      },
                      {
                          "id": 56,
                          "name": "Starter Yarn Bundle",
                          "product_id": 1001002,
                          "quantity": 1,
                          "sku": "YARN-BUNDLE",
                          "subtotal": "29.95",
                          "total": "24.95"
                      }
                  ],
                  "coupon_lines": [
                      {
                          "id": 12,
                          "code": "WELCOME10",
                          "discount": "10.00"
                      }
                  ],
                  "shipping_lines": [
                      {
                          "method_title": "Standard shipping",
                          "total": "4.95"
                      }
                  ]
              }
          }
      },
      {
          "id": "web-viewed-page",
          "label": "Web tracking - Viewed page",
          "description": "Use this to practice simple top-level paths without a raw wrapper, such as page, location, device, and session values.",
          "searchTerms": [
              "url",
              "title",
              "device",
              "sessionId"
          ],
          "usefulPaths": [
              "title",
              "url",
              "device",
              "city",
              "sessionId"
          ],
          "payload": {
              "sessionId": "sample-session-20260617134436",
              "title": "Checkout - Example Store",
              "url": "https://example-store.com/checkouts/sample-checkout-token",
              "referrer": "https://example-store.com/products/night-relief-balm",
              "device": "mobile",
              "os": "ios",
              "language": "en",
              "city": "Chicago",
              "country": "US"
          }
      },
      {
          "id": "custom-event-education",
          "label": "Custom event - Educational example",
          "description": "Use this to learn how missing, empty, null, and nested custom fields behave in the field checker and tag validator.",
          "searchTerms": [
              "plan",
              "trial",
              "referral",
              "empty_value"
          ],
          "usefulPaths": [
              "raw.customer.first_name",
              "raw.subscription.plan",
              "raw.trial.ends_at",
              "raw.empty_value",
              "raw.metadata.referral_code"
          ],
          "payload": {
              "event_name": "subscription_started",
              "raw": {
                  "customer": {
                      "email": "jane.customer@example.com",
                      "first_name": "Jane",
                      "last_name": "Customer"
                  },
                  "subscription": {
                      "plan": "Pro",
                      "billing_interval": "monthly",
                      "price": 29,
                      "currency": "USD"
                  },
                  "trial": {
                      "started_at": "2026-06-17T10:00:00Z",
                      "ends_at": "2026-07-01T10:00:00Z"
                  },
                  "metadata": {
                      "source": "API demo",
                      "referral_code": "FRIEND20",
                      "utm_campaign": "education-sample"
                  },
                  "empty_value": "",
                  "nullable_value": null,
                  "missing_value_note": "Try validating [[ event.raw.does_not_exist ]] to see an invalid result."
              }
          }
      }
  ];

  function announce(msg, isError = false) {
    if (!liveStatus) return;

    liveStatus.textContent = msg;
    liveStatus.style.whiteSpace = msg.includes('\n') ? 'pre-wrap' : '';

    liveStatus.classList.toggle('bad', isError);
    liveStatus.classList.toggle('good', !isError);
  }

  function setStatus(el, msg, type = '') {
    if (!el) return;

    el.textContent = msg;
    el.style.whiteSpace = msg.includes('\n') ? 'pre-wrap' : '';
    el.className = `status${type ? ` ${type}` : ''}${el.id === 'fieldCheckResult' ? ' mt-2' : ''}`;
  }

  function setPayloadStatus(type, text) {
    if (!payloadStatusPill) return;

    payloadStatusPill.textContent = text;
    payloadStatusPill.className = `status-pill${type ? ` ${type}` : ''}`;
  }

  function setResultCard(el, html, type) {
    if (!el) return;
    el.className = `result-card ${type}${el.id === 'fieldCheckResult' ? ' mt-2' : ''}`;
    el.innerHTML = html;
  }

  function setOutputVisible(isVisible) {
    if (out) out.style.display = isVisible ? 'grid' : 'none';
    if (emptyOutputHint) emptyOutputHint.classList.toggle('hidden', isVisible);
  }


  function highlightSearchText(text, query) {
    const raw = String(text ?? '');
    const needle = String(query || '').trim();

    if (!needle) return esc(raw);

    const lowerRaw = raw.toLowerCase();
    const lowerNeedle = needle.toLowerCase();
    let cursor = 0;
    let html = '';

    while (cursor < raw.length) {
      const index = lowerRaw.indexOf(lowerNeedle, cursor);

      if (index === -1) {
        html += esc(raw.slice(cursor));
        break;
      }

      html += esc(raw.slice(cursor, index));
      html += `<mark class="hit-highlight">${esc(raw.slice(index, index + needle.length))}</mark>`;
      cursor = index + needle.length;
    }

    return html;
  }

  function getSamplePayload(id) {
    return samplePayloads.find(sample => sample.id === id) || null;
  }

  function renderSamplePayloadInfo(sample) {
    if (!samplePayloadInfo) return;

    if (!sample) {
      samplePayloadInfo.textContent = 'Select a sample to see what it is useful for and which paths to try.';
      return;
    }

    const tags = sample.usefulPaths
      .map(path => `<span class="sample-tag">[[ event.${esc(path)} ]]</span>`)
      .join('');

    const searchTerms = sample.searchTerms
      .map(term => `<span class="sample-search-term">${esc(term)}</span>`)
      .join('');

    samplePayloadInfo.innerHTML = `
      <p><strong>${esc(sample.label)}</strong>: ${esc(sample.description)}</p>
      <div class="sample-tag-list mt-2" aria-label="Suggested tags to try">${tags}</div>
      <p class="mt-2">Try searching: ${searchTerms}</p>
    `;
  }

  function populateSamplePayloadOptions() {
    if (!samplePayloadSelect) return;

    samplePayloads.forEach(sample => {
      const option = document.createElement('option');
      option.value = sample.id;
      option.textContent = sample.label;
      samplePayloadSelect.appendChild(option);
    });

    if (loadSampleBtn) loadSampleBtn.disabled = true;
    renderSamplePayloadInfo(null);
  }

  function loadSelectedSamplePayload() {
    const sample = getSamplePayload(samplePayloadSelect?.value);

    if (!sample) {
      renderSamplePayloadInfo(null);
      return;
    }

    input.value = JSON.stringify(sample.payload, null, 2);
    searchBox.value = '';
    tryParse({ auto: true, sampleName: sample.label });
    renderSamplePayloadInfo(sample);
    input.focus();
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}

    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function tokenToString(t) {
    return t.t === 'key'
      ? isValidIdent(t.v)
        ? '.' + t.v
        : `['${String(t.v).replace(/'/g, "\\'")}']`
      : `[${t.v}]`;
  }

  function tokensToPath(tokens, { stripLeadingDot = false } = {}) {
    if (!tokens || !tokens.length) return '';

    let s = tokens.map(tokenToString).join('');

    if (stripLeadingDot && s.startsWith('.')) {
      s = s.slice(1);
    }

    return s;
  }

  function buildTag(tokens) {
    const prefix = prefixSelect.value.trim();
    const base = tokensToPath(tokens, { stripLeadingDot: true });
    const fb = fallbackInput.value.trim();

    let core = (prefix ? `${prefix}.` : '') + base;
    let tag = `[[ ${core} ]]`;

    if (fb) {
      tag = `[[ ${core} | default: '${fb.replace(/'/g, "\\'")}' ]]`;
    }

    return tag;
  }

  function stableStringify(value) {
    if (value === undefined) return 'undefined';
    if (value === null || typeof value !== 'object') return JSON.stringify(value);

    if (Array.isArray(value)) {
      return `[${value.map(stableStringify).join(',')}]`;
    }

    const keys = Object.keys(value).sort();
    return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }

  function displayValue(value, maxLength = 500) {
    let text = stableStringify(value);

    if (text === undefined) text = String(value);
    if (text.length > maxLength) text = `${text.slice(0, maxLength)}…`;

    return text;
  }

  function summarize(val) {
    if (val === undefined) return 'undefined';
    if (isScalar(val)) return JSON.stringify(val);
    if (Array.isArray(val)) return `Array(${val.length})`;
    return `Object(${Object.keys(val).length})`;
  }

  function printableChar(ch) {
    if (ch === undefined) return 'end of input';
    if (ch === '\n') return '\\n';
    if (ch === '\r') return '\\r';
    if (ch === '\t') return '\\t';
    return ch;
  }

  function getJsonLocation(text, position) {
    const pos = Math.max(0, Math.min(position, text.length));

    let line = 1;
    let column = 1;
    let lineStart = 0;

    for (let i = 0; i < pos; i++) {
      if (text[i] === '\r') {
        if (text[i + 1] === '\n' && i + 1 < pos) i++;
        line++;
        column = 1;
        lineStart = i + 1;
      } else if (text[i] === '\n') {
        line++;
        column = 1;
        lineStart = i + 1;
      } else {
        column++;
      }
    }

    const nextNewline = text.indexOf('\n', lineStart);
    const nextCarriage = text.indexOf('\r', lineStart);

    let lineEnd;

    if (nextNewline === -1 && nextCarriage === -1) {
      lineEnd = text.length;
    } else if (nextNewline === -1) {
      lineEnd = nextCarriage;
    } else if (nextCarriage === -1) {
      lineEnd = nextNewline;
    } else {
      lineEnd = Math.min(nextNewline, nextCarriage);
    }

    const lineText = text.slice(lineStart, lineEnd);

    return { line, column, lineText };
  }

  function formatJsonError(text, error) {
    const loc = getJsonLocation(text, error.position);

    const maxPreviewLength = 140;
    let preview = loc.lineText;
    let pointerColumn = loc.column;

    if (preview.length > maxPreviewLength) {
      const start = Math.max(0, loc.column - 70);
      const end = Math.min(preview.length, start + maxPreviewLength);

      preview = `${start > 0 ? '…' : ''}${preview.slice(start, end)}${end < loc.lineText.length ? '…' : ''}`;
      pointerColumn = loc.column - start + (start > 0 ? 1 : 0);
    }

    const safePreview = preview || '(empty line)';
    const pointer = `${' '.repeat(Math.max(pointerColumn - 1, 0))}^`;

    return `Invalid JSON at line ${loc.line}, column ${loc.column}: ${error.message}\n${safePreview}\n${pointer}`;
  }

  function selectJsonErrorPosition(position) {
    const pos = Math.max(0, Math.min(position, input.value.length));

    input.focus();

    try {
      input.setSelectionRange(pos, Math.min(pos + 1, input.value.length));
    } catch (e) {}
  }

  function getJsonSyntaxError(text) {
    let pos = 0;
    const len = text.length;

    const isWhitespace = ch => ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
    const isDigit = ch => ch >= '0' && ch <= '9';
    const isDigitOneToNine = ch => ch >= '1' && ch <= '9';
    const isHex = ch => /^[0-9a-fA-F]$/.test(ch || '');

    function skipWhitespace() {
      while (pos < len && isWhitespace(text[pos])) pos++;
    }

    function fail(message, at = pos) {
      return {
        message,
        position: Math.max(0, Math.min(at, len))
      };
    }

    function parseLiteral(literal) {
      for (let i = 0; i < literal.length; i++) {
        if (text[pos + i] !== literal[i]) {
          return fail(`Invalid literal. Expected "${literal}".`, pos + i);
        }
      }

      pos += literal.length;
      return null;
    }

    function parseString() {
      if (text[pos] !== '"') {
        return fail('Expected a double-quoted string.');
      }

      pos++;

      while (pos < len) {
        const ch = text[pos];

        if (ch === '"') {
          pos++;
          return null;
        }

        if (ch === '\\') {
          const slashPos = pos;
          pos++;

          if (pos >= len) {
            return fail('Unterminated escape sequence in string.', slashPos);
          }

          const escaped = text[pos];

          if ('"\\/bfnrt'.includes(escaped)) {
            pos++;
            continue;
          }

          if (escaped === 'u') {
            pos++;

            for (let i = 0; i < 4; i++) {
              if (!isHex(text[pos + i])) {
                return fail('Invalid unicode escape. Expected four hexadecimal characters after "\\u".', pos + i);
              }
            }

            pos += 4;
            continue;
          }

          return fail(`Invalid escape character "\\${printableChar(escaped)}".`, pos);
        }

        if (ch === '\n' || ch === '\r') {
          return fail('Unescaped line break inside string. Use "\\n" instead.', pos);
        }

        if (ch.charCodeAt(0) < 0x20) {
          return fail('Invalid control character inside string.', pos);
        }

        pos++;
      }

      return fail('Unterminated string. Expected closing double quote.', pos);
    }

    function parseNumber() {
      if (text[pos] === '-') {
        pos++;

        if (pos >= len) {
          return fail('Expected a digit after "-".', pos);
        }
      }

      if (text[pos] === '0') {
        pos++;

        if (isDigit(text[pos])) {
          return fail('Leading zeroes are not allowed in JSON numbers.', pos);
        }
      } else if (isDigitOneToNine(text[pos])) {
        pos++;

        while (isDigit(text[pos])) pos++;
      } else {
        return fail('Expected a digit.', pos);
      }

      if (text[pos] === '.') {
        pos++;

        if (!isDigit(text[pos])) {
          return fail('Expected at least one digit after the decimal point.', pos);
        }

        while (isDigit(text[pos])) pos++;
      }

      if (text[pos] === 'e' || text[pos] === 'E') {
        pos++;

        if (text[pos] === '+' || text[pos] === '-') pos++;

        if (!isDigit(text[pos])) {
          return fail('Expected at least one digit in the exponent.', pos);
        }

        while (isDigit(text[pos])) pos++;
      }

      return null;
    }

    function parseArray() {
      pos++;
      skipWhitespace();

      if (text[pos] === ']') {
        pos++;
        return null;
      }

      while (pos < len) {
        const valueError = parseValue();
        if (valueError) return valueError;

        skipWhitespace();

        if (text[pos] === ',') {
          const commaPos = pos;
          pos++;
          skipWhitespace();

          if (text[pos] === ']') {
            return fail('Trailing comma found. Remove the comma before "]".', commaPos);
          }

          continue;
        }

        if (text[pos] === ']') {
          pos++;
          return null;
        }

        if (pos >= len) {
          return fail('Expected "," or "]" before the end of the input.', pos);
        }

        return fail(`Expected "," or "]", but found "${printableChar(text[pos])}".`, pos);
      }

      return fail('Expected "]" before the end of the input.', pos);
    }

    function parseObject() {
      pos++;
      skipWhitespace();

      if (text[pos] === '}') {
        pos++;
        return null;
      }

      while (pos < len) {
        skipWhitespace();

        if (text[pos] !== '"') {
          return fail('Expected a double-quoted property name.', pos);
        }

        const keyError = parseString();
        if (keyError) return keyError;

        skipWhitespace();

        if (text[pos] !== ':') {
          return fail('Expected ":" after property name.', pos);
        }

        pos++;

        const valueError = parseValue();
        if (valueError) return valueError;

        skipWhitespace();

        if (text[pos] === ',') {
          const commaPos = pos;
          pos++;
          skipWhitespace();

          if (text[pos] === '}') {
            return fail('Trailing comma found. Remove the comma before "}".', commaPos);
          }

          continue;
        }

        if (text[pos] === '}') {
          pos++;
          return null;
        }

        if (pos >= len) {
          return fail('Expected "," or "}" before the end of the input.', pos);
        }

        return fail(`Expected "," or "}", but found "${printableChar(text[pos])}".`, pos);
      }

      return fail('Expected "}" before the end of the input.', pos);
    }

    function parseValue() {
      skipWhitespace();

      if (pos >= len) {
        return fail('Expected a JSON value, but reached the end of the input.', pos);
      }

      const ch = text[pos];

      if (ch === '{') return parseObject();
      if (ch === '[') return parseArray();
      if (ch === '"') return parseString();
      if (ch === '-' || isDigit(ch)) return parseNumber();
      if (ch === 't') return parseLiteral('true');
      if (ch === 'f') return parseLiteral('false');
      if (ch === 'n') return parseLiteral('null');

      return fail(`Unexpected "${printableChar(ch)}". Expected object, array, string, number, true, false, or null.`, pos);
    }

    skipWhitespace();

    if (pos >= len) {
      return fail('Paste JSON first.', pos);
    }

    const valueError = parseValue();
    if (valueError) return valueError;

    skipWhitespace();

    if (pos < len) {
      return fail(`Unexpected content after the JSON document: "${printableChar(text[pos])}".`, pos);
    }

    return null;
  }

  function normalizeTagOrPath(raw) {
    let path = String(raw || '').trim();

    if (!path) return { path: '', displayPath: '' };

    if ((path.startsWith('[[') && path.endsWith(']]')) || (path.startsWith('{{') && path.endsWith('}}'))) {
      path = path.slice(2, -2).trim();
    }

    const pipeIndex = path.indexOf('|');
    if (pipeIndex !== -1) path = path.slice(0, pipeIndex).trim();

    if (path.startsWith('event.')) path = path.slice('event.'.length);
    else if (path === 'event') path = '';
    else if (path.startsWith('event[')) path = path.slice('event'.length);

    if (path.startsWith('.')) path = path.slice(1);

    return {
      path,
      displayPath: path || '(root)'
    };
  }

  function parsePathToTokens(path) {
    const tokens = [];
    let i = 0;
    const text = String(path || '').trim();

    if (!text) return { tokens };

    while (i < text.length) {
      const ch = text[i];

      if (ch === '.') {
        i++;
        if (i >= text.length) return { error: 'Path cannot end with a dot.' };
        continue;
      }

      if (ch === '[') {
        i++;

        if (i >= text.length) return { error: 'Unclosed bracket in path.' };

        const quote = text[i] === '"' || text[i] === "'" ? text[i] : null;

        if (quote) {
          i++;
          let value = '';
          let closedQuote = false;

          while (i < text.length) {
            if (text[i] === '\\' && i + 1 < text.length) {
              value += text[i + 1];
              i += 2;
              continue;
            }

            if (text[i] === quote) {
              closedQuote = true;
              i++;
              break;
            }

            value += text[i];
            i++;
          }

          if (!closedQuote) return { error: 'Unclosed quoted key in path.' };

          while (text[i] === ' ') i++;
          if (text[i] !== ']') return { error: 'Expected closing bracket after quoted key.' };
          i++;

          tokens.push({ t: 'key', v: value });
          continue;
        }

        let raw = '';
        while (i < text.length && text[i] !== ']') {
          raw += text[i];
          i++;
        }

        if (text[i] !== ']') return { error: 'Unclosed bracket in path.' };
        i++;

        const value = raw.trim();
        if (!value) return { error: 'Empty brackets are not a valid path segment.' };

        if (/^\d+$/.test(value)) tokens.push({ t: 'index', v: Number(value) });
        else tokens.push({ t: 'key', v: value });

        continue;
      }

      let segment = '';
      while (i < text.length && text[i] !== '.' && text[i] !== '[') {
        segment += text[i];
        i++;
      }

      segment = segment.trim();
      if (!segment) return { error: 'Empty path segment found.' };

      tokens.push({ t: 'key', v: segment });
    }

    return { tokens };
  }

  function resolvePath(data, rawPath) {
    const parsed = parsePathToTokens(rawPath);
    if (parsed.error) return { exists: false, error: parsed.error };

    let value = data;

    for (const token of parsed.tokens) {
      if (token.t === 'index' || (Array.isArray(value) && token.t === 'key' && /^\d+$/.test(token.v))) {
        const idx = token.t === 'index' ? token.v : Number(token.v);

        if (!Array.isArray(value) || idx < 0 || idx >= value.length) {
          return { exists: false };
        }

        value = value[idx];
        continue;
      }

      if (value === null || value === undefined || typeof value !== 'object') {
        return { exists: false };
      }

      if (!Object.prototype.hasOwnProperty.call(value, token.v)) {
        return { exists: false };
      }

      value = value[token.v];
    }

    return { exists: true, value, tokens: parsed.tokens };
  }

  function isEmptyResolvedValue(value) {
    return value === null || value === undefined || value === '';
  }

  function makeNode(label, value, tokens, depth = 1) {
    const li = document.createElement('li');
    const pathStr = tokensToPath(tokens, { stripLeadingDot: true });

    li.className = 'collapsed';
    li.setAttribute('role', 'treeitem');
    li.setAttribute('aria-level', String(depth));
    li.setAttribute('aria-selected', 'false');
    li.dataset.path = pathStr;
    nodeIndex.set(pathStr, li);

    const expandable = !isScalar(value);
    li.setAttribute('aria-expanded', expandable ? 'false' : 'true');

    const node = document.createElement('div');
    node.className = 'node';
    node.tabIndex = -1;

    const chev = document.createElement('span');
    chev.className = 'chev';
    chev.textContent = '▸';

    if (!expandable) chev.style.visibility = 'hidden';

    const k = document.createElement('span');
    k.className = 'k';
    k.innerHTML = esc(label);

    const meta = document.createElement('span');
    meta.className = 'meta';

    if (isScalar(value)) {
      li.classList.remove('collapsed');
      meta.textContent = summarize(value);
    } else if (Array.isArray(value)) {
      meta.textContent = `Array(${value.length})`;
    } else {
      meta.textContent = `Object(${Object.keys(value).length})`;
    }

    node.appendChild(chev);
    node.appendChild(k);
    node.appendChild(meta);
    li.appendChild(node);

    const ul = document.createElement('ul');
    ul.setAttribute('role', 'group');
    li.appendChild(ul);

    if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        const childTokens = tokens.concat([{ t: 'index', v: idx }]);
        ul.appendChild(makeNode(`[${idx}]`, v, childTokens, depth + 1));

        if (isScalar(v)) {
          leafIndex.push({
            pathTokens: childTokens,
            pathStr: tokensToPath(childTokens, { stripLeadingDot: true }),
            type: typeof v,
            sample: v
          });
        }
      });
    } else if (isObject(value)) {
      Object.keys(value).sort().forEach(kkey => {
        const childTokens = tokens.concat([{ t: 'key', v: kkey }]);
        ul.appendChild(makeNode(kkey, value[kkey], childTokens, depth + 1));

        if (isScalar(value[kkey])) {
          leafIndex.push({
            pathTokens: childTokens,
            pathStr: tokensToPath(childTokens, { stripLeadingDot: true }),
            type: typeof value[kkey],
            sample: value[kkey]
          });
        }
      });
    }

    node.addEventListener('click', e => {
      e.stopPropagation();

      if (expandable) {
        const expanded = li.getAttribute('aria-expanded') === 'true';
        toggleExpand(li, !expanded);
      }

      selectNode(tokens, value, li);
      focusNode(node);
    });

    chev.addEventListener('click', e => {
      e.stopPropagation();

      if (expandable) {
        const expanded = li.getAttribute('aria-expanded') === 'true';
        toggleExpand(li, !expanded);
        focusNode(node);
      }
    });

    node.addEventListener('keydown', e => {
      const key = e.key;
      const current = li;

      switch (key) {
        case 'ArrowRight':
          e.preventDefault();

          if (expandable && current.classList.contains('collapsed')) {
            toggleExpand(current, true);
            focusNode(node);
          } else {
            const firstChild = current.querySelector(':scope > ul > li > .node');
            if (firstChild) firstChild.focus();
          }

          break;

        case 'ArrowLeft':
          e.preventDefault();

          if (expandable && !current.classList.contains('collapsed')) {
            toggleExpand(current, false);
            focusNode(node);
          } else {
            const parentLi = current.parentElement.closest('li[role="treeitem"]');
            if (parentLi) parentLi.querySelector(':scope > .node').focus();
          }

          break;

        case 'ArrowDown':
          e.preventDefault();
          focusNext(current)?.querySelector(':scope > .node')?.focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          focusPrev(current)?.querySelector(':scope > .node')?.focus();
          break;

        case 'Home':
          e.preventDefault();
          treeEl.querySelector('li[role="treeitem"] > .node')?.focus();
          break;

        case 'End':
          e.preventDefault();
          const all = [...treeEl.querySelectorAll('li[role="treeitem"]')];
          if (all.length) all[all.length - 1].querySelector(':scope > .node').focus();
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();

          if (expandable) {
            toggleExpand(current, current.classList.contains('collapsed'));
          }

          selectNode(tokens, value, li);
          break;
      }
    });

    return li;
  }

  function focusNode(nodeEl) {
    treeEl.querySelectorAll('.node[tabindex="0"]').forEach(n => {
      n.tabIndex = -1;
    });

    nodeEl.tabIndex = 0;
    nodeEl.focus();
  }

  function toggleExpand(li, expand = true) {
    if (!li) return;

    if (expand) {
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
    } else {
      li.classList.add('collapsed');
      li.setAttribute('aria-expanded', 'false');
    }
  }

  function focusNext(li) {
    const items = [...treeEl.querySelectorAll('li[role="treeitem"]')];
    const i = items.indexOf(li);
    return i >= 0 && i < items.length - 1 ? items[i + 1] : null;
  }

  function focusPrev(li) {
    const items = [...treeEl.querySelectorAll('li[role="treeitem"]')];
    const i = items.indexOf(li);
    return i > 0 ? items[i - 1] : null;
  }

  function selectNode(tokens, value, liEl) {
    treeEl.querySelectorAll('li[role="treeitem"]').forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('aria-selected', 'false');
    });

    liEl.classList.add('selected');
    liEl.setAttribute('aria-selected', 'true');

    lastTokens = tokens;

    tagEl.textContent = buildTag(tokens);
    previewEl.textContent = summarize(value);
    setOutputVisible(true);

    out.classList.add('animate-pop');
    setTimeout(() => out.classList.remove('animate-pop'), 220);
  }

  function getTreeItemByTokens(tokens) {
    const path = tokensToPath(tokens, { stripLeadingDot: true });
    return nodeIndex.get(path) || null;
  }

  function revealTreeItem(tokens) {
    const targetLi = getTreeItemByTokens(tokens);
    if (!targetLi) return null;

    let parent = targetLi.parentElement.closest('li[role="treeitem"]');

    while (parent) {
      toggleExpand(parent, true);
      parent = parent.parentElement.closest('li[role="treeitem"]');
    }

    toggleExpand(targetLi, true);

    return targetLi;
  }

  function buildTree(data) {
    treeEl.innerHTML = '';
    leafIndex = [];
    nodeIndex = new Map();
    lastTokens = null;

    const rootUl = document.createElement('ul');
    rootUl.setAttribute('role', 'group');
    treeEl.appendChild(rootUl);

    if (Array.isArray(data)) {
      const li = makeNode('root[]', data, []);
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
      rootUl.appendChild(li);

      setTimeout(() => {
        li.querySelector(':scope > .node').tabIndex = 0;
      }, 0);
    } else if (isObject(data)) {
      const li = makeNode('root', data, []);
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
      rootUl.appendChild(li);

      setTimeout(() => {
        li.querySelector(':scope > .node').tabIndex = 0;
      }, 0);
    } else {
      const li = document.createElement('li');
      li.setAttribute('role', 'treeitem');
      li.setAttribute('aria-level', '1');
      li.setAttribute('aria-selected', 'false');
      li.dataset.path = '';
      li.innerHTML = `<div class="node" tabindex="0"><span class="chev" style="visibility:hidden">•</span><span class="k">root</span><span class="meta">${esc(summarize(data))}</span></div>`;
      rootUl.appendChild(li);
      nodeIndex.set('', li);
    }
  }

  function updateParsedDependentControls() {
    const controls = [fieldCheckInput, fieldCheckBtn, tagValidatorInput, validateTagsBtn];

    controls.forEach(el => {
      if (el) el.disabled = !hasParsedPayload;
    });

    if (!hasParsedPayload) {
      setPayloadStatus('', 'No payload loaded');
      setStatus(fieldCheckResult, 'Parse a JSON payload first to check fields.');
      setStatus(tagValidatorStatus, 'Parse a JSON payload first to enable validation.');
      if (tagValidationResults) tagValidationResults.innerHTML = '';
      return;
    }

    const fieldCount = leafIndex.length;
    setPayloadStatus('ok', `${fieldCount} searchable field${fieldCount === 1 ? '' : 's'} loaded`);
    setStatus(fieldCheckResult, 'Ready to check a field path.', 'good');
    setStatus(tagValidatorStatus, 'Ready to validate tags.', 'good');
  }

  function clearOutput({ keepParsedPayload = false } = {}) {
    setOutputVisible(false);
    treeEl.innerHTML = '';
    resultsEl.innerHTML = '';
    leafIndex = [];
    nodeIndex = new Map();
    lastTokens = null;

    if (!keepParsedPayload) {
      currentPayload = undefined;
      hasParsedPayload = false;
    }

    updateParsedDependentControls();
  }

  function tryParse({ auto = false, sampleName = '' } = {}) {
    const txt = input.value;

    if (!txt.trim()) {
      announce('Paste JSON first', true);
      return;
    }

    const syntaxError = getJsonSyntaxError(txt);

    if (syntaxError) {
      announce(formatJsonError(txt, syntaxError), true);
      selectJsonErrorPosition(syntaxError.position);
      clearOutput();
      return;
    }

    try {
      const data = JSON.parse(txt);

      currentPayload = data;
      hasParsedPayload = true;

      buildTree(data);
      updateParsedDependentControls();

      setOutputVisible(false);
      resultsEl.innerHTML = '';

      announce(sampleName ? `Loaded sample: ${sampleName} ✓` : auto ? 'Valid JSON pasted and parsed ✓' : 'JSON parsed ✓');

      const first = treeEl.querySelector('.node');
      if (first) first.focus();
    } catch (err) {
      announce('Invalid JSON: ' + err.message, true);
      clearOutput();
    }
  }

  function runFieldCheck() {
    if (!hasParsedPayload) {
      setStatus(fieldCheckResult, 'Parse a JSON payload first to check fields.', 'bad');
      return;
    }

    const raw = fieldCheckInput.value.trim();

    if (!raw) {
      setStatus(fieldCheckResult, 'Type a field path or tag first.', 'warn');
      return;
    }

    const normalized = normalizeTagOrPath(raw);
    const resolved = resolvePath(currentPayload, normalized.path);

    if (resolved.error) {
      setResultCard(
        fieldCheckResult,
        `<div class="result-title">❌ Invalid path syntax</div><div class="result-value">${esc(resolved.error)}</div>`,
        'bad'
      );
      return;
    }

    if (!resolved.exists) {
      setResultCard(
        fieldCheckResult,
        `<div class="result-title">❌ Not found in payload</div><div class="result-value">${esc(normalized.displayPath)}</div>`,
        'bad'
      );
      return;
    }

    if (isEmptyResolvedValue(resolved.value)) {
      setResultCard(
        fieldCheckResult,
        `<div class="result-title">⚠️ Found but empty</div><div class="result-value">${esc(normalized.displayPath)} = ${esc(displayValue(resolved.value))}</div>`,
        'warn'
      );
      return;
    }

    setResultCard(
      fieldCheckResult,
      `<div class="result-title">✅ Found</div><div class="result-value">${esc(normalized.displayPath)} = ${esc(displayValue(resolved.value))}</div>`,
      'ok'
    );
  }

  function validateTags() {
    if (!hasParsedPayload) {
      setStatus(tagValidatorStatus, 'Parse a JSON payload first to enable validation.', 'bad');
      return;
    }

    const lines = tagValidatorInput.value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    tagValidationResults.innerHTML = '';

    if (!lines.length) {
      setStatus(tagValidatorStatus, 'Paste at least one tag to validate.', 'warn');
      return;
    }

    let validCount = 0;
    let emptyCount = 0;
    let invalidCount = 0;

    lines.forEach(line => {
      const normalized = normalizeTagOrPath(line);
      const resolved = resolvePath(currentPayload, normalized.path);
      const row = document.createElement('div');

      if (resolved.error || !resolved.exists) {
        invalidCount++;
        row.className = 'result-card bad';
        row.innerHTML = `
          <div class="result-title">❌ Invalid</div>
          <div class="result-value">${esc(line)}</div>
          <div class="text-xs mt-1 text-textmuted-light dark:text-textmuted-dark">Path checked: ${esc(normalized.displayPath)}${resolved.error ? ` · ${esc(resolved.error)}` : ''}</div>
        `;
      } else if (isEmptyResolvedValue(resolved.value)) {
        emptyCount++;
        row.className = 'result-card warn';
        row.innerHTML = `
          <div class="result-title">⚠️ Empty</div>
          <div class="result-value">${esc(line)}</div>
          <div class="text-xs mt-1 text-textmuted-light dark:text-textmuted-dark">${esc(normalized.displayPath)} = ${esc(displayValue(resolved.value))}</div>
        `;
      } else {
        validCount++;
        row.className = 'result-card ok';
        row.innerHTML = `
          <div class="result-title">✅ Valid</div>
          <div class="result-value">${esc(line)}</div>
          <div class="text-xs mt-1 text-textmuted-light dark:text-textmuted-dark">${esc(normalized.displayPath)} = ${esc(displayValue(resolved.value))}</div>
        `;
      }

      tagValidationResults.appendChild(row);
    });

    setStatus(
      tagValidatorStatus,
      `Checked ${lines.length} tag${lines.length === 1 ? '' : 's'}: ${validCount} valid, ${emptyCount} empty, ${invalidCount} invalid.`,
      invalidCount ? 'warn' : 'good'
    );
  }

  function flattenPayload(data) {
    const map = new Map();

    function walk(value, tokens) {
      const path = tokensToPath(tokens, { stripLeadingDot: true }) || '(root)';

      if (isScalar(value)) {
        map.set(path, value);
        return;
      }

      if (Array.isArray(value)) {
        if (!value.length) {
          map.set(path, []);
          return;
        }

        value.forEach((item, index) => {
          walk(item, tokens.concat([{ t: 'index', v: index }]));
        });

        return;
      }

      const keys = Object.keys(value).sort();

      if (!keys.length) {
        map.set(path, {});
        return;
      }

      keys.forEach(key => {
        walk(value[key], tokens.concat([{ t: 'key', v: key }]));
      });
    }

    walk(data, []);
    return map;
  }

  function parseJsonForCompare(text, label) {
    if (!text.trim()) {
      return { ok: false, message: `Payload ${label} is empty.` };
    }

    const syntaxError = getJsonSyntaxError(text);

    if (syntaxError) {
      return { ok: false, message: `Payload ${label}: ${formatJsonError(text, syntaxError)}` };
    }

    try {
      return { ok: true, data: JSON.parse(text) };
    } catch (err) {
      return { ok: false, message: `Payload ${label}: ${err.message}` };
    }
  }

  function renderCompareList(container, items, emptyText, type) {
    container.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'status';
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }

    const maxItems = 300;

    items.slice(0, maxItems).forEach(item => {
      const row = document.createElement('div');
      row.className = `result-card ${type}`;

      if (Object.prototype.hasOwnProperty.call(item, 'valueA')) {
        row.innerHTML = `
          <div class="result-title"><code>${esc(item.path)}</code></div>
          <div class="result-value">A: ${esc(displayValue(item.valueA, 240))}\nB: ${esc(displayValue(item.valueB, 240))}</div>
        `;
      } else {
        row.innerHTML = `
          <div class="result-title"><code>${esc(item.path)}</code></div>
          <div class="result-value">${esc(displayValue(item.value, 260))}</div>
        `;
      }

      container.appendChild(row);
    });

    if (items.length > maxItems) {
      const more = document.createElement('div');
      more.className = 'status warn';
      more.textContent = `Showing first ${maxItems} of ${items.length} results.`;
      container.appendChild(more);
    }
  }

  function comparePayloads() {
    const parsedA = parseJsonForCompare(compareInputA.value, 'A');
    const parsedB = parseJsonForCompare(compareInputB.value, 'B');

    onlyAList.innerHTML = '';
    onlyBList.innerHTML = '';
    diffValuesList.innerHTML = '';

    if (!parsedA.ok) {
      setStatus(compareStatus, parsedA.message, 'bad');
      return;
    }

    if (!parsedB.ok) {
      setStatus(compareStatus, parsedB.message, 'bad');
      return;
    }

    const flatA = flattenPayload(parsedA.data);
    const flatB = flattenPayload(parsedB.data);
    const onlyA = [];
    const onlyB = [];
    const changed = [];

    [...flatA.keys()].sort().forEach(path => {
      if (!flatB.has(path)) {
        onlyA.push({ path, value: flatA.get(path) });
        return;
      }

      const valueA = flatA.get(path);
      const valueB = flatB.get(path);

      if (stableStringify(valueA) !== stableStringify(valueB)) {
        changed.push({ path, valueA, valueB });
      }
    });

    [...flatB.keys()].sort().forEach(path => {
      if (!flatA.has(path)) {
        onlyB.push({ path, value: flatB.get(path) });
      }
    });

    renderCompareList(onlyAList, onlyA, 'No keys only in Payload A.', 'ok');
    renderCompareList(onlyBList, onlyB, 'No keys only in Payload B.', 'bad');
    renderCompareList(diffValuesList, changed, 'No shared keys with different values.', 'warn');

    const total = onlyA.length + onlyB.length + changed.length;

    setStatus(
      compareStatus,
      total
        ? `Compare complete: ${onlyA.length} only in A, ${onlyB.length} only in B, ${changed.length} changed.`
        : 'Compare complete: payloads match on flattened values.',
      total ? 'warn' : 'good'
    );
  }

  function showCompareMode() {
    mainView.classList.add('hidden');
    compareView.classList.remove('hidden');
    compareModeBtn.setAttribute('aria-pressed', 'true');
    compareInputA.focus();
  }

  function showMainMode() {
    compareView.classList.add('hidden');
    mainView.classList.remove('hidden');
    compareModeBtn.setAttribute('aria-pressed', 'false');
    compareModeBtn.focus();
  }

  function openHelpModal() {
    if (!helpModal) return;

    lastFocusedBeforeHelp = document.activeElement;
    helpModal.classList.remove('hidden');
    helpModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      closeHelpBtn?.focus();
    }, 0);
  }

  function closeHelpModal() {
    if (!helpModal) return;

    helpModal.classList.add('hidden');
    helpModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedBeforeHelp && typeof lastFocusedBeforeHelp.focus === 'function') {
      lastFocusedBeforeHelp.focus();
    }
  }

  document.addEventListener('click', async e => {
    const btn = e.target.closest('.copy');
    if (!btn) return;

    const targetId = btn.getAttribute('data-copy');
    const el = targetId ? document.getElementById(targetId) : null;
    const text = el ? el.textContent : '';

    if (!text) return;

    const ok = await copyToClipboard(text);
    const original = btn.textContent;

    btn.textContent = ok ? 'Copied!' : 'Copy failed';
    btn.classList.add('animate-pop');

    setTimeout(() => btn.classList.remove('animate-pop'), 220);

    if (copyStatus) {
      copyStatus.textContent = ok
        ? `${btn.getAttribute('aria-label') || 'Copied value'} to clipboard.`
        : 'Unable to copy. You can select the text and press ⌘/Ctrl+C.';
    }

    setTimeout(() => {
      btn.textContent = original;
    }, 1200);
  });

  searchBox.addEventListener('input', () => {
    const rawQuery = searchBox.value.trim();
    const q = rawQuery.toLowerCase();

    resultsEl.innerHTML = '';

    if (!q || !leafIndex.length) return;

    const hits = [];

    for (const p of leafIndex) {
      const keyHit = p.pathStr.toLowerCase().includes(q);
      const valStr = p.sample === null ? 'null' : String(p.sample);
      const valHit = valStr.toLowerCase().includes(q);

      if (keyHit || valHit) hits.push({ ...p, keyHit, valHit, valStr });
      if (hits.length >= 100) break;
    }

    for (const h of hits) {
      const div = document.createElement('div');

      div.className = 'search-result hit rounded-lg px-2 py-2 text-sm transition hover:bg-sky-500/10 cursor-pointer';
      div.setAttribute('role', 'option');
      div.setAttribute('tabindex', '0');
      div.title = `${h.pathStr} = ${h.valStr}`;

      const badge = h.keyHit && h.valHit ? 'key + value' : h.keyHit ? 'key' : 'value';

      div.innerHTML = `
        <span class="hit-badge">${badge}</span>
        <code class="hit-path">${highlightSearchText(h.pathStr, rawQuery)}</code>
        <span class="hit-value">${highlightSearchText(h.valStr, rawQuery)}</span>
      `;

      const choose = () => {
        const targetLi = revealTreeItem(h.pathTokens);

        if (targetLi) {
          selectNode(h.pathTokens, h.sample, targetLi);

          const nodeEl = targetLi.querySelector(':scope > .node');

          if (nodeEl) {
            focusNode(nodeEl);

            nodeEl.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        } else {
          tagEl.textContent = buildTag(h.pathTokens);
          previewEl.textContent = summarize(h.sample);
          setOutputVisible(true);
        }
      };

      div.addEventListener('click', choose);

      div.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose();
        }
      });

      resultsEl.appendChild(div);
    }
  });

  expandAllBtn.addEventListener('click', () => {
    treeEl.querySelectorAll('li.collapsed').forEach(li => {
      li.classList.remove('collapsed');
      li.setAttribute('aria-expanded', 'true');
    });
  });

  [prefixSelect, fallbackInput].forEach(el =>
    el.addEventListener('input', () => {
      if (!lastTokens) return;
      tagEl.textContent = buildTag(lastTokens);
    })
  );

  parseBtn.addEventListener('click', () => tryParse());


  samplePayloadSelect?.addEventListener('change', () => {
    const sample = getSamplePayload(samplePayloadSelect.value);

    if (loadSampleBtn) loadSampleBtn.disabled = !sample;
    renderSamplePayloadInfo(sample);
  });

  loadSampleBtn?.addEventListener('click', loadSelectedSamplePayload);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchBox.value = '';

    if (samplePayloadSelect) samplePayloadSelect.value = '';
    if (loadSampleBtn) loadSampleBtn.disabled = true;
    renderSamplePayloadInfo(null);

    clearOutput();
    announce('Cleared');
  });

  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const nowDark = root.classList.toggle('dark');

    localStorage.setItem('theme', nowDark ? 'dark' : 'light');

    const sun = document.getElementById('iconSun');
    const moon = document.getElementById('iconMoon');

    sun.classList.toggle('hidden', nowDark);
    moon.classList.toggle('hidden', !nowDark);

    themeBtn.classList.add('animate-pop');
    setTimeout(() => themeBtn.classList.remove('animate-pop'), 220);
  });

  input.addEventListener('paste', () => {
    setTimeout(() => {
      if (!input.value.trim()) return;
      tryParse({ auto: true });
    }, 0);
  });

  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      tryParse();
    }
  });

  fieldCheckBtn.addEventListener('click', runFieldCheck);

  fieldCheckInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runFieldCheck();
    }
  });

  validateTagsBtn.addEventListener('click', validateTags);

  tagValidatorInput.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      validateTags();
    }
  });

  helpBtn?.addEventListener('click', openHelpModal);
  closeHelpBtn?.addEventListener('click', closeHelpModal);

  helpModal?.addEventListener('click', e => {
    if (e.target === helpModal || e.target?.dataset?.helpClose === 'true') {
      closeHelpModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && helpModal && !helpModal.classList.contains('hidden')) {
      closeHelpModal();
    }
  });

  compareModeBtn.addEventListener('click', showCompareMode);
  backToMainBtn.addEventListener('click', showMainMode);
  compareBtn.addEventListener('click', comparePayloads);

  populateSamplePayloadOptions();
  updateParsedDependentControls();
})();