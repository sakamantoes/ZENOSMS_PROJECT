# Working Orders History API

These two routes return a authenticated user's purchase history for items bought from the **Working** catalogue, filtered by product type (`tool` or `format`).

Both routes require a valid JWT bearer token and the user must hold the standard user role.

---

## 1. Get Tool Purchase History

### `GET /working/tool/history`

Returns every `WorkingOrder` record that belongs to the authenticated user where `productType` is `"tool"`, sorted newest-first.

### Request

| Item | Value |
|------|-------|
| Method | `GET` |
| Path | `/working/tool/history` |
| Auth | Bearer token (JWT) — `Authorization: Bearer <token>` |
| Body | None |
| Query params | None |

### Success Response — `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "request was successfull",
  "data": [ <WorkingOrder>, ... ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Token missing, expired, or user not found |
| `403` | Token present but role check failed |
| `500` | Unexpected server error |

---

## 2. Get Format Purchase History

### `GET /working/format/history`

Returns every `WorkingOrder` record that belongs to the authenticated user where `productType` is `"format"`, sorted newest-first.

### Request

| Item | Value |
|------|-------|
| Method | `GET` |
| Path | `/working/format/history` |
| Auth | Bearer token (JWT) — `Authorization: Bearer <token>` |
| Body | None |
| Query params | None |

### Success Response — `200 OK`

```json
{
  "status": 200,
  "success": true,
  "message": "request was successfull",
  "data": [ <WorkingOrder>, ... ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | Token missing, expired, or user not found |
| `403` | Token present but role check failed |
| `500` | Unexpected server error |

---

## WorkingOrder Object

Each element in the `data` array is a `WorkingOrder` document with the following fields.

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `_id` | `string` (ObjectId) | Yes | Unique identifier of the order |
| `userId` | `string` (ObjectId) | Yes | ID of the user who made the purchase |
| `workingId` | `string` (ObjectId) | Yes | ID of the `Working` catalogue item that was purchased |
| `productName` | `string` | Yes | Display name of the product at the time of purchase |
| `productType` | `"tool"` \| `"format"` | Yes | Discriminates which history endpoint returned this record |
| `sellingPrice` | `number` | Yes | Price the user paid, in the platform's currency unit (e.g. NGN) |
| `status` | `"PENDING"` \| `"COMPLETED"` \| `"FAILED"` \| `"REFUNDED"` | Yes | Lifecycle state of the order. Orders are set to `"COMPLETED"` immediately on successful purchase |
| `orderRef` | `string` | Yes | Unique human-readable receipt / reference number generated at checkout |
| `balanceBefore` | `number` | Yes | User's wallet balance (in NGN) **before** the deduction |
| `balanceAfter` | `number` | Yes | User's wallet balance (in NGN) **after** the deduction |
| `imageUrl` | `string` \| `null` | No | URL of the product's cover image; may be absent if no image was set |
| `imageId` | `string` \| `null` | No | Cloud storage identifier for the product image |
| `stockPics` | `number` \| `null` | No | Number of stock photos included with the product |
| `stockImg` | `number` \| `null` | No | Number of stock images included with the product |
| `completedAt` | `string` (ISO 8601 date) \| `null` | No | Timestamp when the order transitioned to `COMPLETED`; `null` for other statuses |
| `createdAt` | `string` (ISO 8601) | Yes | Timestamp when the order document was created (added automatically by Mongoose) |
| `updatedAt` | `string` (ISO 8601) | Yes | Timestamp of the most recent update to the document |

### Status values explained

| Value | Meaning |
|-------|---------|
| `PENDING` | Order created but not yet finalised |
| `COMPLETED` | Payment confirmed and product delivered — the normal end state for tools and formats |
| `FAILED` | Purchase attempt failed after the order document was written |
| `REFUNDED` | Amount was returned to the user's wallet |

---

## Example Responses

### Tool history — successful, one order

```json
{
  "status": 200,
  "success": true,
  "message": "request was successfull",
  "data": [
    {
      "_id": "6682a1c3f4e2b10012345678",
      "userId": "6671abc0f4e2b10099887766",
      "workingId": "6670de01f4e2b10056781234",
      "productName": "Elite Phishing Kit v3",
      "productType": "tool",
      "sellingPrice": 4500,
      "status": "COMPLETED",
      "orderRef": "ORD-20240628-00142",
      "balanceBefore": 10000,
      "balanceAfter": 5500,
      "imageUrl": "https://res.cloudinary.com/example/image/upload/v1/tools/elite-kit.jpg",
      "imageId": "tools/elite-kit",
      "stockPics": 0,
      "stockImg": 0,
      "completedAt": "2024-06-28T10:45:00.000Z",
      "createdAt": "2024-06-28T10:45:00.000Z",
      "updatedAt": "2024-06-28T10:45:00.000Z"
    }
  ]
}
```

### Format history — no orders yet

```json
{
  "status": 200,
  "success": true,
  "message": "request was successfull",
  "data": []
}
```

---

## Notes

- The `data` array is empty (`[]`) when the user has no orders of that type — the HTTP status is still `200`.
- Results are sorted by `_id` descending, so the most recent purchase appears first.
- `balanceBefore` and `balanceAfter` are stored in **NGN** (not kobo), matching the value displayed in the user's wallet UI.
- `sellingPrice` is also stored in **NGN**.
