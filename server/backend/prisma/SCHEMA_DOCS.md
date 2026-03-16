# 📘 Sports Field Booking Platform — Prisma Schema Documentation

> **Last updated:** 2026-03-12  
> **Database:** PostgreSQL  
> **ORM:** Prisma (Client output: `../src/generated/prisma`)

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Enums Reference](#enums-reference)
4. [Models Reference](#models-reference)
   - [User & Auth](#user--auth)
   - [Club & Courts](#club--courts)
   - [Opening Hours](#opening-hours)
   - [Amenities](#amenities)
   - [Courts](#courts)
   - [Time Slots & Booking](#time-slots--booking)
   - [Payment & Refund](#payment--refund)
   - [Reviews](#reviews)
   - [Voucher & Promotion](#voucher--promotion)
   - [Favorite Courts](#favorite-courts)
   - [Notifications](#notifications)
   - [News Feed / Posts](#news-feed--posts)
   - [Owner CRM](#owner-crm)
5. [Key Relationships](#key-relationships)
6. [Business Logic Notes](#business-logic-notes)
7. [Common Query Examples](#common-query-examples)

---

## Overview

This schema supports a **multi-tenant sports field booking platform** with the following core actors:

| Role    | Description                                                              |
|---------|--------------------------------------------------------------------------|
| `USER`  | End-users who browse courts, make bookings, and write reviews            |
| `OWNER` | Club owners who manage clubs, courts, pricing, and view CRM data         |
| `ADMIN` | Platform administrators who approve clubs, manage vouchers, and oversee all |

**Supported Sports:**  
`FOOTBALL`, `BADMINTON`, `TENNIS`, `PICKLEBALL`, `BASKETBALL`, `VOLLEYBALL`, `OTHER`

---

## Entity Relationship Diagram

```
User ──────────────┬──────────────────────────────→ Club (ownedClubs)
  │                │
  ├──→ Session     ├──→ Court ──→ CourtImage
  ├──→ UserProfile │     ├──→ CourtPricing
  ├──→ PasswordReset│    ├──→ TimeSlot ──→ BookingItem
  ├──→ Booking ────┘     └──→ FavoriteCourt
  │     ├──→ BookingItem
  │     ├──→ Payment (with RefundInfo)
  │     └──→ Review ──→ ReviewImage
  ├──→ Notification
  ├──→ FavoriteCourt
  └──→ VoucherUsage

Club ──→ ClubImage
     ──→ OpeningHour
     ──→ ClubAmenity ──→ Amenity
     ──→ Post
     ──→ Voucher ──→ VoucherUsage
     └──→ ClubCustomer (CRM)
```

---

## Enums Reference

### `Role`
Defines the access level of a user on the platform.

| Value   | Description                        |
|---------|------------------------------------|
| `USER`  | Regular customer/player            |
| `OWNER` | Sports club owner                  |
| `ADMIN` | Platform administrator             |

---

### `SportType`
Represents the type of sport a court is designed for.

| Value        | Description        |
|--------------|--------------------|
| `FOOTBALL`   | Football / Soccer  |
| `BADMINTON`  | Badminton          |
| `TENNIS`     | Tennis             |
| `PICKLEBALL` | Pickleball         |
| `BASKETBALL` | Basketball         |
| `VOLLEYBALL` | Volleyball         |
| `OTHER`      | Any other sport    |

---

### `CourtStatus`
Lifecycle status of a court.

| Value              | Description                                  |
|--------------------|----------------------------------------------|
| `ACTIVE`           | Visible and bookable by users                |
| `INACTIVE`         | Hidden or temporarily closed                 |
| `PENDING_APPROVAL` | Awaiting admin review (e.g., new court)      |
| `SUSPENDED`        | Suspended by admin due to policy violations  |

---

### `TimeSlotStatus`
Availability state of a time slot.

| Value       | Description                                                          |
|-------------|----------------------------------------------------------------------|
| `AVAILABLE` | Open for booking                                                     |
| `BOOKED`    | Already reserved (has a confirmed booking)                           |
| `LOCKED`    | Temporarily held by a user mid-booking flow (prevents double-booking)|

> **Note:** `LOCKED` slots have a `lockedBy` (userId) and `lockedAt` timestamp. A background job or TTL should release expired locks.

---

### `BookingStatus`
Lifecycle of a booking.

| Value             | Description                                       |
|-------------------|---------------------------------------------------|
| `PENDING`         | Booking created, awaiting payment                 |
| `WAITING_PAYMENT` | Payment initiated, waiting for confirmation       |
| `CONFIRMED`       | Payment confirmed, booking is active              |
| `CANCELLED`       | Cancelled by user, owner, or system               |
| `COMPLETED`       | The booked time has passed                        |

---

### `PaymentMethod`

| Value           | Description              |
|-----------------|--------------------------|
| `BANK_TRANSFER` | Manual bank wire transfer|
| `CREDIT_CARD`   | Card payment             |
| `MOMO`          | MoMo e-wallet            |
| `VNPAY`         | VNPay gateway            |
| `CASH`          | Cash on arrival          |

---

### `PaymentStatus`

| Value             | Description                              |
|-------------------|------------------------------------------|
| `PENDING`         | Payment record created                   |
| `WAITING_PAYMENT` | Awaiting user to complete payment        |
| `CONFIRMED`       | Payment verified by owner/system         |
| `CANCELLED`       | Payment was cancelled                    |
| `REFUNDED`        | Amount has been refunded to user         |

---

### `RefundStatus`
Tracks the refund lifecycle within a `Payment` record.

| Value       | Description                                   |
|-------------|-----------------------------------------------|
| `NONE`      | No refund requested                           |
| `REQUESTED` | User has submitted a refund request           |
| `APPROVED`  | Owner/admin approved the refund               |
| `REJECTED`  | Refund request was denied                     |
| `COMPLETED` | Refund has been transferred back to the user  |

---

### `NotificationType`

| Value                | Trigger                                         |
|----------------------|-------------------------------------------------|
| `BOOKING_REMINDER`   | Sent before a booking session starts            |
| `BOOKING_CONFIRMED`  | Booking confirmed after payment                 |
| `BOOKING_CANCELLED`  | Booking was cancelled                           |
| `PAYMENT_SUCCESS`    | Payment successfully processed                  |
| `PAYMENT_FAILED`     | Payment attempt failed                          |
| `SCHEDULE_CHANGED`   | Owner modified time slot or court schedule      |
| `PROMOTION`          | New voucher or offer available                  |
| `SYSTEM`             | Platform-wide announcements                     |
| `NEWS_FEED`          | New post from a club the user follows           |

---

### `PostType`
Type of content a club can publish.

| Value           | Description                                    |
|-----------------|------------------------------------------------|
| `AVAILABLE_SLOT`| Announce open time slots                       |
| `DISCOUNT`      | Promotional discount news                      |
| `EVENT`         | Upcoming events at the club                    |
| `TEAM_MATCHING` | Looking for players / team match-making        |
| `ANNOUNCEMENT`  | General club announcements                     |

---

### `PostStatus`

| Value     | Description                        |
|-----------|------------------------------------|
| `ACTIVE`  | Publicly visible                   |
| `HIDDEN`  | Hidden by owner or admin           |
| `EXPIRED` | Past the `expiresAt` date          |

---

### `ApprovalStatus`
Used for Club moderation by admins.

| Value      | Description                        |
|------------|------------------------------------|
| `PENDING`  | Submitted, awaiting admin review   |
| `APPROVED` | Cleared to go live                 |
| `REJECTED` | Rejected with possible reason      |

---

### `VoucherType`

| Value          | Description                                         |
|----------------|-----------------------------------------------------|
| `PERCENTAGE`   | Discount by percentage (e.g., 20% off)              |
| `FIXED_AMOUNT` | Discount by fixed value (e.g., 50,000 VND off)      |

---

### `CustomerTier`
CRM tier classification for club customers.

| Value    | Min Spend / Frequency (suggested) |
|----------|-----------------------------------|
| `NORMAL` | Default for all new customers     |
| `SILVER` | Moderate activity                 |
| `GOLD`   | High activity                     |
| `VIP`    | Top-tier, highest engagement      |

---

## Models Reference

### User & Auth

#### `User`
The central identity model for all platform participants.

| Field             | Type       | Notes                                                  |
|-------------------|------------|--------------------------------------------------------|
| `id`              | String     | CUID primary key                                       |
| `email`           | String     | Unique, used for login                                 |
| `phone`           | String?    | Optional, unique                                       |
| `passwordHash`    | String?    | Null for OAuth-only users                              |
| `fullName`        | String     | Display name                                           |
| `avatarUrl`       | String?    | Profile picture                                        |
| `role`            | Role       | Default `USER`                                         |
| `isActive`        | Boolean    | Soft-disable account without deletion                  |
| `isEmailVerified` | Boolean    | Email confirmation status                              |
| `googleId`        | String?    | Unique Google OAuth identifier                         |
| `facebookId`      | String?    | Unique Facebook OAuth identifier                       |
| `lastLoginAt`     | DateTime?  | Track activity                                         |

**Relations:**
- `profile` → `UserProfile` (1:1)
- `sessions` → `Session[]`
- `bookings` → `Booking[]`
- `reviews` → `Review[]`
- `notifications` → `Notification[]`
- `favoritesCourts` → `FavoriteCourt[]`
- `voucherUsages` → `VoucherUsage[]`
- `ownedClubs` → `Club[]`
- `passwordResets` → `PasswordReset[]`

---

#### `UserProfile`
Extended user information, separated to keep `User` lean.

| Field         | Type      | Notes                              |
|---------------|-----------|------------------------------------|
| `userId`      | String    | FK → User (unique, 1:1)            |
| `address`     | String?   | Home address                       |
| `dateOfBirth` | DateTime? | For age-gating or analytics        |
| `gender`      | String?   | Free text / enum (app-level)       |
| `bio`         | String?   | Short user biography               |

---

#### `Session`
Manages active login sessions (for jwt/token-based auth or session invalidation).

| Field       | Type     | Notes                                    |
|-------------|----------|------------------------------------------|
| `token`     | String   | Unique session token                     |
| `ipAddress` | String?  | For security auditing                    |
| `userAgent` | String?  | Browser/device info                      |
| `expiresAt` | DateTime | Session TTL                              |

> Used to support multi-device sessions and explicit logout/revocation.

---

#### `PasswordReset`
One-time tokens for password recovery flows.

| Field     | Type     | Notes                                     |
|-----------|----------|-------------------------------------------|
| `token`   | String   | Unique reset token (sent via email)       |
| `expiresAt` | DateTime | Token TTL (e.g., 15 minutes)            |
| `used`    | Boolean  | Prevent token reuse                       |

---

### Club & Courts

#### `Club`
A sports facility with multiple courts and managed by an `OWNER`.

| Field           | Type           | Notes                                         |
|-----------------|----------------|-----------------------------------------------|
| `ownerId`       | String         | FK → User (must have role OWNER)              |
| `slug`          | String         | URL-friendly unique name (e.g., `san-bong-abc`)|
| `address`       | String         | Full address                                  |
| `district`      | String         | District for filtering                        |
| `city`          | String         | City for geo-search                           |
| `latitude`      | Float?         | For map display                               |
| `longitude`     | Float?         | For map display                               |
| `approvalStatus`| ApprovalStatus | Default `PENDING`, admin must approve         |
| `isActive`      | Boolean        | Owner can toggle visibility                   |

**Relations:**
- `owner` → `User`
- `courts` → `Court[]`
- `images` → `ClubImage[]`
- `openingHours` → `OpeningHour[]`
- `amenities` → `ClubAmenity[]`
- `posts` → `Post[]`
- `vouchers` → `Voucher[]`
- `customers` → `ClubCustomer[]`

---

#### `ClubImage`
Photo gallery for a Club.

| Field       | Type    | Notes                             |
|-------------|---------|-----------------------------------|
| `sortOrder` | Int     | Controls display order in gallery |
| `caption`   | String? | Alt text or image description     |

---

### Opening Hours

#### `OpeningHour`
Per-day operating schedule for a club.

| Field       | Type    | Notes                                             |
|-------------|---------|---------------------------------------------------|
| `dayOfWeek` | Int     | `0`=Sunday, `1`=Monday … `6`=Saturday             |
| `openTime`  | DateTime| Stored as `Time` type (e.g., `06:00:00`)          |
| `closeTime` | DateTime| Stored as `Time` type (e.g., `23:00:00`)          |
| `isClosed`  | Boolean | If `true`, the club is closed all day             |

**Constraint:** `@@unique([clubId, dayOfWeek])` — one record per day per club.

---

### Amenities

#### `Amenity`
A catalog of facility features (e.g., WiFi, Parking, Shower).

| Field  | Type    | Notes                                      |
|--------|---------|--------------------------------------------|
| `name` | String  | Unique label (e.g., `"WiFi"`, `"Canteen"`) |
| `icon` | String? | Icon identifier (e.g., `"wifi"`, `"car"`)  |

#### `ClubAmenity`
Junction table linking clubs to their amenities.

| Field       | Type    | Notes                                          |
|-------------|---------|------------------------------------------------|
| `note`      | String? | Custom note (e.g., "Free WiFi in lounge area") |

**Constraint:** `@@unique([clubId, amenityId])` — no duplicate entries.

---

### Courts

#### `Court`
An individual bookable court within a club.

| Field           | Type        | Notes                                         |
|-----------------|-------------|-----------------------------------------------|
| `sportType`     | SportType   | Determines the type of sport                  |
| `status`        | CourtStatus | Default `ACTIVE`                              |
| `capacity`      | Int?        | Max number of players                         |
| `surface`       | String?     | e.g., `"Cỏ nhân tạo"`, `"Sàn gỗ"`           |
| `indoorOutdoor` | String?     | `"INDOOR"` or `"OUTDOOR"`                     |
| `sortOrder`     | Int         | Controls display order within the club        |

---

#### `CourtPricing`
Flexible pricing rules for a court based on day/time.

| Field         | Type     | Notes                                                   |
|---------------|----------|---------------------------------------------------------|
| `dayOfWeek`   | Int?     | `null` = applies every day; `0–6` = specific day        |
| `startTime`   | DateTime | Start of this pricing window (Time type)                |
| `endTime`     | DateTime | End of this pricing window (Time type)                  |
| `pricePerHour`| Decimal  | Price (12,2 precision)                                  |
| `label`       | String?  | Human-readable label (e.g., `"Giờ vàng"`)              |
| `isActive`    | Boolean  | Can be toggled without deletion                         |

> **Example:** Morning price = 100,000/hr (06:00–12:00), Peak price = 200,000/hr (17:00–22:00 on weekends).

---

### Time Slots & Booking

#### `TimeSlot`
A specific time window on a specific court on a specific date.

| Field       | Type            | Notes                                                           |
|-------------|-----------------|-----------------------------------------------------------------|
| `courtId`   | String          | FK → Court                                                      |
| `startTime` | DateTime        | Full datetime, e.g., `2026-03-15T08:00:00`                      |
| `endTime`   | DateTime        | Full datetime, e.g., `2026-03-15T09:00:00`                      |
| `status`    | TimeSlotStatus  | Default `AVAILABLE`                                             |
| `lockedBy`  | String?         | userId temporarily holding the slot                             |
| `lockedAt`  | DateTime?       | Timestamp of when the lock was applied (for TTL expiry)         |

**Constraint:** `@@unique([courtId, startTime])` — prevents duplicate slots.

> **Lock Pattern:** When a user enters the checkout flow, slots are set to `LOCKED`. If payment is not completed within a timeout (e.g., 10 minutes), the lock must be released and status reverted to `AVAILABLE`.

---

#### `Booking`
A booking record grouping one or more time slots.

| Field           | Type          | Notes                                                 |
|-----------------|---------------|-------------------------------------------------------|
| `bookingCode`   | String        | Unique, human-readable reference code                 |
| `status`        | BookingStatus | Lifecycle tracked here                                |
| `totalAmount`   | Decimal       | Sum of all `BookingItem.price` values                 |
| `discountAmount`| Decimal       | Amount discounted by voucher                          |
| `finalAmount`   | Decimal       | `totalAmount - discountAmount`                        |
| `voucherId`     | String?       | Applied voucher (optional)                            |
| `bookerName`    | String        | Captured at booking time (in case user info changes)  |
| `bookerPhone`   | String        | Contact phone, captured at booking time               |
| `bookerEmail`   | String?       | Optional contact email                                |

---

#### `BookingItem`
Represents one time slot within a booking.

| Field        | Type    | Notes                                |
|--------------|---------|--------------------------------------|
| `bookingId`  | String  | FK → Booking                         |
| `timeSlotId` | String  | FK → TimeSlot                        |
| `price`      | Decimal | Price locked at time of booking      |

**Constraint:** `@@unique([bookingId, timeSlotId])` — no duplicate slots per booking.

---

### Payment & Refund

#### `Payment`
One-to-one with `Booking`. Contains all payment and refund data.

**Payment Fields:**

| Field             | Type          | Notes                                              |
|-------------------|---------------|----------------------------------------------------|
| `bookingId`       | String        | Unique FK → Booking (1:1)                          |
| `method`          | PaymentMethod | How the user paid                                  |
| `status`          | PaymentStatus | Default `PENDING`                                  |
| `amount`          | Decimal       | Amount to be paid                                  |
| `transactionRef`  | String?       | External gateway reference number                  |
| `bankName`        | String?       | For bank transfer                                  |
| `accountNumber`   | String?       | For bank transfer                                  |
| `transferContent` | String?       | Transfer description/memo                          |
| `proofImageUrl`   | String?       | Screenshot uploaded by user as payment proof       |
| `paidAt`          | DateTime?     | When user submitted payment                        |
| `confirmedAt`     | DateTime?     | When owner/system confirmed                        |
| `confirmedBy`     | String?       | userId of confirmer                                |

**Refund Fields (embedded in Payment):**

| Field             | Type        | Notes                                              |
|-------------------|-------------|----------------------------------------------------|
| `refundStatus`    | RefundStatus| Default `NONE`                                     |
| `refundAmount`    | Decimal?    | May be partial                                     |
| `refundReason`    | String?     | User's stated reason                               |
| `refundRequestAt` | DateTime?   | When user submitted refund request                 |
| `refundReviewAt`  | DateTime?   | When admin/owner reviewed it                       |
| `refundReviewBy`  | String?     | userId of reviewer                                 |
| `refundNote`      | String?     | Reviewer's note (e.g., "Approved, 80% returned")   |
| `refundedAt`      | DateTime?   | Actual transfer date                               |

---

### Reviews

#### `Review`
A user review submitted after a completed booking.

| Field       | Type    | Notes                                           |
|-------------|---------|-------------------------------------------------|
| `userId`    | String  | FK → User                                       |
| `bookingId` | String  | Unique FK → Booking (one review per booking)    |
| `courtId`   | String? | Denormalized for easy court-level queries       |
| `clubId`    | String? | Denormalized for easy club-level queries        |
| `rating`    | Int     | 1–5 star rating                                 |
| `isVisible` | Boolean | Owner/admin can hide inappropriate reviews      |

#### `ReviewImage`
Photos attached to a review.

| Field       | Type | Notes                      |
|-------------|------|----------------------------|
| `sortOrder` | Int  | Controls display order     |

---

### Voucher & Promotion

#### `Voucher`
Discount codes usable during checkout.

| Field           | Type        | Notes                                              |
|-----------------|-------------|----------------------------------------------------|
| `clubId`        | String?     | If `null`, it's a platform-wide voucher (by admin) |
| `code`          | String      | Unique promo code                                  |
| `type`          | VoucherType | `PERCENTAGE` or `FIXED_AMOUNT`                     |
| `value`         | Decimal     | e.g., `20` for 20%, or `50000` for 50,000 VND      |
| `minOrderAmount`| Decimal?    | Minimum booking total to use this voucher          |
| `maxDiscount`   | Decimal?    | Cap on discount (for percentage vouchers)          |
| `usageLimit`    | Int?        | Total uses allowed (null = unlimited)              |
| `usagePerUser`  | Int         | Max uses per user (default `1`)                    |
| `usedCount`     | Int         | Running counter of total uses                      |
| `startDate`     | DateTime    | Voucher validity start                             |
| `endDate`       | DateTime    | Voucher validity end                               |

#### `VoucherUsage`
Tracks which users have used which vouchers.

**Constraint:** `@@unique([voucherId, userId])` — enforces `usagePerUser = 1` at the DB level.

> For `usagePerUser > 1`, additional application-level logic is required (count rows by `userId` + `voucherId`).

---

### Favorite Courts

#### `FavoriteCourt`
Wishlist / saved courts for a user.

**Constraint:** `@@unique([userId, courtId])` — no duplicate favorites.

---

### Notifications

#### `Notification`
In-app notification sent to a user.

| Field      | Type             | Notes                                         |
|------------|------------------|-----------------------------------------------|
| `type`     | NotificationType | Determines icon/category in the UI            |
| `title`    | String           | Short notification title                      |
| `body`     | String           | Full notification message                     |
| `bookingId`| String?          | Deep-link to a specific booking (optional)    |
| `isRead`   | Boolean          | Unread badge control                          |
| `readAt`   | DateTime?        | When user dismissed/read the notification     |

---

### News Feed / Posts

#### `Post`
Content published by a club owner to engage users.

| Field           | Type       | Notes                                              |
|-----------------|------------|----------------------------------------------------|
| `type`          | PostType   | Content format                                     |
| `status`        | PostStatus | Default `ACTIVE`                                   |
| `linkedCourtId` | String?    | Link post to a specific court (e.g., for slots)    |
| `linkedDate`    | DateTime?  | Relevant date for the post (e.g., slot date)       |
| `expiresAt`     | DateTime?  | Auto-expire the post after this time               |
| `viewCount`     | Int        | Impression counter                                 |

---

### Owner CRM

#### `ClubCustomer`
CRM record for each user who has booked at a specific club.

| Field           | Type        | Notes                                              |
|-----------------|-------------|----------------------------------------------------|
| `clubId`        | String      | FK → Club                                          |
| `userId`        | String      | FK → User                                          |
| `tier`          | CustomerTier| Default `NORMAL`, upgraded by owner                |
| `totalBookings` | Int         | Cumulative booking count at this club              |
| `totalCancels`  | Int         | Cumulative cancellation count                      |
| `totalSpent`    | Decimal     | Cumulative spend at this club                      |
| `notes`         | String?     | Owner's private notes about the customer           |

**Constraint:** `@@unique([clubId, userId])` — one CRM record per user per club.

> These fields should be updated via triggers or service-layer logic whenever a booking is confirmed/cancelled/completed.

---

## Key Relationships

```
User (1) ──────── (many) Booking
Booking (1) ────── (1) Payment
Booking (1) ────── (many) BookingItem
BookingItem (many) ── (1) TimeSlot
TimeSlot (many) ── (1) Court
Court (many) ────── (1) Club
Club (1) ──────── (1) User [as owner]

Booking (1) ────── (0..1) Review
Booking (1) ────── (0..1) Voucher

Club (many) ────── (many) Amenity [via ClubAmenity]
User (many) ────── (many) Court [via FavoriteCourt]
User (many) ────── (many) Voucher [via VoucherUsage]
```

---

## Business Logic Notes

### 1. Booking Flow
```
1. User selects court + time slots
2. TimeSlots → set status = LOCKED (lockedBy = userId, lockedAt = now)
3. Booking record created (status = PENDING)
4. Payment record created (status = PENDING)
5. User completes payment
6. Owner/system confirms payment → Payment.status = CONFIRMED
7. Booking.status = CONFIRMED, TimeSlot.status = BOOKED
8. Notification sent: BOOKING_CONFIRMED
```

### 2. Lock Expiry
- A background worker should query `TimeSlot` where `status = LOCKED` AND `lockedAt < now - TTL`
- Reset those slots to `status = AVAILABLE`, clear `lockedBy` and `lockedAt`
- Cancel any associated `PENDING` bookings

### 3. Voucher Validation Checklist
- [ ] `isActive = true`
- [ ] `now` is between `startDate` and `endDate`
- [ ] `usedCount < usageLimit` (if limit exists)
- [ ] User hasn't exceeded `usagePerUser`
- [ ] `booking.totalAmount >= minOrderAmount` (if set)
- [ ] Apply `maxDiscount` cap (if set, for PERCENTAGE type)

### 4. Review Eligibility
A user can only submit a review if:
- The `Booking.status = COMPLETED`
- No existing `Review` for that `bookingId` (enforced by `@unique`)

### 5. CRM Update Triggers
After each booking lifecycle event, update `ClubCustomer`:
- **Confirmed:** `totalBookings++`, `totalSpent += finalAmount`
- **Cancelled:** `totalCancels++` (optionally reverse spend)
- **Tier Promotion:** Owner manually upgrades, or automated by thresholds

### 6. Club Approval Flow
```
Owner creates Club → approvalStatus = PENDING
Admin reviews → APPROVED or REJECTED
Only APPROVED + isActive clubs are visible to users
```

---

## Common Query Examples

### Get all available time slots for a court on a specific date
```typescript
const slots = await prisma.timeSlot.findMany({
  where: {
    courtId: 'court_id_here',
    startTime: {
      gte: new Date('2026-03-15T00:00:00'),
      lt:  new Date('2026-03-16T00:00:00'),
    },
    status: 'AVAILABLE',
  },
  orderBy: { startTime: 'asc' },
});
```

### Get a user's booking history with payment info
```typescript
const bookings = await prisma.booking.findMany({
  where: { userId: 'user_id_here' },
  include: {
    items: { include: { timeSlot: true } },
    payment: true,
    review: true,
    court: { include: { club: true } },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Get all courts for a club with pricing
```typescript
const courts = await prisma.court.findMany({
  where: { clubId: 'club_id_here', status: 'ACTIVE' },
  include: {
    pricings: { where: { isActive: true } },
    images: { orderBy: { sortOrder: 'asc' } },
  },
});
```

### Apply a voucher to a booking
```typescript
const voucher = await prisma.voucher.findUnique({ where: { code: 'SUMMER20' } });
// ... validate voucher ...
const discount = voucher.type === 'PERCENTAGE'
  ? Math.min(totalAmount * (voucher.value / 100), voucher.maxDiscount ?? Infinity)
  : voucher.value;

await prisma.booking.update({
  where: { id: bookingId },
  data: {
    voucherId: voucher.id,
    discountAmount: discount,
    finalAmount: totalAmount - discount,
  },
});
await prisma.voucherUsage.create({
  data: { voucherId: voucher.id, userId },
});
await prisma.voucher.update({
  where: { id: voucher.id },
  data: { usedCount: { increment: 1 } },
});
```

### Get club CRM data (top customers)
```typescript
const topCustomers = await prisma.clubCustomer.findMany({
  where: { clubId: 'club_id_here' },
  orderBy: { totalSpent: 'desc' },
  take: 10,
  include: { club: true },
});
```

### Mark expired time slot locks as available
```typescript
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
await prisma.timeSlot.updateMany({
  where: {
    status: 'LOCKED',
    lockedAt: { lt: tenMinutesAgo },
  },
  data: {
    status: 'AVAILABLE',
    lockedBy: null,
    lockedAt: null,
  },
});
```

---

*This document is auto-generated from the Prisma schema and should be kept in sync with any schema changes.*
