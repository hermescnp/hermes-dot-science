# Lead Capture System with Flexible Request Architecture

This system provides secure lead capture functionality with a flexible request architecture that supports various business scenarios.

## Architecture Overview

### Entities

1. **Leads** - Provisional users who can create requests without authentication
2. **Requests** - Flexible entities that can represent various business interactions
3. **Users** - Authenticated users (future implementation)

### Request Structure

The request entity is designed to handle multiple use cases:

```javascript
{
  "type": "demo", // demo, quote, review, authorization, etc.
  "description": "The client is interested in a personalized demo for Custom AI Agents Service",
  "requestedSubjectId": {
    "type": "document", // document, service, product, etc.
    "id": "doc_45231"
  },
  "requester": {
    "type": "user", // user, lead, system
    "id": "user_54321"
  },
  "recipient": {
    "type": "user", // user, unit
    "id": "user_67890"
  },
  "status": "pending", // pending, in_progress, completed, cancelled
  "createdAt": "2025-07-07T10:00:00Z",
  "updatedAt": "2025-07-07T10:00:00Z",
  "metadata": {
    "dueDate": "2025-07-10T00:00:00Z",
    "priority": "medium",
    // Additional context-specific data
    "totalPrice": 15000,
    "estimatedWeeks": 8,
    "answers": [...],
    "stages": [...]
  }
}
```

### Ownership Model

- **Leads** own requests they create (requester.type = "lead")
- **Users** can own requests they create (requester.type = "user")
- **System** can create requests (requester.type = "system")
- **Recipients** can be users or units (departments/teams)

## Data Structure

### Leads Collection
```javascript
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "company": "Tech Corp",
  "role": "CTO",
  "phone": "+1234567890",
  "organizationSize": "50-200",
  "language": "en", // Website language when lead was created (en/es)
  "timestamp": "2025-01-07T10:00:00Z",
  "lastUpdated": "2025-01-07T10:00:00Z",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "status": "active"
}
```

### Requests Collection
```javascript
// Demo Request
{
  "type": "demo",
  "description": "Demo request from website",
  "requestedSubjectId": {
    "type": "service",
    "id": "service_custom_ai_agents"
  },
  "requester": {
    "type": "lead",
    "id": "lead_john_doe_company_com_1704633600000"
  },
  "recipient": {
    "type": "unit",
    "id": "unit_sales_department"
  },
  "status": "pending",
  "createdAt": "2025-01-07T10:00:00Z",
  "updatedAt": "2025-01-07T10:00:00Z",
  "metadata": {
    "organizationSize": "50-200",
    "source": "website",
    "priority": "medium",
    "dueDate": "2025-01-10T00:00:00Z"
  }
}

// Quote Request
{
  "type": "quote",
  "description": "Custom AI solution quote request",
  "requestedSubjectId": {
    "type": "service",
    "id": "service_custom_ai_agents"
  },
  "requester": {
    "type": "lead",
    "id": "lead_jane_smith_company_com_1704633600000"
  },
  "recipient": {
    "type": "unit",
    "id": "unit_sales_department"
  },
  "status": "pending",
  "createdAt": "2025-01-07T10:00:00Z",
  "updatedAt": "2025-01-07T10:00:00Z",
  "metadata": {
    "totalPrice": 15000,
    "estimatedWeeks": 8,
    "totalHours": 320,
    "answers": [
      { "question": "What's your primary goal?", "answer": "Automate customer support" }
    ],
    "stages": [
      { "name": "Discovery", "hours": 40, "weeks": 1 }
    ],
    "source": "website",
    "priority": "high",
    "dueDate": "2025-01-08T00:00:00Z"
  }
}
```

## Flows

### Demo Request Flow
1. User fills demo request form
2. Client calls `createDemoRequest` Cloud Function
3. Function validates data and rate limits
4. Function creates/updates lead record
5. Function creates request with type "demo"
6. Function returns leadId and requestId

### Quote Request Flow
1. User completes conversational quote process
2. Client calls `createQuoteRequest` Cloud Function
3. Function validates data and rate limits
4. Function creates/updates lead record
5. Function creates request with type "quote" and quote data in metadata
6. Function returns leadId and requestId

### Request Retrieval Flows
- **By Lead**: Get all requests created by a specific lead
- **By Recipient**: Get all requests assigned to a user or unit
- **By Type**: Filter requests by type (demo, quote, etc.)
- **By Status**: Filter requests by status (pending, in_progress, etc.)

## Security Features

### Rate Limiting
- 5 requests per minute per IP address
- Prevents spam and abuse

