# Admin — Social Services API Documentation

**Base path prefix:** All routes require `Authorization` cookie/header (JWT) and the requesting user must have an admin role. Middleware chain: `authMiddleware` → `validateAdminRole`.

---

## Endpoints Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/social/services` | List & filter all social services |
| PATCH | `/admin/social/services/:id/visibility` | Show or hide a service |
| PATCH | `/admin/social/services/:id/custom-price` | Set or clear a custom price override |

---

## 1. List Social Services

**`GET /admin/social/services`**

Returns a paginated list of all social services synced from the ReallySimpleSocial (RSS) provider. Supports filtering and search.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | No | Filter by platform (e.g. `instagram`, `tiktok`, `youtube`). Stored lowercase. |
| `category` | string | No | Filter by category (e.g. `followers`, `likes`, `views`). |
| `status` | string | No | Filter by status. Enum: `active` \| `inactive` |
| `isVisible` | string | No | Filter by visibility. Pass `"true"` or `"false"` (string — converted internally to boolean). |
| `search` | string | No | Case-insensitive partial match on the service `name` field (regex). |
| `page` | number | No | Page number. Min: `1`. Default: `1`. |
| `limit` | number | No | Items per page. Min: `1`, Max: `100`. Default: `20`. |

### Controller Logic

- File: `src/controller/admin.controller.js` — `getSocialServices` (line 546)
- Builds a Mongoose query from whichever filters are provided.
- Runs `find()` and `countDocuments()` in parallel for efficiency.
- Results sorted by `createdAt` descending.
- Returns raw service documents with pagination metadata.

### Response `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "social services fetched successfully",
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "provider": "reallysimplesocial",
      "platform": "instagram",
      "category": "followers",
      "name": "Instagram Followers [Real]",
      "providerServiceId": 1023,
      "providerPrice": 0.54,
      "customPrice": null,
      "min": 100,
      "max": 10000,
      "refill": true,
      "cancel": false,
      "dripfeed": false,
      "isVisible": true,
      "status": "active",
      "lastSyncedAt": "2026-06-20T10:00:00.000Z",
      "createdAt": "2026-06-01T08:00:00.000Z",
      "updatedAt": "2026-06-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5
  }
}
```

---

## 2. Update Service Visibility

**`PATCH /admin/social/services/:id/visibility`**

Shows or hides a social service from users. Hidden services (`isVisible: false`) are excluded from all user-facing endpoints.

### URL Parameter

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the social service |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `isVisible` | boolean | Yes | Must be `true` or `false`. Validated by `updateSocialServiceVisibilitySchema`. |

```json
{ "isVisible": false }
```

### Controller Logic

- File: `src/controller/admin.controller.js` — `updateSocialServiceVisibility` (line 657)
- Validates `:id` is a valid MongoDB ObjectId — returns `400` if not.
- Calls `findByIdAndUpdate` with `{ $set: { isVisible } }`, returns the updated document.
- Returns `404` if no service matches the ID.

### Response `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "service visibility set to false",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "platform": "instagram",
    "category": "followers",
    "name": "Instagram Followers [Real]",
    "isVisible": false,
    "status": "active",
    "providerPrice": 0.54,
    "customPrice": null,
    "min": 100,
    "max": 10000,
    "refill": true,
    "cancel": false,
    "dripfeed": false,
    "lastSyncedAt": "2026-06-20T10:00:00.000Z",
    "createdAt": "2026-06-01T08:00:00.000Z",
    "updatedAt": "2026-06-24T12:00:00.000Z"
  }
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | `id` is not a valid MongoDB ObjectId |
| `400` | `isVisible` is missing or not a boolean |
| `404` | No service found with that ID |

---

## 3. Update Service Custom Price

**`PATCH /admin/social/services/:id/custom-price`**

Sets an admin-defined selling price override for a service. When `customPrice` is set, the pricing engine uses it directly instead of computing a markup over the provider's base price. Pass `null` to clear the override and revert to automatic markup pricing.

