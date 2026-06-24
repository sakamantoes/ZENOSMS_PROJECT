# User — Social Services API Documentation

**Base path prefix:** All routes require a valid JWT (via `authMiddleware`) and the requesting user must have the `user` role (`validateUserRole`).

---

## Endpoints Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/social/platforms` | Get all available social media platforms |
| GET | `/social/categories` | Get service categories for a platform |
| GET | `/social/services` | Get services for a platform + category |
| POST | `/social/order` | Place a social media boost order |

---

## 1. Get Social Platforms

**`GET /social/platforms`**

Returns a list of all active, visible social media platforms that have at least one available service.

### Query Parameters

None.

### Controller Logic

- File: `src/controller/user.controller.js` — `getSocialServicePlatforms` (line 1226)
- Runs `SocialServices.distinct("platform")` filtered to `isVisible: true` and `status: "active"`.
- Returns only unique platform names as a flat array.

### Response `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "platforms",
  "data": ["instagram", "tiktok", "youtube", "facebook", "twitter"]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have the `user` role |

---

## 2. Get Service Categories

**`GET /social/categories`**

Returns all available service categories for a given platform (e.g. all category types offered for Instagram).

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | The platform name. Case-insensitive — converted to lowercase internally. |

### Controller Logic

- File: `src/controller/user.controller.js` — `getSocialServiceCategory` (line 1244)
- Validates that `platform` is present — returns `400` if missing.
- Runs `SocialServices.distinct("category")` filtered to the given platform (lowercased), `isVisible: true`, and `status: "active"`.
- Returns unique category names as a flat array.

### Example Request

```
GET /social/categories?platform=instagram
```

### Response `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "successfull",
  "data": ["followers", "likes", "views", "comments", "story views"]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | `platform` query param is missing |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have the `user` role |

---

## 3. Get Services

**`GET /social/services`**

Returns all orderable services for a specific platform and category, with calculated selling prices. This is the final step before placing an order — use the `_id` returned here as the `id` when calling Place Order.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | Platform name (e.g. `instagram`). Case-insensitive. |
| `category` | string | Yes | Category name (e.g. `followers`). Case-insensitive. |

### Controller Logic

- File: `src/controller/user.controller.js` — `getSocialServices` (line 1269)
- Validates both `platform` and `category` are present — returns `400` if either is missing.
- Fetches `PricingSetting` — returns `400` if none is configured.
- Queries services matching the platform + category (both lowercased), `isVisible: true`, `status: "active"`.
- Selects only: `_id`, `name`, `min`, `max`, `refill`, `cancel`, `providerPrice`, `customPrice`.
- Sorts by `customPrice` ascending.
- Maps each service through `calculateSellingPrice()` — strips internal pricing fields from the response so users only see the final selling price.

### Example Request

```
GET /social/services?platform=instagram&category=followers
```

### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "Instagram Followers [Real]",
      "min": 100,
      "max": 10000,
      "refill": true,
      "cancel": false,
      "sellingPrice": 1200.00
    },
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0e",
      "name": "Instagram Followers [Fast]",
      "min": 500,
      "max": 50000,
      "refill": false,
      "cancel": true,
      "sellingPrice": 950.00
    }
  ]
}
```

> `sellingPrice` is the price per **1000 units** in NGN. The total charge for an order is `(quantity / 1000) × sellingPrice`.

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | `platform` or `category` query param is missing |
| `400` | No `PricingSetting` document exists in the database |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have the `user` role |

---

## 4. Place Order

**`POST /social/order`**

Places a social media boost order for a specific service. Charges the user's wallet and submits the order to the ReallySimpleSocial (RSS) provider. The entire wallet deduction + order creation + receipt generation is wrapped in a MongoDB transaction for atomicity.

### Request Body

Validated by `placeOrderSchema` (`src/validator/user.validator.js`).

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | Valid MongoDB ObjectId | Service ID from `GET /social/services`. |
| `link` | string | Yes | Valid URL | Target social media URL to boost (post or profile). |
| `quantity` | number | Yes | Positive integer ≥ 1 | Units to order. Also checked against the service's `min`–`max` in the controller. |

```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "link": "https://www.instagram.com/p/ABC123/",
  "quantity": 1000
}
```

### Controller Logic

- File: `src/controller/user.controller.js` — `placeOrder` (line 1317)

**Step-by-step flow:**

1. **Authenticate user** — fetches the user document from DB by `req.user._id`. Returns `400` if not found.
2. **Validate service** — finds the service by `id` where `isVisible: true` and `status: "active"`. Returns `400` if unavailable.
3. **Validate quantity** — checks `quantity` is within `selectedService.min` and `selectedService.max`. Returns `400` with the allowed range in the message if out of bounds.
4. **Fetch pricing config** — loads `PricingSetting`. Returns `400` if missing.
5. **Calculate price** — `unitPrice = calculateSellingPrice(service, priceSetting)`, then `total = (quantity / 1000) × unitPrice`.
6. **Check wallet balance** — compares `user.walletBalance >= total`. Returns `400` with `"insufficient funds"` if not enough.
7. **Submit to RSS provider** — sends a `POST` to `https://reallysimplesocial.com/api/v2` with `action: "add"`, the service's `providerServiceId`, the `link`, and `quantity`. Returns `400` if the provider does not return an `order` ID (passes through the provider's error message if available).
8. **MongoDB transaction** — atomically:
   - Deducts `total` from `user.walletBalance` (uses `$gte` guard to prevent race conditions).
   - Creates a `SocialOrder` record.
   - Creates a `PurchaseReceipt` record with `status: "PENDING"` and balance snapshot.
