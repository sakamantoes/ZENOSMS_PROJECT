# Admin API Documentation

**Base URL:** `/api/admin`

All routes require a valid JWT (via `authMiddleware`) and the requesting user must have the admin role (`validateAdminRole`). Authentication is cookie-based.

---

## Table of Contents

1. [Get All Platform Deposits](#1-get-all-platform-deposits)
2. [Update Deposit Status](#2-update-deposit-status)
3. [Update Global Pricing Settings](#3-update-global-pricing-settings)
4. [Get Pending OTP Orders](#4-get-pending-otp-orders)
5. [Get SMSBower Services (Paginated)](#5-get-smsbower-services-paginated)
6. [Get SMSBower Service Names (Aggregated)](#6-get-smsbower-service-names-aggregated)
7. [Get Getatext Services (Paginated)](#7-get-getatext-services-paginated)
8. [Get Getatext Service Names (Aggregated)](#8-get-getatext-service-names-aggregated)
9. [Toggle SMSBower Service Active Status](#9-toggle-smsbower-service-active-status)
10. [Set Custom Price on a Service](#10-set-custom-price-on-a-service)
11. [Get Getatext Provider Balance](#11-get-getatext-provider-balance)

---

## 1. Get All Platform Deposits

**`POST /api/admin/deposit`**

Returns every wallet transaction record stored in the platform (deposits and purchases). No filters are applied — the full collection is returned.

### Request

| Part  | Field | Type | Required | Description |
|-------|-------|------|----------|-------------|
| Body  | —     | —    | No       | No body needed |

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "your deposits was successfull",
  "data": [
    {
      "_id": "ObjectId",
      "userId": "ObjectId",
      "depositorName": "string",
      "type": "DEPOSIT | PURCHASE",
      "amount": 5000,
      "status": "PENDING | SUCCESS | FAILED",
      "referenceId": "string",
      "orderId": "string",
      "paymentMethod": "ALAT | SQUAD | MANUAL_TRANSFER",
      "balanceBefore": 0,
      "balanceAfter": 5000,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

> `data` is an empty array `[]` when no transactions exist.

---

## 2. Update Deposit Status

**`PATCH /api/admin/deposit/:id`**

Approves or rejects a wallet transaction that is currently `PENDING` or `FAILED`. When the status is set to `SUCCESS`, the user's wallet balance is incremented by the transaction amount atomically inside a MongoDB session, and `balanceBefore`/`balanceAfter` are recorded on the transaction.

### Request

| Part   | Field    | Type   | Required | Description |
|--------|----------|--------|----------|-------------|
| Params | `id`     | string | Yes      | MongoDB ObjectId of the WalletTransaction |
| Body   | `status` | string | Yes      | One of `pending`, `failed`, `success` (case-insensitive) |

#### Example Body

```json
{
  "status": "success"
}
```

### Response `200` — status updated but NOT approved (pending/failed)

```json
{
  "status": 200,
  "success": true,
  "message": "your request is successful",
  "data": {
    "_id": "ObjectId",
    "status": "FAILED",
    ...transactionFields
  }
}
```

### Response `200` — status set to SUCCESS (wallet credited)

```json
{
  "status": 200,
  "success": true,
  "message": "your request is successful",
  "data": {
    "receipt": {
      "_id": "ObjectId",
      "status": "SUCCESS",
      "balanceBefore": 0,
      "balanceAfter": 5000,
      ...transactionFields
    },
    "user": {
      "_id": "ObjectId",
      "walletBalance": 5000,
      ...userFields
    }
  }
}
```

### Error Cases

| Status | Reason |
|--------|--------|
| `400`  | `id` is not a valid ObjectId |
| `400`  | `status` field missing |
| `400`  | Transaction is not in `PENDING` or `FAILED` state |

---

## 3. Update Global Pricing Settings

**`POST /api/admin/pricing/setting`**

Creates or updates the single global pricing configuration document (upsert). Controls the USD→NGN conversion rate and the global markup applied to all service prices.

### Request

| Part | Field         | Type   | Required | Description |
|------|---------------|--------|----------|-------------|
| Body | `nairaRate`   | string | Yes      | USD to NGN exchange rate (e.g. `"1600"`) |
| Body | `markupType`  | string | Yes      | `"fixed"` or `"percentage"` |
| Body | `markupValue` | string | Yes      | The markup amount or percentage value |

#### Example Body

```json
{
  "nairaRate": "1620",
  "markupType": "percentage",
  "markupValue": "15"
}
```

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "you have successfully updated product price",
  "data": {
    "_id": "ObjectId",
    "usdToNgnRate": "1620",
    "globalMarkupType": "percentage",
    "globalMarkupValue": "15",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

## 4. Get Pending OTP Orders

**`GET /api/admin/pending/otp`**

Returns a paginated list of OTP orders currently in the `WAITING_FOR_SMS` state — i.e. orders where a phone number has been assigned but the SMS has not arrived yet. Results are sorted newest first. The `userId` field is populated with the user's `username` and `email`.

### Request

| Part  | Field   | Type   | Required | Default | Constraints |
|-------|---------|--------|----------|---------|-------------|
| Query | `page`  | number | No       | `1`     | min 1 |
| Query | `limit` | number | No       | `5`     | min 1, max 20 |

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "success",
  "data": {
    "total": 42,
    "otpOrders": [
      {
        "_id": "ObjectId",
        "userId": {
          "_id": "ObjectId",
          "username": "john_doe",
          "email": "john@example.com"
        },
        "provider": "smsbower | smspool",
        "service": "string",
        "country": "string",
        "phoneNumber": "+1234567890",
        "activationId": "string",
        "status": "WAITING_FOR_SMS",
        "otpCode": null,
        "otpMessage": null,
        "sellingPrice": 500,
        "providerPrice": 0.25,
        "expiresAt": "ISO date",
        "purchasedAt": "ISO date",
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      }
    ]
  }
}
```

---

## 5. Get SMSBower Services (Paginated)

**`GET /api/admin/all/bower/services`**

Returns a paginated list of all `smsbower` service listings from the internal `AvailableService` collection. Each item is enriched with a computed `costPrice` (providerPrice × NGN rate) and `sellingPrice` (after global/custom markup). Supports filtering by service name and free-text search across country and service fields.

### Request

| Part  | Field     | Type   | Required | Default | Description |
|-------|-----------|--------|----------|---------|-------------|
| Query | `page`    | number | No       | `1`     | Page number (min 1) |
| Query | `limit`   | number | No       | `25`    | Per page (min 1, max 100) |
| Query | `service` | string | No       | `""`    | Exact match on `internalService` |
| Query | `search`  | string | No       | `""`    | Case-insensitive regex on `internalCountry` or `internalService` |

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "services has been fetched",
  "data": [
    {
      "_id": "ObjectId",
      "providerService": "string",
      "providerCountry": "string",
      "provider": "smsbower",
      "providerPrice": 0.25,
      "internalService": "whatsapp",
      "internalCountry": "nigeria",
      "customPrice": null,
      "stock": 120,
      "active": true,
      "providerId": "string",
      "lastFetchedAt": "ISO date",
      "availability": true,
      "costPrice": 405,
      "sellingPrice": 465.75
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 340,
    "totalPages": 14
  }
}
```

> **`costPrice`** = `providerPrice × usdToNgnRate`
> **`sellingPrice`** = computed by `calculateSellingPrice()` using the global markup settings (and `customPrice` if set on the service).

### Error Cases

| Status | Reason |
|--------|--------|
| `400`  | Global `PriceSetting` document not found in database |

---

## 6. Get SMSBower Service Names (Aggregated)

**`GET /api/admin/all/bower/service-name`**

Returns a grouped summary of all unique `smsbower` service names. For each service, it aggregates the number of countries it is available in, total stock, how many listings are active, and a top-level `active` flag (true only when every listing for that service is active).

### Request

No query parameters.

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "successfull",
  "data": [
    {
      "internalService": "whatsapp",
      "totalCountries": 15,
      "totalStock": 3200,
      "activeCount": 15,
      "totalListings": 15,
      "active": true
    },
    {
      "internalService": "telegram",
      "totalCountries": 10,
      "totalStock": 500,
      "activeCount": 8,
      "totalListings": 10,
      "active": false
    }
  ]
}
```

| Field          | Description |
|----------------|-------------|
| `internalService` | The platform's internal service identifier |
| `totalCountries`  | Number of distinct countries offering this service |
| `totalStock`      | Sum of stock across all country listings |
| `activeCount`     | Number of listings where `active = true` |
| `totalListings`   | Total number of country listings for the service |
| `active`          | `true` only if `activeCount === totalListings` (all fully active) |

---

## 7. Get Getatext Services (Paginated)

**`GET /api/admin/all/getatext/service-name`**

Identical in behaviour to [Get SMSBower Services](#5-get-smsbower-services-paginated) but filters for the `getatext` provider instead.

### Request

| Part  | Field     | Type   | Required | Default | Description |
|-------|-----------|--------|----------|---------|-------------|
| Query | `page`    | number | No       | `1`     | Page number (min 1) |
| Query | `limit`   | number | No       | `25`    | Per page (min 1, max 100) |
| Query | `service` | string | No       | `""`    | Exact match on `internalService` |
| Query | `search`  | string | No       | `""`    | Case-insensitive regex on `internalCountry` or `internalService` |

### Response `200`

Same shape as [Get SMSBower Services](#5-get-smsbower-services-paginated) with `provider: "getatext"`.

### Error Cases

| Status | Reason |
|--------|--------|
| `400`  | Global `PriceSetting` document not found in database |

---

## 8. Get Getatext Service Names (Aggregated)

**`GET /api/admin/all/getatext/services`**

Identical in behaviour to [Get SMSBower Service Names](#6-get-smsbower-service-names-aggregated) but aggregates services for the `getatext` provider.

### Request

No query parameters.

### Response `200`

Same shape as [Get SMSBower Service Names](#6-get-smsbower-service-names-aggregated) with getatext data.

---

## 9. Toggle SMSBower Service Active Status

**`PATCH /api/admin/service/bower/:service/active`**

Enables or disables **all country listings** of a given `smsbower` service in a single bulk update. Use this to quickly turn a service on or off across all countries simultaneously.

### Request

| Part   | Field     | Type    | Required | Description |
|--------|-----------|---------|----------|-------------|
| Params | `service` | string  | Yes      | The `internalService` name (e.g. `"whatsapp"`) |
| Body   | `active`  | boolean | Yes      | `true` to enable, `false` to disable |

#### Example Body

```json
{
  "active": false
}
```

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "service status updated successfully",
  "data": {
    "service": "whatsapp",
    "active": false,
    "modifiedCount": 15
  }
}
```

| Field           | Description |
|-----------------|-------------|
| `service`       | The service name that was updated |
| `active`        | The new active state |
| `modifiedCount` | How many individual country listings were actually modified |

### Error Cases

| Status | Reason |
|--------|--------|
| `400`  | `service` param is missing |
| `400`  | `active` is not a boolean |
| `404`  | No listings found for the given service name |

---

## 10. Set Custom Price on a Service

**`PATCH /api/admin/platform/service/:id/custom-price`**

Overrides the computed selling price for a specific service listing (identified by its MongoDB `_id`). Setting `customPrice` to `null` or an empty string removes the override and reverts to the globally computed price.

### Request

| Part   | Field         | Type           | Required | Description |
|--------|---------------|----------------|----------|-------------|
| Params | `id`          | string         | Yes      | MongoDB ObjectId of the `AvailableService` document |
| Body   | `customPrice` | number \| null | Yes      | The override price in NGN, or `null`/`""` to clear it |

#### Example Body — set a custom price

```json
{
  "customPrice": 750
}
```

#### Example Body — clear the custom price

```json
{
  "customPrice": null
}
```

### Response `200`

Returns the full updated `AvailableService` document:

```json
{
  "status": 200,
  "success": true,
  "message": "custom price updated successfully",
  "data": {
    "_id": "ObjectId",
    "providerService": "string",
    "providerCountry": "string",
    "provider": "smsbower | getatext",
    "providerPrice": 0.25,
    "internalService": "whatsapp",
    "internalCountry": "nigeria",
    "customPrice": 750,
    "stock": 120,
    "active": true,
    "providerId": "string",
    "lastFetchedAt": "ISO date",
    "availability": true,
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

### Error Cases

| Status | Reason |
|--------|--------|
| `400`  | `id` is not a valid ObjectId |
| `400`  | `customPrice` is not a valid positive number (and is not null/empty) |
| `404`  | No service found with the given `id` |

---

## 11. Get Getatext Provider Balance

**`GET /api/admin/getatext/balance`**

Fetches the live account balance from the Getatext provider API. This is a real-time call to the external API — it reflects the current spendable credit on the Getatext account.

### Request

No parameters.

### Response `200`

```json
{
  "status": 200,
  "success": true,
  "message": "fetched SMSPool balance successfully",
  "data": {
    "balance": 12.45,
    "currency": "USD",
    "raw": {
      "status": "success",
      "balance": "12.45"
    }
  }
}
```

| Field      | Description |
|------------|-------------|
| `balance`  | Numeric balance on the Getatext account |
| `currency` | Always `"USD"` |
| `raw`      | The raw response object returned by the Getatext API |

### Error Cases

| Status | Reason |
|--------|--------|
| `400`  | Getatext API returned a non-success status or the call failed |
