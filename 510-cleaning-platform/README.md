# 510 Cleaning Services Booking Platform

## Overview
The 510 Cleaning Services Booking Platform is designed to facilitate the booking of cleaning services. It allows users to create accounts, browse available services, and schedule bookings. The platform also includes staff management and payment processing features.

## Project Structure
```
510-cleaning-platform
├── prisma
│   └── schema.prisma        # Defines the data models for the application
├── src
│   ├── index.ts             # Entry point for the application
│   ├── services              # Contains service-related logic
│   └── types                 # TypeScript type definitions and interfaces
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Documentation for the project
```

## Models
The application uses the following data models defined in `prisma/schema.prisma`:

- **User**: Represents a user with fields:
  - `id`
  - `name`
  - `email`
  - `phone`
  - `role` (CUSTOMER/ADMIN/STAFF)

- **Service**: Represents a service with fields:
  - `id`
  - `name`
  - `description`
  - `price`
  - `duration`
  - `category` (ELECTRONICS/FURNITURE/OTHER)
  - `imageUrl`

- **Booking**: Represents a booking with fields:
  - `id`
  - `userId`
  - `serviceId`
  - `scheduledDate`
  - `scheduledTime`
  - `status` (PENDING/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED)
  - `address`
  - `notes`
  - `totalPrice`
  - `createdAt`

- **Staff**: Represents staff with fields:
  - `id`
  - `userId`
  - `bookings` relation

- **Payment**: Represents a payment with fields:
  - `id`
  - `bookingId`
  - `amount`
  - `status`
  - `method`

## Getting Started
To run the first migration, use the following terminal command:
```
npx prisma migrate dev --name init
```