# Dairy Cooperative Milk Collection System

A cross-platform mobile application designed to digitise milk collection operations at dairy cooperative collection centres.

The system replaces paper-based collection records with a real-time digital workflow for recording milk quantity and quality, monitoring collections, providing farmers with access to their records, and generating monthly payment reports.

## Overview

Dairy cooperatives process milk collections from farmers during morning and evening sessions. Traditional paper-based recording creates challenges in reconciliation, traceability, quality monitoring, and payment calculation.

The Dairy Cooperative Milk Collection System addresses these problems through a role-based Flutter application backed by Firebase.

The application supports three primary user roles:

- Operator
- Farmer
- Manager

Each role is provided with access only to the information and functionality required for its responsibilities.

## Objectives

The project aims to:

- Replace paper-based milk collection registers with digital records.
- Allow an Operator to complete a collection entry in under 30 seconds.
- Automatically grade milk quality based on FAT percentage.
- Provide Farmers with access to their collection history and estimated monthly earnings.
- Provide Managers with a real-time overview of collections across centres.
- Identify quality issues immediately through Pass, Flag, and Reject grades.
- Automate monthly farmer payment report generation.
- Support collection entry during intermittent or unavailable internet connectivity.
- Enforce role-based data access through Firebase Authentication and Firestore Security Rules.

## User Roles

### Operator

The Operator works at a dairy collection centre and records milk supplied by farmers.

Primary responsibilities include:

- Searching for farmers using Farmer ID.
- Confirming farmer information.
- Recording milk quantity.
- Recording FAT percentage.
- Selecting the morning or evening collection session.
- Submitting collection records.
- Registering farmers where authorised.
- Continuing collection entry while offline.
- Viewing collection quality results after submission.

The Operator interface is designed to prioritise speed and accuracy.

### Farmer

The Farmer portal provides farmers with read-only access to their own milk collection information.

Farmers can:

- View collection records from the previous 30 days.
- View milk quantity for each collection.
- View FAT percentage.
- View quality grades.
- View monthly total milk supplied.
- View average FAT percentage.
- View estimated monthly payment.

Farmers cannot access records belonging to other farmers.

### Manager

The Manager interface provides cooperative-level monitoring and reporting.

Managers can:

- Monitor collection activity across centres.
- View real-time collection records.
- Filter records by centre, date, session, and quality grade.
- Identify Flag and Reject records.
- Inspect individual collection details.
- Register farmers where authorised.
- Generate monthly reports.
- View farmer-wise totals and estimated payments.

## Core Features

### Authentication and Role-Based Routing

Firebase Authentication is used to authenticate users.

After authentication, the application reads the user's role from Firestore and routes the user to the appropriate interface.

Supported roles are:

```text
operator
farmer
manager
```

Role restrictions must also be enforced through Firestore Security Rules.

### Farmer Registration

Authorised Operators and Managers can register farmers.

Farmer information includes:

```text
Farmer ID
Name
Village
Phone Number
Bank Details (optional)
```

Farmer IDs must be unique.

### Milk Collection Entry

The Operator follows a streamlined collection workflow:

```text
Login
  |
Operator Home
  |
Enter Farmer ID
  |
Confirm Farmer
  |
Enter Quantity + FAT Percentage
  |
Select Session
  |
Submit
  |
Quality Grading
  |
Collection Result
  |
Next Farmer
```

Each collection record contains:

```text
farmerID
centreID
operatorUID
session
timestamp
quantityLitres
fatPercentage
qualityGrade
```

### Automatic Quality Grading

Milk quality is graded using a Firebase Cloud Function after a collection record is created.

Default thresholds are:

| FAT Percentage | Grade |
|---|---|
| 3.5% or greater | Pass |
| 2.5% to below 3.5% | Flag |
| Below 2.5% | Reject |

Threshold values are stored in Firestore configuration so they can be updated without changing application code.

Quality grading is performed server-side to prevent manipulation from the client application.

### Offline Persistence

Collection centres may experience unreliable internet connectivity.

Firestore offline persistence allows an Operator to submit collection records while offline. Records are stored locally and synchronised automatically when connectivity returns.

The Operator interface must clearly indicate whether a record has been synchronised or saved locally.

### Farmer Portal

Farmers can view their own collection history and current monthly summary.

The portal includes:

- Total milk supplied.
- Average FAT percentage.
- Estimated monthly payment.
- Recent collection records.
- Individual collection details.
- Quality grades.

Estimated payments are informational and do not represent actual payment disbursement.

### Manager Dashboard

The Manager dashboard provides a real-time overview of cooperative collection activity.

The dashboard includes:

- Today's total litres.
- Number of collections.
- Flag count.
- Reject count.
- Quality alerts.
- Live collection feed.
- Search.
- Centre filter.
- Date filter.
- Session filter.
- Quality filter.

### Monthly Reports

Managers can generate monthly reports using a Firebase Cloud Function.

Reports include:

- Farmer-wise totals.
- Total litres.
- Average FAT percentage.
- Pass, Flag, and Reject distribution.
- Estimated farmer payments.

