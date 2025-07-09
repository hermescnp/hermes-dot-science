import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, role, phone, message, organizationSize, language } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !company || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Store the demo request in your database
    // 2. Send notification emails
    // 3. Integrate with your CRM system
    
    // For now, we'll just log the request and return success
    console.log('Demo request received:', {
      firstName,
      lastName,
      email,
      company,
      role,
      phone,
      message,
      organizationSize,
      language,
      timestamp: new Date().toISOString()
    })

    // You can add your own logic here:
    // - Send to your CRM (HubSpot, Salesforce, etc.)
    // - Send notification emails
    // - Store in your database
    // - Integrate with your lead management system

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully',
      data: {
        leadId: `demo_${Date.now()}`,
        requestId: `request_${Date.now()}`
      }
    })

  } catch (error) {
    console.error('Error processing demo request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 