9. **Rollback guard** — if the transaction fails after the provider order was successfully created, automatically calls `cancelProviderOrder(providerOrderId)` to avoid charging the provider without a local record.

### Response `200 OK`

```json
{
  "status": 200,
  "sucess": true,
  "message": "you purchase was successsfull",
  "data": {
    "reciept": {
      "_id": "...",
      "itemId": "...",
      "itemModel": "SocialOrder",
      "userId": "...",
      "amount": 1200.00,
      "status": "PENDING",
      "receiptNo": "RCP-XXXXXXX",
      "balanceBefore": 5000.00,
      "balanceAfter": 3800.00,
      "description": "Account Boosting",
      "createdAt": "2026-06-24T12:00:00.000Z"
    },
    "socialOrder": {
      "_id": "...",
      "userId": "...",
      "socialServiceId": "664f1a2b3c4d5e6f7a8b9c0d",
      "provider": "reallysimplesocial",
      "providerOrderId": 987654,
      "receiptNo": "RCP-XXXXXXX",
      "serviceName": "Instagram Followers [Real]",
      "link": "https://www.instagram.com/p/ABC123/",
      "quantity": 1000,
      "amount": 1200.00,
      "status": "pending",
      "providerPrice": 0.54,
      "startCount": null,
      "remains": null,
      "completedAt": null,
      "createdAt": "2026-06-24T12:00:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | User not found |
| `400` | Service is unavailable or hidden |
| `400` | `quantity` is outside the service's `min`–`max` range |
| `400` | `PricingSetting` not configured |
| `400` | Insufficient wallet balance |
| `400` | RSS provider rejected the order (passes through provider error message) |
| `400` | DB transaction failed (wallet re-checked with `$gte` guard) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have the `user` role |

---

## Typical User Flow

```
1.  GET /social/platforms
        → pick a platform (e.g. "instagram")

2.  GET /social/categories?platform=instagram
        → pick a category (e.g. "followers")

3.  GET /social/services?platform=instagram&category=followers
        → pick a service, note its _id and sellingPrice

4.  POST /social/order
        body: { id, link, quantity }
        → order placed, wallet charged, receipt returned
```

---

## Data Models Reference

### `SocialOrder`

> Schema file: `src/model/SocialOrders.js`

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId → User | The user who placed the order. |
| `socialServiceId` | ObjectId → SocialService | The service ordered. |
| `provider` | string | Always `"reallysimplesocial"`. |
| `providerOrderId` | number | Unique order ID returned by RSS. |
| `receiptNo` | string | Unique internal receipt number. |
| `link` | string | Target URL submitted to RSS. |
| `quantity` | number | Units ordered. Min: `1`. |
| `amount` | number | Total amount charged in NGN. Min: `0`. |
| `status` | string | Enum: `pending` \| `processing` \| `completed` \| `partial` \| `cancelled` \| `failed`. Default: `pending`. |
| `serviceName` | string | Snapshot of the service name at order time. |
| `providerPrice` | number | USD price from RSS at order time. |
| `startCount` | number \| null | Follower/view count at order start (filled by status sync). |
| `remains` | number \| null | Remaining units to be delivered. |
| `completedAt` | Date \| null | When the order was fully delivered. |
| `providerResponse` | Mixed \| null | Raw response from RSS (for debugging). |
| `createdAt` | Date | Mongoose auto timestamp. |
| `updatedAt` | Date | Mongoose auto timestamp. |

**Indexes:**
- `userId + createdAt` (compound, descending)
- `status + provider` (compound)

---

## Pricing Formula

| Variable | Value |
|----------|-------|
| `unitPrice` | `calculateSellingPrice(service, pricingSetting)` — NGN per 1000 units |
| `totalCharge` | `(quantity / 1000) × unitPrice` |

`calculateSellingPrice` returns `customPrice` if an admin has set one; otherwise it applies the configured markup (fixed NGN or percentage) over `providerPrice × usdToNgnRate`.