Reports can be exported for further use.

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile Application | Flutter |
| Programming Language | Dart |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Backend Logic | Firebase Cloud Functions |
| State Management | Provider |
| Offline Storage | Firestore Offline Persistence |
| UI/UX Design | Figma |

The project does not use a separate Node.js, Express, or PostgreSQL backend.

## Firestore Data Model

The main Firestore collections are:

### `farmers`

```text
farmerID
name
village
phone
bankDetails
linkedUID
```

### `collection_centres`

```text
centreID
name
location
assignedOperatorUIDs
```

### `collection_records`

```text
recordID
farmerID
centreID
operatorUID
session
timestamp
quantityLitres
fatPercentage
qualityGrade
```

### `users`

```text
uid
role
linkedID
```

### `config`

```text
fatThresholdPass
fatThresholdFlag
pricePerLitre
```

## Cloud Functions

### `gradeCollectionRecord`

Triggered when a new collection record is created.

Responsibilities:

- Read the submitted FAT percentage.
- Read configured quality thresholds.
- Calculate the appropriate quality grade.
- Update the collection record.

### `generateMonthlyReport`

Callable by an authorised Manager.

Responsibilities:

- Accept month and year.
- Aggregate collection records.
- Calculate farmer-wise totals.
- Calculate estimated payments.
- Return report data.

### `qualityAlertNotifier`

Triggered when collection records are created.

Reject-grade collections create quality alerts that can be displayed on the Manager dashboard.

## Security

Firestore Security Rules are a required part of the system.

The security model must ensure that:

- Farmers can only access their own collection records.
- Operators can create collection records but cannot access farmer payment information.
- Managers can read collection records across centres.
- Unauthorised users cannot access role-restricted data.
- Client-side navigation restrictions are supported by server-side Firestore rules.

Security must not depend exclusively on the Flutter interface.

## Validation Rules

Collection data must satisfy the following requirements:

```text
quantityLitres > 0

0 <= fatPercentage <= 9

session = morning OR evening
```

Farmer IDs must be unique.

Invalid data should be rejected before submission with clear validation messages.

## Project Structure

The final directory structure may evolve during development. A recommended structure is:

```text
lib/
├── models/
├── screens/
│   ├── auth/
│   ├── operator/
│   ├── farmer/
│   └── manager/
├── services/
├── providers/
├── widgets/
├── utils/
└── main.dart

functions/
├── src/
└── package.json

test/

firebase.json
firestore.rules
pubspec.yaml
README.md
CONTRIBUTING.md
```

## Development Setup

### Prerequisites

Install the following before running the project:

- Flutter SDK
- Dart SDK
- Android Studio or Visual Studio Code
- Firebase CLI
- Git

Verify Flutter installation:

```bash
flutter doctor
```

### Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Install Flutter Dependencies

```bash
flutter pub get
```

### Firebase Configuration

The project requires a Firebase project configured with:

- Firebase Authentication
- Cloud Firestore
- Cloud Functions
- Firestore Security Rules

Platform-specific Firebase configuration files must be added according to the project setup.

Sensitive configuration files and credentials must not be committed unless explicitly intended for source control.

### Run the Application

```bash
flutter run
```

## Testing

Testing should cover the critical functional requirements of the application.

Important scenarios include:

- Authentication and role routing.
- Farmer ID lookup.
- Farmer registration.
- Collection validation.
- Quality grading.
- Firestore Security Rules.
- Offline collection submission.
- Synchronisation after connectivity restoration.
- Farmer record isolation.
- Manager real-time updates.
- Monthly report calculations.

## Success Criteria

The project is considered successful when:

- An Operator can complete a collection entry in under 30 seconds.
- New records appear on the Manager dashboard within approximately 3 seconds on a stable connection.
- Quality grading produces correct results against configured thresholds.
- Farmers cannot access another farmer's records.
- Offline records synchronise after connectivity is restored.
- Monthly report calculations match expected results from test data.

## Features Outside Current Scope

The following features are intentionally excluded from the current version:

- Barcode or QR-based farmer identification.
- Editing or deleting submitted collection records.
- Push notifications to farmers.
- Multi-language support.
- Payment disbursement or banking integration.
- Full administrative user management.

These exclusions keep the project focused on its primary collection, quality monitoring, reporting, and transparency requirements.

## Team

| Team Member | Responsibility |
|---|---|
| G A Arjun | Product Manager, Authentication and Operator Flow |
| Guru Karthick | Flutter UI, Farmer Portal and Manager Portal |
| Siddharth | Cloud Functions and Reporting |

All team members share responsibility for reviewing the Firestore data model, security requirements, integration, and final system quality.

## Project Status

The project follows a four-week development schedule covering:

1. Requirements and UI/UX design.
2. Firebase setup and core application development.
3. Offline support, dashboard functionality, Cloud Functions, reporting, and security.
4. Integration testing, bug fixing, documentation, and viva preparation.

## License

No licence has currently been specified for this project. Until a licence is added, all rights remain with the project authors.