### Input Validation
- Email format validation
- Phone number validation
- Input sanitization (removes HTML tags)
- Required field validation

### Duplicate Prevention
- Leads are updated if email already exists
- Prevents duplicate lead records

### Access Control
- Only Cloud Functions can write to leads and requests
- Authenticated users can read their own requests
- Recipients can read requests assigned to them
- Unit members can read requests assigned to their unit

### Language Tracking
- The `language` field tracks which language the user was using when they submitted the lead
- Values: `"en"` for English, `"es"` for Spanish
- Defaults to `"en"` if not provided
- Useful for analytics and follow-up communications in the appropriate language

## Cloud Functions

### createDemoRequest
Creates a demo request for a lead.

**Parameters:**
- `firstName`, `lastName`, `email`, `company`, `role` (required)
- `phone`, `message`, `organizationSize`, `language` (optional)

**Returns:**
- `leadId`: ID of the created/updated lead
- `requestId`: ID of the created request

### createQuoteRequest
Creates a quote request for a lead.

**Parameters:**
- `firstName`, `lastName`, `email`, `company`, `role` (required)
- `phone`, `quoteData`, `language` (optional)

**Returns:**
- `leadId`: ID of the created/updated lead
- `requestId`: ID of the created request

**Parameters:**
- `firstName`, `lastName`, `email`, `company`, `role` (required)
- `phone`, `quoteData` (optional)

**Returns:**
- `leadId`: ID of the created/updated lead
- `requestId`: ID of the created request

### getLeadByEmail
Retrieves lead data by email (authenticated users only).

### getLeadRequests
Retrieves requests for a specific lead.

### getRequestsByRecipient
Retrieves requests assigned to a specific recipient (user or unit).

### getLeadStats
Retrieves statistics for admin dashboard (authenticated users only).

## Client-Side Integration

### Basic Usage
```javascript
import { createDemoRequest, createQuoteRequest } from './lib/lead-capture-service.js';

// Create demo request
const result = await createDemoRequest({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@company.com',
  company: 'Tech Corp',
  role: 'CTO',
  message: 'Interested in AI solutions',
  organizationSize: '50-200'
});

if (result.success) {
  console.log('Demo request created:', result.data);
} else {
  console.error('Error:', result.error);
}

// Create quote request
const quoteResult = await createQuoteRequest({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@company.com',
  company: 'AI Corp',
  role: 'CEO',
  phone: '+1234567890',
  quoteData: {
    totalPrice: 15000,
    estimatedWeeks: 8,
    answers: [...],
    stages: [...]
  }
});
```

### Error Handling
The service provides comprehensive error handling:
- Validation errors with specific messages
- Rate limiting errors
- Network/availability errors
- Authentication errors

## Deployment

### Prerequisites
- Firebase project with Firestore enabled
- Firebase Functions enabled
- Firebase CLI installed

### Steps
1. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Deploy Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

4. Update client configuration:
   - Ensure Firebase config is properly set
   - Test functions with sample data

## Monitoring and Analytics

### Request Types
- Track different request types (demo, quote, review, etc.)
- Monitor conversion rates by type

### Requester Types
- Monitor requests by requester type (lead, user, system)
- Track lead-to-user conversion

### Recipient Performance
- Track requests by recipient (user/unit)
- Monitor response times and completion rates

### Value Tracking
- Track total value of quote requests
- Monitor average quote values by organization size

## Troubleshooting

### Common Issues

1. **Rate Limiting Errors**
   - Wait 1 minute before retrying
   - Check if multiple requests are being sent

2. **Validation Errors**
   - Ensure all required fields are provided
   - Check email and phone format
   - Verify input sanitization

3. **Authentication Errors**
   - Ensure user is logged in for protected functions
   - Check Firebase Auth configuration

4. **Firestore Permission Errors**
   - Verify Firestore rules are deployed
   - Check if user has proper permissions

### Debug Mode
Enable debug logging in Cloud Functions:
```javascript
console.log('Debug info:', { data, context });
```

### Testing
Test functions locally:
```bash
firebase emulators:start --only functions,firestore
```

## Future Enhancements

1. **Email Notifications**
   - Send notifications to recipients
   - Send confirmation emails to leads

2. **Request Workflow**
   - Status transitions
   - Assignment logic
   - SLA tracking

3. **Advanced Analytics**
   - Lead scoring
   - Conversion funnel analysis
   - ROI tracking

4. **Integration**
   - CRM integration
   - Marketing automation
   - Payment processing

5. **Mobile Support**
   - Mobile-optimized forms
   - Push notifications
   - Offline support 