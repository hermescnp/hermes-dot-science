const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Rate limiting helper
const rateLimit = new Map();

function isRateLimited(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip);
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= limit) {
    return true;
  }
  
  validRequests.push(now);
  rateLimit.set(ip, validRequests);
  return false;
}

// Validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  // Basic phone validation - can be enhanced based on your needs
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

// Generate a unique lead ID based on email
function generateLeadId(email) {
  return `lead_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
}

// Calculate a simple spam score
function calculateSpamScore(leadData, headers) {
  let score = 0;
  // Disposable email domains
  const disposableDomains = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (disposableDomains.some(domain => leadData.email.endsWith('@' + domain))) score += 50;
  // User agent contains 'bot'
  if ((headers['user-agent'] || '').toLowerCase().includes('bot')) score += 30;
  // Very short names
  if ((leadData.firstName + leadData.lastName).length < 4) score += 10;
  // No company name
  if (!leadData.company || leadData.company.length < 2) score += 10;
  // No referer or origin
  if (!headers['referer'] && !headers['origin']) score += 10;
  // Add more heuristics as needed
  return score;
}

// Create or update lead
async function createOrUpdateLead(leadData, clientIP, userAgent, context) {
  const headers = context.rawRequest.headers || {};
  const referer = headers['referer'] || '';
  const origin = headers['origin'] || '';
  const acceptLanguage = headers['accept-language'] || '';
  const xForwardedFor = headers['x-forwarded-for'] || '';
  const spamScore = calculateSpamScore(leadData, headers);
  const isSuspicious = spamScore >= 50;

  const sanitizedData = {
    firstName: sanitizeInput(leadData.firstName),
    lastName: sanitizeInput(leadData.lastName),
    email: sanitizeInput(leadData.email).toLowerCase(),
    company: sanitizeInput(leadData.company),
    role: sanitizeInput(leadData.role),
    phone: sanitizeInput(leadData.phone || ''),
    organizationSize: sanitizeInput(leadData.organizationSize || ''),
    language: sanitizeInput(leadData.language || 'en'), // Default to English if not provided
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: clientIP,
    userAgent: userAgent || '',
    referer,
    origin,
    acceptLanguage,
    xForwardedFor,
    spamScore,
    isSuspicious,
    status: 'active'
  };

  // Check if lead already exists
  const existingLead = await db.collection('leads')
    .where('email', '==', sanitizedData.email)
    .limit(1)
    .get();

  let leadId;
  if (!existingLead.empty) {
    // Update existing lead
    const leadDoc = existingLead.docs[0];
    leadId = leadDoc.id;
    await leadDoc.ref.update({
      ...sanitizedData,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Create new lead
    leadId = generateLeadId(sanitizedData.email);
    await db.collection('leads').doc(leadId).set(sanitizedData);
  }

  return leadId;
}

// Create demo request with flexible structure
async function createDemoRequest(leadId, requestData) {
  const now = new Date();
  
  const requestDoc = {
    type: "demo",
    description: sanitizeInput(requestData.message || "Demo request from website"),
    requestedSubjectId: {
      type: "service",
      id: "service_custom_ai_agents" // You can make this configurable
    },
    requester: {
      type: "lead",
      id: leadId
    },
    recipient: {
      type: "unit", // or "user" depending on your routing logic
      id: "unit_sales_department" // You can make this configurable
    },
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      organizationSize: sanitizeInput(requestData.organizationSize || ''),
      source: "website",
      priority: "medium",
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    }
  };

  const requestRef = await db.collection('requests').add(requestDoc);
  return requestRef.id;
}

// Create quote request with flexible structure
async function createQuoteRequest(leadId, quoteData) {
  const now = new Date();
  
  const requestDoc = {
    type: "quote",
    description: "Custom AI solution quote request",
    requestedSubjectId: {
      type: "service",
      id: "service_custom_ai_agents"
    },
    requester: {
      type: "lead",
      id: leadId
    },
    recipient: {
      type: "unit",
      id: "unit_sales_department"
    },
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      totalPrice: quoteData.totalPrice || 0,
      estimatedWeeks: quoteData.estimatedWeeks || 0,
      totalHours: quoteData.totalHours || 0,
      answers: quoteData.answers || [],
      stages: quoteData.stages || [],
      source: "website",
      priority: "high",
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
    }
  };

  const requestRef = await db.collection('requests').add(requestDoc);
  return requestRef.id;
}

// Demo request function
exports.createDemoRequest = functions.https.onCall(async (data, context) => {
  try {
    // Rate limiting check
    const clientIP = context.rawRequest.ip || context.rawRequest.connection.remoteAddress;
    if (isRateLimited(clientIP)) {
      throw new functions.https.HttpsError('resource-exhausted', 'Too many requests. Please try again later.');
    }

    // Validate required fields
    const { firstName, lastName, email, company, role, message, organizationSize } = data;

    if (!firstName || !lastName || !email || !company || !role) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Email validation
    if (!validateEmail(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
    }

    // Create or update lead
    const leadId = await createOrUpdateLead(data, clientIP, context.rawRequest.headers['user-agent'], context);

    // Create demo request
    const requestId = await createDemoRequest(leadId, { message, organizationSize });

    return {
      success: true,
      leadId: leadId,
      requestId: requestId,
      message: 'Demo request created successfully'
    };

  } catch (error) {
    console.error('Error creating demo request:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An error occurred while processing your request');
  }
});

// Quote request function
exports.createQuoteRequest = functions.https.onCall(async (data, context) => {
  try {
    // Rate limiting check
    const clientIP = context.rawRequest.ip || context.rawRequest.connection.remoteAddress;
    if (isRateLimited(clientIP)) {
      throw new functions.https.HttpsError('resource-exhausted', 'Too many requests. Please try again later.');
    }

    // Validate required fields
    const { firstName, lastName, email, company, role, phone, quoteData } = data;

    if (!firstName || !lastName || !email || !company || !role) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Email validation
    if (!validateEmail(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
    }

    // Phone validation (if provided)
    if (phone && !validatePhone(phone)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number');
    }

    // Create or update lead
    const leadId = await createOrUpdateLead(data, clientIP, context.rawRequest.headers['user-agent'], context);

    // Create quote request
    const requestId = await createQuoteRequest(leadId, quoteData);

    return {
      success: true,
      leadId: leadId,
      requestId: requestId,
      message: 'Quote request created successfully'
    };

  } catch (error) {
    console.error('Error creating quote request:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An error occurred while processing your request');
  }
});

// Final quote creation function (stores in quotations collection)
exports.createFinalQuote = functions.https.onCall(async (data, context) => {
  try {
    // Rate limiting check
    const clientIP = context.rawRequest.ip || context.rawRequest.connection.remoteAddress;
    if (isRateLimited(clientIP)) {
      throw new functions.https.HttpsError('resource-exhausted', 'Too many requests. Please try again later.');
    }

    // Validate required fields
    const { leadData, businessData, quoteAnswers, totalPrice, totalHours, language, attachedTo, attachedId, quoteSteps } = data;

    if (!leadData || !businessData || !quoteAnswers || !totalPrice || !totalHours || !attachedTo || !attachedId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate business identification
    if (!businessData.identificationType || !businessData.identification) {
      throw new functions.https.HttpsError('invalid-argument', 'Business identification is required');
    }

    // Create the final quote document with detailed step information
    const quoteDoc = {
      leadData: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        company: leadData.company,
        role: leadData.role,
        phone: leadData.phone,
        language: language || 'en'
      },
      businessData: {
        identificationType: businessData.identificationType,
        identification: businessData.identification
      },
      quoteAnswers: quoteAnswers,
      quoteSteps: quoteSteps || [], // Detailed step-by-step information
      totalPrice: totalPrice,
      totalHours: totalHours,
      attachedTo: attachedTo, // 'lead' or 'user'
      attachedId: attachedId,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      clientIP: clientIP,
      userAgent: context.rawRequest.headers['user-agent'] || 'unknown'
    };

    // Add to quotations collection
    const quoteRef = await db.collection('quotations').add(quoteDoc);

    return {
      success: true,
      quoteId: quoteRef.id,
      message: 'Quote created successfully'
    };

  } catch (error) {
    console.error('Error creating final quote:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An error occurred while creating the quote');
  }
});

// Create or update a lead and return its ID
exports.createLead = functions.https.onCall(async (data, context) => {
  try {
    console.log('createLead called with data:', data);
    const clientIP = context.rawRequest.ip || context.rawRequest.connection?.remoteAddress || '';
    const userAgent = context.rawRequest.headers['user-agent'] || '';
    console.log('Client IP:', clientIP, 'User Agent:', userAgent);
    
    // Validate required fields
    const { firstName, lastName, email, company, role, phone, organizationSize, language } = data;
    console.log('Extracted fields:', { firstName, lastName, email, company, role, phone, language });
    
    if (!firstName || !lastName || !email || !company || !role) {
      console.log('Missing required fields');
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    if (!validateEmail(email)) {
      console.log('Invalid email:', email);
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
    }
    if (phone && !validatePhone(phone)) {
      console.log('Invalid phone:', phone);
      throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number');
    }
    
    console.log('All validations passed, calling createOrUpdateLead');
    const leadId = await createOrUpdateLead(data, clientIP, userAgent, context);
    console.log('Lead created/updated with ID:', leadId);
    return { success: true, leadId };
  } catch (error) {
    console.error('Error creating lead:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'An error occurred while creating the lead');
  }
});

// Create a quotation attached to a lead (using the simplified quote data structure)
exports.createQuotation = functions.https.onCall(async (data, context) => {
  try {
    const clientIP = context.rawRequest.ip || context.rawRequest.connection?.remoteAddress || '';
    
    // Add detailed logging to debug the issue
    console.log('createQuotation called with data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const { leadId, clientInfo, quoteDetails, totalPrice, totalHours, language, summary } = data;
    
    console.log('Extracted fields:', {
      leadId: !!leadId,
      clientInfo: !!clientInfo,
      quoteDetails: !!quoteDetails,
      totalPrice: totalPrice,
      totalHours: totalHours,
      language: language
    });
    
    if (!leadId || !clientInfo || !quoteDetails || !totalPrice || !totalHours) {
      console.log('Missing required fields - validation failed');
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    
    // Attach the quotation to the lead
    const quoteDoc = {
      leadId,
      clientInfo,
      quoteDetails,
      totalPrice,
      totalHours,
      language: language || 'en',
      summary: summary || {
        totalInvestment: totalPrice,
        totalHours: totalHours,
        estimatedWeeks: Math.ceil(totalHours / 40),
        estimatedCompletion: new Date(Date.now() + Math.ceil(totalHours / 40) * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      clientIP,
      status: 'pending',
    };
    const quoteRef = await db.collection('quotations').add(quoteDoc);
    return { success: true, quoteId: quoteRef.id };
  } catch (error) {
    console.error('Error creating quotation:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'An error occurred while creating the quotation');
  }
});

// Function to get lead by email (for authenticated users)
exports.getLeadByEmail = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { email } = data;
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }

    const leadSnapshot = await db.collection('leads')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (leadSnapshot.empty) {
      return { success: false, message: 'Lead not found' };
    }

    const leadData = leadSnapshot.docs[0].data();
    return {
      success: true,
      leadId: leadSnapshot.docs[0].id,
      leadData: leadData
    };

  } catch (error) {
    console.error('Error getting lead:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An error occurred while retrieving lead data');
  }
});

// Function to get requests for a lead
exports.getLeadRequests = functions.https.onCall(async (data, context) => {
  try {
    const { leadId, type } = data; // type can be 'demo', 'quote', or 'all'

    if (!leadId) {
      throw new functions.https.HttpsError('invalid-argument', 'Lead ID is required');
    }

    let query = db.collection('requests')
      .where('requester.id', '==', leadId)
      .where('requester.type', '==', 'lead');

    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }

    const requestsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .get();
    
    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      requests: requests
    };

  } catch (error) {
    console.error('Error getting lead requests:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An error occurred while retrieving requests');
  }
});

// Function to get requests by recipient (for users/units)
exports.getRequestsByRecipient = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { recipientType, recipientId, status } = data;

    if (!recipientType || !recipientId) {
      throw new functions.https.HttpsError('invalid-argument', 'Recipient type and ID are required');
    }

    let query = db.collection('requests')
      .where('recipient.type', '==', recipientType)
      .where('recipient.id', '==', recipientId);

    if (status) {
      query = query.where('status', '==', status);
    }

    const requestsSnapshot = await query
      .orderBy('createdAt', 'desc')
      .get();
    
    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      requests: requests
    };

  } catch (error) {
    console.error('Error getting requests by recipient:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'An error occurred while retrieving requests');
  }
});

// Optional: Function to send notification emails
async function sendNotificationEmail(leadData, requestType, requestId) {
  // Implement email notification logic here
  // You can use services like SendGrid, Mailgun, or Firebase Extensions
  console.log(`Notification email would be sent for ${requestType} request ${requestId} from ${leadData.email}`);
}

// Optional: Function to get lead statistics (for admin dashboard)
exports.getLeadStats = functions.https.onCall(async (data, context) => {
  // Add authentication check for admin access
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    const [leadsSnapshot, requestsSnapshot] = await Promise.all([
      db.collection('leads').get(),
      db.collection('requests').get()
    ]);

    const leads = leadsSnapshot.docs.map(doc => doc.data());
    const requests = requestsSnapshot.docs.map(doc => doc.data());

    return {
      leads: {
        total: leads.length,
        byStatus: leads.reduce((acc, lead) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {})
      },
      requests: {
        total: requests.length,
        byType: requests.reduce((acc, req) => {
          acc[req.type] = (acc[req.type] || 0) + 1;
          return acc;
        }, {}),
        byStatus: requests.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {}),
        byRequesterType: requests.reduce((acc, req) => {
          acc[req.requester.type] = (acc[req.requester.type] || 0) + 1;
          return acc;
        }, {}),
        totalValue: requests
          .filter(req => req.type === 'quote' && req.metadata?.totalPrice)
          .reduce((sum, req) => sum + (req.metadata.totalPrice || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error getting lead stats:', error);
    throw new functions.https.HttpsError('internal', 'Error retrieving lead statistics');
  }
}); 