# Files API Documentation

**Base path prefix:** All routes require a valid JWT (via `authMiddleware`) and the requesting user must have the `admin` role (`validateAdminRole`).

---

## Endpoints Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload-logo` | Upload an organization logo to Supabase storage |
| DELETE | `/delete-logo` | Delete an organization logo from Supabase storage |

---

## 1. Upload Logo

**`POST /upload-logo`**

Uploads a single image file to Supabase storage under the `zeno_org/` directory. Returns the public URL and storage path of the uploaded file.

### Middleware Chain

1. `authMiddleware` — validates the bearer JWT
2. `validateAdminRole` — ensures the authenticated user has the `admin` role
3. `upload.single("image")` — parses the multipart form-data; accepts one file under the field name `image`; max size **1 MB**

### Request

- **Content-Type:** `multipart/form-data`
- **Form field:** `image` — the image file to upload

### Constraints

| Field | Rule |
|-------|------|
| `image` | Required. Max file size: 1 MB. |

### Controller

- File: [src/controller/files.controller.js](../src/controller/files.controller.js) — `uploadLogo`
- Generates a random filename (`zeno_<random>.ext`) to avoid collisions.
- Uploads the file buffer to the `zeno-tools` Supabase storage bucket.
- Retrieves and returns the public URL.

### Response `201 Created`

```json
{
  "status": 201,
  "success": true,
  "data": {
    "url": "https://<supabase-project>.supabase.co/storage/v1/object/public/zeno-tools/zeno_org/zeno_abc123.png",
    "path": "zeno_org/zeno_abc123.png"
  }
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | No file was attached (`req.file` is undefined) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have admin role |
| `413` | File exceeds the 1 MB size limit (rejected by multer) |
| `500` | Supabase upload failed |

---

## 2. Delete Logo

**`DELETE /delete-logo`**

Removes an image from Supabase storage using its storage path.

### Middleware Chain

1. `authMiddleware` — validates the bearer JWT
2. `validateAdminRole` — ensures the authenticated user has the `admin` role
3. `deleteLogoSchema` — validates the request body
4. `validateData` — returns `422` with field errors if validation fails

### Request

- **Content-Type:** `application/json`

### Body Parameters

| Field | Type | Rules |
|-------|------|-------|
| `path` | `string` | Required. The storage path returned from the upload endpoint (e.g. `zeno_org/zeno_abc123.png`). |

```json
{
  "path": "zeno_org/zeno_abc123.png"
}
```

### Controller

- File: [src/controller/files.controller.js](../src/controller/files.controller.js) — `deleteLogo`
- Calls `supabase.storage.from("zeno-tools").remove([path])` with the provided path.

### Response `200 OK`

```json
{
  "status": 200,
  "success": true
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have admin role |
| `422` | `path` field is missing or empty |
| `500` | Supabase removal failed |

---

## Validation Schemas

| Schema | File | Applies to |
|--------|------|------------|
| `deleteLogoSchema` | [src/validator/files.validator.js](../src/validator/files.validator.js) | `DELETE /delete-logo` |

The upload route has no express-validator schema because the only input is the file itself, which is handled by multer.
