import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase.js';

const functions = getFunctions(app);

// Initialize the Cloud Functions
const createDemoRequestFunction = httpsCallable(functions, 'createDemoRequest');
const createQuoteRequestFunction = httpsCallable(functions, 'createQuoteRequest');
const createFinalQuoteFunction = httpsCallable(functions, 'createFinalQuote');
const createLeadFunction = httpsCallable(functions, 'createLead');
const createQuotationFunction = httpsCallable(functions, 'createQuotation');
const getLeadByEmailFunction = httpsCallable(functions, 'getLeadByEmail');
const getLeadRequestsFunction = httpsCallable(functions, 'getLeadRequests');
const getRequestsByRecipientFunction = httpsCallable(functions, 'getRequestsByRecipient');

/**
 * Create a demo request (creates/updates lead first, then creates request)
 * @param {Object} leadData - The lead data
 * @param {string} leadData.firstName - First name
 * @param {string} leadData.lastName - Last name
 * @param {string} leadData.email - Email address
 * @param {string} leadData.company - Company name
 * @param {string} leadData.role - Job role
 * @param {string} leadData.phone - Phone number (optional)
 * @param {string} leadData.message - Additional message (optional)
 * @param {string} leadData.organizationSize - Organization size (optional)
 * @param {string} leadData.language - Website language when lead was created (optional, defaults to 'en')
 * @returns {Promise<Object>} - Response with leadId and requestId
 */
export async function createDemoRequest(leadData) {
  try {
    const result = await createDemoRequestFunction(leadData);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error creating demo request:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred while submitting your request.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Please check your information and try again.';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'Service temporarily unavailable. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Create a quote request (creates/updates lead first, then creates request)
 * @param {Object} leadData - The lead data
 * @param {string} leadData.firstName - First name
 * @param {string} leadData.lastName - Last name
 * @param {string} leadData.email - Email address
 * @param {string} leadData.company - Company name
 * @param {string} leadData.role - Job role
 * @param {string} leadData.phone - Phone number (optional)
 * @param {Object} leadData.quoteData - Quote data from the conversation
 * @param {string} leadData.language - Website language when lead was created (optional, defaults to 'en')
 * @returns {Promise<Object>} - Response with leadId and requestId
 */
export async function createQuoteRequest(leadData) {
  try {
    const result = await createQuoteRequestFunction(leadData);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error creating quote request:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred while submitting your quote request.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Please check your information and try again.';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'Service temporarily unavailable. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Create or update a lead and return its ID
 * @param {Object} leadData - The lead data
 * @param {string} leadData.firstName - First name
 * @param {string} leadData.lastName - Last name
 * @param {string} leadData.email - Email address
 * @param {string} leadData.company - Company name
 * @param {string} leadData.role - Job role
 * @param {string} leadData.phone - Phone number (optional)
 * @param {string} leadData.language - Website language when lead was created (optional, defaults to 'en')
 * @returns {Promise<Object>} - Response with leadId
 */
export async function createLead(leadData) {
  try {
    const result = await createLeadFunction(leadData);
    
    return {
      success: true,
      leadId: result.data.leadId
    };
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred while creating your lead.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Please check your information and try again.';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'Service temporarily unavailable. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Create a quotation attached to a lead
 * @param {Object} quoteData - The quote data
 * @param {string} quoteData.leadId - The lead ID
 * @param {Object} quoteData.clientInfo - Client information (merged user and business data)
 * @param {Array} quoteData.quoteDetails - Simplified quote details array
 * @param {number} quoteData.totalPrice - Total quote price
 * @param {number} quoteData.totalHours - Total development hours
 * @param {string} quoteData.language - Website language
 * @param {Object} quoteData.summary - Quote summary information
 * @returns {Promise<Object>} - Response with quoteId
 */
export async function createQuotation(quoteData) {
  try {
    const result = await createQuotationFunction(quoteData);
    
    return {
      success: true,
      quoteId: result.data.quoteId
    };
  } catch (error) {
    console.error('Error creating quotation:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred while creating your quotation.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Please check your information and try again.';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'Service temporarily unavailable. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Create the final quote with business identification (stores in quotations collection)
 * @param {Object} quoteData - The complete quote data
 * @param {Object} quoteData.leadData - Lead information
 * @param {Object} quoteData.businessData - Business identification data
 * @param {Object} quoteData.quoteAnswers - Quote conversation answers
 * @param {Array} quoteData.quoteSteps - Detailed step-by-step quote information
 * @param {number} quoteData.totalPrice - Total quote price
 * @param {number} quoteData.totalHours - Total development hours
 * @param {string} quoteData.language - Website language
 * @param {string} quoteData.attachedTo - Type of attachment: 'lead' or 'user'
 * @param {string} quoteData.attachedId - ID of the lead or user
 * @returns {Promise<Object>} - Response with quoteId
 */
export async function createFinalQuote(quoteData) {
  try {
    const result = await createFinalQuoteFunction(quoteData);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error creating final quote:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred while saving your quote.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Please check your information and try again.';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'Service temporarily unavailable. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get lead data by email (for authenticated users)
 * @param {string} email - Email address to search for
 * @returns {Promise<Object>} - Lead data if found
 */
export async function getLeadByEmail(email) {
  try {
    const result = await getLeadByEmailFunction({ email });
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error getting lead by email:', error);
    
    let errorMessage = 'An error occurred while retrieving lead data.';
    
    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Authentication required to access lead data.';
    } else if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Invalid email address.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get requests for a lead
 * @param {string} leadId - The lead ID
 * @param {string} type - Type to retrieve: 'demo', 'quote', or 'all'
 * @returns {Promise<Object>} - Requests data
 */
export async function getLeadRequests(leadId, type = 'all') {
  try {
    const result = await getLeadRequestsFunction({ leadId, type });
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error getting lead requests:', error);
    
    let errorMessage = 'An error occurred while retrieving requests.';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Invalid lead ID.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get requests by recipient (for users/units)
 * @param {string} recipientType - Type of recipient: 'user' or 'unit'
 * @param {string} recipientId - ID of the recipient
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} - Requests data
 */
export async function getRequestsByRecipient(recipientType, recipientId, status = null) {
  try {
    const params = { recipientType, recipientId };
    if (status) {
      params.status = status;
    }
    
    const result = await getRequestsByRecipientFunction(params);
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error getting requests by recipient:', error);
    
    let errorMessage = 'An error occurred while retrieving requests.';
    
    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Authentication required to access request data.';
    } else if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Invalid recipient information.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validate lead data before submission
 * @param {Object} data - The data to validate
 * @returns {Object} - Validation result
 */
export function validateLeadData(data) {
  const errors = [];
  
  // Required fields
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.company?.trim()) errors.push('Company is required');
  if (!data.role?.trim()) errors.push('Role is required');
  
  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Phone validation (if provided)
  if (data.phone) {
    // Remove all formatting characters (spaces, dashes, parentheses) and validate
    const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone)) {
      errors.push('Please enter a valid phone number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Store lead data in localStorage for later use
 * @param {Object} leadData - The lead data to store
 */
export function storeLeadData(leadData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('leadData', JSON.stringify({
      ...leadData,
      timestamp: new Date().toISOString()
    }));
  }
}

/**
 * Get stored lead data from localStorage
 * @returns {Object|null} - Stored lead data or null
 */
export function getStoredLeadData() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('leadData');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored lead data:', error);
        localStorage.removeItem('leadData');
      }
    }
  }
  return null;
}

/**
 * Clear stored lead data from localStorage
 */
export function clearStoredLeadData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('leadData');
  }
} 