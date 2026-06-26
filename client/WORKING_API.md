# Working Formats & Tools API

User-facing endpoints for fetching working formats and tools uploaded by the admin. Both endpoints require authentication and a verified user role.

---

## Authentication

All endpoints require the following headers:

| Header | Value |
|---|---|



| `Authorization` | `Bearer <token>` |

---

## Endpoints

### 1. Get Working Formats

Returns all active working formats uploaded by the admin.

```
GET /working/formats
```

**Request**

No request body or query parameters required.

**Response — 200 OK**

```json
{
  "status": 200,
  "success": true,
  "message": "request was successfull",
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "productName": "Facebook Format 2024",
      "productDescription": "A working format for Facebook accounts",
      "type": "format",
      "sellingPrice": 500,
      "stockPics": 10,
      "stockImg": 5,
      "imageUrl": "https://storage.example.com/zeno-tools/zeno_org/zeno_abc123.jpg",
      "imageId": "zeno_org/zeno_abc123.jpg",
      "status": "active",
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-01T10:00:00.000Z"
    }
  ]
}
```

**Response Fields**

| Field | Type | Description |
|---|---|---|
| `status` | `Number` | HTTP status code |
| `success` | `Boolean` | Whether the request succeeded |
| `message` | `String` | Human-readable result message |
| `data` | `Array` | List of active format objects (empty array if none exist) |

**`data[]` Item Fields**

| Field | Type | Description |
|---|---|---|
| `_id` | `String` | Unique MongoDB ObjectId for this format |
| `productName` | `String` | Name of the format as set by admin |
| `productDescription` | `String` | Optional description of the format |
| `type` | `String` | Always `"format"` for this endpoint |
| `sellingPrice` | `Number` | Price of the format in your platform's currency unit |
| `stockPics` | `Number` | Number of pictures included in stock (if applicable) |
| `stockImg` | `Number` | Number of images included in stock (if applicable) |
| `imageUrl` | `String` | Public URL to the preview image hosted on storage |
| `imageId` | `String` | Internal storage path of the image (used for deletion) |
| `status` | `String` | Always `"active"` — inactive items are filtered out |
| `createdAt` | `String` | ISO 8601 timestamp of when the format was created |
| `updatedAt` | `String` | ISO 8601 timestamp of the last update |

---

### 2. Get Working Tools

Returns all active working tools uploaded by the admin.

```
GET /working/tools
```

**Request**

No request body or query parameters required.

**Response — 200 OK**

```json
{
  "status": 200,
  "success": true,
  "message": "request was successfull",
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c1e",
      "productName": "Email Extractor Tool",
      "productDescription": "A tool for extracting emails from platforms",
      "type": "tool",
      "sellingPrice": 1500,
      "stockPics": 3,
      "stockImg": 2,
      "imageUrl": "https://storage.example.com/zeno-tools/zeno_org/zeno_xyz789.png",
      "imageId": "zeno_org/zeno_xyz789.png",
      "status": "active",
      "createdAt": "2024-06-10T08:30:00.000Z",
      "updatedAt": "2024-06-10T08:30:00.000Z"
    }
  ]
}
```

**Response Fields**

| Field | Type | Description |
|---|---|---|
| `status` | `Number` | HTTP status code |
| `success` | `Boolean` | Whether the request succeeded |
| `message` | `String` | Human-readable result message |
| `data` | `Array` | List of active tool objects (empty array if none exist) |

**`data[]` Item Fields**

| Field | Type | Description |
|---|---|---|
| `_id` | `String` | Unique MongoDB ObjectId for this tool |
| `productName` | `String` | Name of the tool as set by admin |
| `productDescription` | `String` | Optional description of the tool |
| `type` | `String` | Always `"tool"` for this endpoint |
| `sellingPrice` | `Number` | Price of the tool in your platform's currency unit |
| `stockPics` | `Number` | Number of pictures included in stock (if applicable) |
| `stockImg` | `Number` | Number of images included in stock (if applicable) |
| `imageUrl` | `String` | Public URL to the preview image hosted on storage |
| `imageId` | `String` | Internal storage path of the image (used for deletion) |
| `status` | `String` | Always `"active"` — inactive items are filtered out |
| `createdAt` | `String` | ISO 8601 timestamp of when the tool was created |
| `updatedAt` | `String` | ISO 8601 timestamp of the last update |

---

## Error Responses

Both endpoints share the same error response shape.

**401 Unauthorized — user not found or token invalid**

```json
{
  "status": 401,
  "success": false,
  "message": "User not found"
}
```

**403 Forbidden — missing or invalid role**

```json
{
  "status": 403,
  "success": false,
  "message": "Forbidden"
}
```

**500 Internal Server Error**

```json
{
  "status": 500,
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

- Both endpoints return results sorted newest-first (`_id: -1`).
- Only items with `status: "active"` are returned. Items the admin has set to `"inactive"` are hidden from users.
- `stockPics` and `stockImg` may be `null` if the admin did not set them.
- `imageUrl` and `imageId` may be `null` if no image was attached to the product.
- `sellingPrice` is stored as a plain number — apply your own currency formatting on the frontend.
