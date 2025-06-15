import { type NextRequest, NextResponse } from "next/server"

const quoteContent = {
  en: {
    hero: {
      title: "Get Your Custom Quote",
      subtitle: "Tell us about your project and we'll provide a tailored solution",
      description: "Fill out the form below and our team will get back to you within 24 hours",
    },
    form: {
      title: "Project Details",
      fields: {
        company: "Company Name",
        email: "Email Address",
        phone: "Phone Number",
        industry: "Industry",
        projectType: "Project Type",
        budget: "Budget Range",
        timeline: "Timeline",
        description: "Project Description",
        requirements: "Specific Requirements",
      },
      buttons: {
        submit: "Submit Quote Request",
        back: "Back to Learn More",
      },
    },
    confirmation: {
      title: "Quote Request Submitted!",
      message:
        "Thank you for your interest. Our team will review your requirements and get back to you within 24 hours.",
      nextSteps: [
        "Our team will review your requirements",
        "We'll prepare a customized proposal",
        "Schedule a consultation call",
        "Finalize project details",
      ],
      button: "Back to Home",
    },
  },
  es: {
    hero: {
      title: "Obtén Tu Cotización Personalizada",
      subtitle: "Cuéntanos sobre tu proyecto y te proporcionaremos una solución a medida",
      description: "Completa el formulario a continuación y nuestro equipo te responderá en 24 horas",
    },
    form: {
      title: "Detalles del Proyecto",
      fields: {
        company: "Nombre de la Empresa",
        email: "Dirección de Email",
        phone: "Número de Teléfono",
        industry: "Industria",
        projectType: "Tipo de Proyecto",
        budget: "Rango de Presupuesto",
        timeline: "Cronograma",
        description: "Descripción del Proyecto",
        requirements: "Requisitos Específicos",
      },
      buttons: {
        submit: "Enviar Solicitud de Cotización",
        back: "Volver a Saber Más",
      },
    },
    confirmation: {
      title: "��Solicitud de Cotización Enviada!",
      message: "Gracias por tu interés. Nuestro equipo revisará tus requisitos y te responderá en 24 horas.",
      nextSteps: [
        "Nuestro equipo revisará tus requisitos",
        "Prepararemos una propuesta personalizada",
        "Programaremos una llamada de consulta",
        "Finalizaremos los detalles del proyecto",
      ],
      button: "Volver al Inicio",
    },
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang") || "en"

  const content = quoteContent[lang as keyof typeof quoteContent] || quoteContent.en

  return NextResponse.json(content)
}
