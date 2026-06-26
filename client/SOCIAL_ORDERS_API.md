# User Social Orders API

Endpoint for fetching the authenticated user's social service order history (account boosting orders — followers, likes, views, etc.).

---

## Authentication

All endpoints require the following header:

| Header | Value |
|---|---|
| `Authorization` | `Bearer <token>` |

---

## Endpoint

### Get User Social Orders

Returns all social orders placed by the authenticated user, sorted newest first.

```
GET /social/orders
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
      "userId": "663e0a1b2c3d4e5f6a7b8c9d",
      "socialServiceId": "663e0a1b2c3d4e5f6a7b8c9e",
      "provider": "reallysimplesocial",
      "providerOrderId": 987654,
      "receiptNo": "RCP-20240601-00123",
      "link": "https://www.instagram.com/p/abc123/",
      "quantity": 1000,
      "amount": 250.00,
      "status": "completed",
      "startCount": 500,
      "remains": 0,
      "completedAt": "2024-06-01T12:45:00.000Z",
      "serviceName": "Instagram Followers",
      "providerPrice": 180.00,
      "providerResponse": null,
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-01T12:45:00.000Z"
    }
  ]
}
```

---

## Response Fields

| Field | Type | Description |
|---|---|---|
| `status` | `Number` | HTTP status code |
| `success` | `Boolean` | Whether the request succeeded |
| `message` | `String` | Human-readable result message |
| `data` | `Array` | List of social order objects. Empty array `[]` if the user has no orders |

---

## `data[]` Item Fields

| Field | Type | Nullable | Description |
|---|---|---|---|
| `_id` | `String` | No | Unique MongoDB ObjectId for this order |
| `userId` | `String` | No | ObjectId of the user who placed the order |
| `socialServiceId` | `String` | No | ObjectId referencing the social service that was purchased |
| `provider` | `String` | No | The third-party provider that processed the order. Default: `"reallysimplesocial"` |
| `providerOrderId` | `Number` | No | The order ID returned by the provider after purchase |
| `receiptNo` | `String` | No | Platform-generated unique receipt number for this transaction |
| `link` | `String` | No | The social media URL that was submitted for boosting (e.g. a post, profile, or video link) |
| `quantity` | `Number` | No | Number of units ordered (followers, likes, views, etc.) |
| `amount` | `Number` | No | Amount the user was charged in the platform's currency unit |
| `status` | `String` | No | Current order status. See [Status Values](#status-values) below |
| `startCount` | `Number` | Yes | The count on the link at the time the order started. `null` until the provider reports it |
| `remains` | `Number` | Yes | How many units are still pending delivery. `null` until the provider reports it |
| `completedAt` | `String` | Yes | ISO 8601 timestamp of when the order completed. `null` if not yet completed |
| `serviceName` | `String` | No | Human-readable name of the service (e.g. `"Instagram Followers"`) |
| `providerPrice` | `Number` | No | The cost the platform paid the provider for this order (internal/wholesale price) |
| `providerResponse` | `Object\|null` | Yes | Raw response data from the provider if stored. `null` in most cases |
| `createdAt` | `String` | No | ISO 8601 timestamp of when the order was placed |
| `updatedAt` | `String` | No | ISO 8601 timestamp of the last update to this order |

---

## Status Values

The `status` field reflects the live state of the order from the provider.

| Value | Description |
|---|---|
| `pending` | Order has been placed and is waiting for the provider to start processing |
| `processing` | The provider has started delivering the order |
| `completed` | All units have been delivered successfully |
| `partial` | The order was partially fulfilled — some units were delivered but not all |
| `cancelled` | The order was cancelled before or during delivery |
| `failed` | The order failed at the provider level |

---

## Error Responses

**401 Unauthorized — user not found or token missing/invalid**

```json
{
  "status": 401,
  "success": false,
  "message": "User not found"
}
```

**403 Forbidden — authenticated but missing required user role**

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

- Results are sorted **newest first** (`_id: -1`), so the most recent order is always at index `0`.
- `startCount` and `remains` are populated by background sync jobs that poll the provider — they will be `null` immediately after an order is placed.
- `amount` is the **selling price** the user paid. `providerPrice` is the internal wholesale cost and should not be displayed to users.
- `providerResponse` is reserved for raw provider data and is `null` in most scenarios.
- An empty `data: []` array is a valid success response when the user has not placed any orders yet.