### URL Parameter

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the social service |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `customPrice` | number \| null | Yes | A non-negative number (NGN), or `null` / `""` to clear the override. Validated by `customPriceSchema`. |

**Set a custom price:**
```json
{ "customPrice": 1500 }
```

**Clear the override (revert to auto markup):**
```json
{ "customPrice": null }
```

### Controller Logic

- File: `src/controller/admin.controller.js` — `updateSocialServicePrice` (line 611)
- Validates `:id` is a valid MongoDB ObjectId — returns `400` if not.
- Fetches `PricingSetting` (USD→NGN rate + markup config) — returns `400` if none configured.
- Normalises `customPrice`: converts `""` or `null` → `null`, otherwise parses to `Number`.
- Calls `findByIdAndUpdate`, returns updated document.
- Attaches two computed fields to the response:
  - `costPrice` = `providerPrice × usdToNgnRate`
  - `sellingPrice` = result of `calculateSellingPrice(service, priceSetting)` — uses `customPrice` if set, otherwise applies the configured markup.

### Response `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "custom price updated successfully",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "platform": "tiktok",
    "category": "views",
    "name": "TikTok Views [Fast]",
    "providerPrice": 0.30,
    "customPrice": 1500,
    "costPrice": 480.00,
    "sellingPrice": 1500.00,
    "min": 500,
    "max": 500000,
    "isVisible": true,
    "status": "active",
    "refill": false,
    "cancel": true,
    "dripfeed": false,
    "lastSyncedAt": "2026-06-20T10:00:00.000Z",
    "createdAt": "2026-06-01T08:00:00.000Z",
    "updatedAt": "2026-06-24T12:00:00.000Z"
  }
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | `id` is not a valid MongoDB ObjectId |
| `400` | `customPrice` is missing, negative, or non-numeric |
| `400` | No `PricingSetting` document exists in the database |
| `404` | No service found with that ID |

---

## Data Model Reference — `SocialService`

> Schema file: `src/model/SocialServices.js`

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `provider` | string | `"reallysimplesocial"` | Indexed. Always RSS for now. |
| `providerServiceId` | number | — | RSS's own service ID. Unique per provider. |
| `platform` | string | — | Stored lowercase. Indexed. e.g. `instagram`, `tiktok`. |
| `category` | string | — | Indexed. e.g. `followers`, `likes`, `views`. |
| `name` | string | — | Human-readable service name from RSS. |
| `providerPrice` | number | — | Cost price in USD from RSS. Min: `0`. |
| `customPrice` | number \| null | `null` | Admin override price in NGN. `null` = use auto markup. |
| `min` | number | — | Minimum order quantity. |
| `max` | number | — | Maximum order quantity. |
| `refill` | boolean | `false` | Whether RSS supports refill for this service. |
| `cancel` | boolean | `false` | Whether RSS supports order cancellation. |
| `dripfeed` | boolean | `false` | Whether gradual delivery is supported. |
| `isVisible` | boolean | `true` | Controls user-facing visibility. |
| `status` | `active` \| `inactive` | `active` | Synced from RSS. |
| `lastSyncedAt` | Date | `Date.now` | Timestamp of last RSS sync. |
| `createdAt` | Date | auto | Mongoose timestamp. |
| `updatedAt` | Date | auto | Mongoose timestamp. |

**Unique index:** `provider` + `providerServiceId` (compound)

---

## Pricing Logic

Prices flow through two layers:

1. **Cost price (NGN):** `providerPrice (USD) × usdToNgnRate` — reflects the raw cost after currency conversion.
2. **Selling price (NGN):** Determined by `calculateSellingPrice()`:
   - If `customPrice` is set → selling price = `customPrice` (admin override, returned as-is).
   - If `customPrice` is `null` → selling price = cost price + markup, where markup is configured in `PricingSetting` as either a `fixed` NGN amount or a `percentage` of the cost price.

The `PricingSetting` collection must have at least one document for price-related endpoints to work.
