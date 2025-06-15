import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang") || "en"

  try {
    const content = {
      en: {
        hero: {
          title: "Custom AI Agent Solutions",
          subtitle: "Enterprise-grade AI agents tailored to your organization's unique needs",
          description:
            "We build intelligent automation solutions that integrate seamlessly with your existing systems and workflows.",
        },
        coreOffering: {
          title: "What We Do",
          subtitle: "Building the Future of Enterprise Automation",
          description:
            "We specialize in creating custom AI agent-based solutions and integrations specifically designed for enterprises and government entities. Our AI agents don't just automate tasks—they understand your business context, learn from your data, and evolve with your organization.",
          features: [
            {
              icon: "Bot",
              title: "Custom AI Agents",
              description:
                "Tailored intelligent agents that understand your specific business processes and requirements.",
            },
            {
              icon: "Network",
              title: "System Integration",
              description:
                "Seamless integration with your existing CRM, ERP, and internal systems for unified operations.",
            },
            {
              icon: "Shield",
              title: "Enterprise Security",
              description: "Bank-level security with compliance for government and enterprise regulatory requirements.",
            },
            {
              icon: "Zap",
              title: "Real-time Intelligence",
              description: "AI agents that access live data and provide contextual, up-to-date responses and actions.",
            },
          ],
        },
        benefits: {
          title: "Why Choose Our AI Agent Solutions",
          subtitle: "Transform your operations with intelligent automation",
          items: [
            {
              icon: "TrendingUp",
              title: "Increased Efficiency",
              description: "Automate repetitive tasks and reduce operational overhead by up to 70%",
              metric: "70% reduction in manual tasks",
            },
            {
              icon: "Clock",
              title: "24/7 Availability",
              description: "Your AI agents work around the clock, providing instant responses and support",
              metric: "24/7 operation",
            },
            {
              icon: "Target",
              title: "Improved Accuracy",
              description: "Eliminate human error with consistent, data-driven decision making",
              metric: "99.9% accuracy rate",
            },
            {
              icon: "DollarSign",
              title: "Cost Reduction",
              description: "Significant reduction in operational costs while improving service quality",
              metric: "Up to 60% cost savings",
            },
            {
              icon: "Users",
              title: "Enhanced User Experience",
              description: "Provide instant, personalized responses to customers and employees",
              metric: "95% user satisfaction",
            },
            {
              icon: "BarChart",
              title: "Scalable Growth",
              description: "Scale your operations without proportional increases in staffing costs",
              metric: "Unlimited scalability",
            },
          ],
        },
        process: {
          title: "How Our AI Agent Creation Service Works",
          subtitle: "A proven 8-step methodology for successful AI implementation",
          steps: [
            {
              number: "01",
              title: "Organizational Diagnostic",
              subtitle: "Free Analysis",
              description:
                "We analyze your structure, processes, and communication flows to detect bottlenecks and pain points that your new AI agent can alleviate.",
              features: [
                "Process mapping and analysis",
                "Bottleneck identification",
                "Pain point assessment",
                "Opportunity evaluation",
              ],
              icon: "Search",
              color: "from-blue-500 to-cyan-500",
            },
            {
              number: "02",
              title: "Demo Proposal",
              subtitle: "Free Demonstration",
              description:
                "We prepare a practical demo accompanied by detailed planning documents, all free of charge, so you can immediately see the value and feasibility of the project.",
              features: [
                "MoSCoW Matrix (Must, Should, Could, Won't)",
                "Implementation Roadmap",
                "Estimated Budget",
                "Live demonstration",
              ],
              icon: "Presentation",
              color: "from-purple-500 to-pink-500",
            },
            {
              number: "03",
              title: "Architecture and Workflow Design",
              subtitle: "Technical Planning",
              description:
                "We document the workflow to be implemented in detail and define the technical architecture for optimal performance and scalability.",
              features: [
                "Component diagrams",
                "Key integrations mapping",
                "Infrastructure requirements",
                "Security architecture",
              ],
              icon: "GitBranch",
              color: "from-green-500 to-emerald-500",
            },
            {
              number: "04",
              title: "Knowledge Curation",
              subtitle: "Data Preparation",
              description:
                "We collect, cleanse, and structure all relevant information to provide the AI model with the most accurate context possible.",
              features: [
                "Document collection and analysis",
                "Data cleansing and validation",
                "Knowledge base structuring",
                "Context optimization",
              ],
              icon: "Database",
              color: "from-orange-500 to-red-500",
            },
            {
              number: "05",
              title: "Implementation and Development",
              subtitle: "Building Your Solution",
              description:
                "We build and train your AI agent, tailoring it to your specific needs with the latest technologies and frameworks.",
              features: [
                "Technology selection (models, APIs, frameworks)",
                "Business logic development",
                "Training and fine-tuning",
                "Custom feature development",
              ],
              icon: "Code",
              color: "from-indigo-500 to-purple-500",
            },
            {
              number: "06",
              title: "Smart Integrations",
              subtitle: "System Connectivity",
              description:
                "We connect your agent with existing systems so it can access real-time data and offer contextualized responses.",
              features: [
                "CRM integration",
                "ERP system connectivity",
                "Internal chat platforms",
                "Web portal integration",
              ],
              icon: "Plug",
              color: "from-teal-500 to-blue-500",
            },
            {
              number: "07",
              title: "Quality Assurance",
              subtitle: "Testing & Validation",
              description:
                "We test your agent in real-life and simulated scenarios to ensure optimal performance and compliance.",
              features: [
                "Response accuracy testing",
                "Robustness against failures",
                "Security compliance validation",
                "Performance optimization",
              ],
              icon: "CheckCircle",
              color: "from-emerald-500 to-green-500",
            },
            {
              number: "08",
              title: "Maintenance and Results Tracking",
              subtitle: "Ongoing Optimization",
              description:
                "We continuously monitor performance based on your KPIs and propose periodic improvements to maximize your return on investment.",
              features: [
                "Performance monitoring",
                "KPI tracking and reporting",
                "Continuous optimization",
                "ROI maximization",
              ],
              icon: "BarChart3",
              color: "from-yellow-500 to-orange-500",
            },
          ],
        },
        cta: {
          title: "Ready to Transform Your Organization?",
          subtitle:
            "Start with a free organizational diagnostic and see how AI agents can revolutionize your operations",
          primaryButton: "Get Free Analysis",
          secondaryButton: "Schedule Consultation",
        },
      },
      es: {
        hero: {
          title: "Soluciones de Agentes de IA Personalizados",
          subtitle: "Agentes de IA de nivel empresarial adaptados a las necesidades únicas de tu organización",
          description:
            "Construimos soluciones de automatización inteligente que se integran perfectamente con tus sistemas y flujos de trabajo existentes.",
        },
        coreOffering: {
          title: "Lo Que Hacemos",
          subtitle: "Construyendo el Futuro de la Automatización Empresarial",
          description:
            "Nos especializamos en crear soluciones e integraciones personalizadas basadas en agentes de IA, diseñadas específicamente para empresas y entidades gubernamentales. Nuestros agentes de IA no solo automatizan tareas—entienden el contexto de tu negocio, aprenden de tus datos y evolucionan con tu organización.",
          features: [
            {
              icon: "Bot",
              title: "Agentes de IA Personalizados",
              description:
                "Agentes inteligentes adaptados que entienden tus procesos y requisitos específicos de negocio.",
            },
            {
              icon: "Network",
              title: "Integración de Sistemas",
              description:
                "Integración perfecta con tu CRM, ERP y sistemas internos existentes para operaciones unificadas.",
            },
            {
              icon: "Shield",
              title: "Seguridad Empresarial",
              description:
                "Seguridad de nivel bancario con cumplimiento para requisitos regulatorios gubernamentales y empresariales.",
            },
            {
              icon: "Zap",
              title: "Inteligencia en Tiempo Real",
              description:
                "Agentes de IA que acceden a datos en vivo y proporcionan respuestas y acciones contextuales y actualizadas.",
            },
          ],
        },
        benefits: {
          title: "Por Qué Elegir Nuestras Soluciones de Agentes de IA",
          subtitle: "Transforma tus operaciones con automatización inteligente",
          items: [
            {
              icon: "TrendingUp",
              title: "Mayor Eficiencia",
              description: "Automatiza tareas repetitivas y reduce la sobrecarga operacional hasta en un 70%",
              metric: "70% reducción en tareas manuales",
            },
            {
              icon: "Clock",
              title: "Disponibilidad 24/7",
              description: "Tus agentes de IA trabajan las 24 horas, proporcionando respuestas y soporte instantáneo",
              metric: "Operación 24/7",
            },
            {
              icon: "Target",
              title: "Precisión Mejorada",
              description: "Elimina el error humano con toma de decisiones consistente y basada en datos",
              metric: "99.9% tasa de precisión",
            },
            {
              icon: "DollarSign",
              title: "Reducción de Costos",
              description: "Reducción significativa en costos operacionales mientras mejoras la calidad del servicio",
              metric: "Hasta 60% ahorro en costos",
            },
            {
              icon: "Users",
              title: "Experiencia de Usuario Mejorada",
              description: "Proporciona respuestas instantáneas y personalizadas a clientes y empleados",
              metric: "95% satisfacción del usuario",
            },
            {
              icon: "BarChart",
              title: "Crecimiento Escalable",
              description: "Escala tus operaciones sin aumentos proporcionales en costos de personal",
              metric: "Escalabilidad ilimitada",
            },
          ],
        },
        process: {
          title: "Cómo Funciona Nuestro Servicio de Creación de Agentes de IA",
          subtitle: "Una metodología probada de 8 pasos para una implementación exitosa de IA",
          steps: [
            {
              number: "01",
              title: "Diagnóstico Organizacional",
              subtitle: "Análisis Gratuito",
              description:
                "Analizamos tu estructura, procesos y flujos de comunicación para detectar cuellos de botella y puntos de dolor que tu nuevo agente de IA puede aliviar.",
              features: [
                "Mapeo y análisis de procesos",
                "Identificación de cuellos de botella",
                "Evaluación de puntos de dolor",
                "Evaluación de oportunidades",
              ],
              icon: "Search",
              color: "from-blue-500 to-cyan-500",
            },
            {
              number: "02",
              title: "Propuesta de Demo",
              subtitle: "Demostración Gratuita",
              description:
                "Preparamos una demo práctica acompañada de documentos de planificación detallados, todo gratuito, para que puedas ver inmediatamente el valor y la viabilidad del proyecto.",
              features: [
                "Matriz MoSCoW (Must, Should, Could, Won't)",
                "Hoja de Ruta de Implementación",
                "Presupuesto Estimado",
                "Demostración en vivo",
              ],
              icon: "Presentation",
              color: "from-purple-500 to-pink-500",
            },
            {
              number: "03",
              title: "Diseño de Arquitectura y Flujo de Trabajo",
              subtitle: "Planificación Técnica",
              description:
                "Documentamos el flujo de trabajo a implementar en detalle y definimos la arquitectura técnica para un rendimiento y escalabilidad óptimos.",
              features: [
                "Diagramas de componentes",
                "Mapeo de integraciones clave",
                "Requisitos de infraestructura",
                "Arquitectura de seguridad",
              ],
              icon: "GitBranch",
              color: "from-green-500 to-emerald-500",
            },
            {
              number: "04",
              title: "Curación del Conocimiento",
              subtitle: "Preparación de Datos",
              description:
                "Recopilamos, limpiamos y estructuramos toda la información relevante para proporcionar al modelo de IA el contexto más preciso posible.",
              features: [
                "Recopilación y análisis de documentos",
                "Limpieza y validación de datos",
                "Estructuración de base de conocimientos",
                "Optimización de contexto",
              ],
              icon: "Database",
              color: "from-orange-500 to-red-500",
            },
            {
              number: "05",
              title: "Implementación y Desarrollo",
              subtitle: "Construyendo Tu Solución",
              description:
                "Construimos y entrenamos tu agente de IA, adaptándolo a tus necesidades específicas con las últimas tecnologías y frameworks.",
              features: [
                "Selección de tecnología (modelos, APIs, frameworks)",
                "Desarrollo de lógica de negocio",
                "Entrenamiento y ajuste fino",
                "Desarrollo de características personalizadas",
              ],
              icon: "Code",
              color: "from-indigo-500 to-purple-500",
            },
            {
              number: "06",
              title: "Integraciones Inteligentes",
              subtitle: "Conectividad de Sistemas",
              description:
                "Conectamos tu agente con sistemas existentes para que pueda acceder a datos en tiempo real y ofrecer respuestas contextualizadas.",
              features: [
                "Integración CRM",
                "Conectividad de sistema ERP",
                "Plataformas de chat interno",
                "Integración de portal web",
              ],
              icon: "Plug",
              color: "from-teal-500 to-blue-500",
            },
            {
              number: "07",
              title: "Aseguramiento de Calidad",
              subtitle: "Pruebas y Validación",
              description:
                "Probamos tu agente en escenarios de la vida real y simulados para asegurar un rendimiento óptimo y cumplimiento.",
              features: [
                "Pruebas de precisión de respuesta",
                "Robustez contra fallas",
                "Validación de cumplimiento de seguridad",
                "Optimización de rendimiento",
              ],
              icon: "CheckCircle",
              color: "from-emerald-500 to-green-500",
            },
            {
              number: "08",
              title: "Mantenimiento y Seguimiento de Resultados",
              subtitle: "Optimización Continua",
              description:
                "Monitoreamos continuamente el rendimiento basado en tus KPIs y proponemos mejoras periódicas para maximizar tu retorno de inversión.",
              features: [
                "Monitoreo de rendimiento",
                "Seguimiento e informes de KPI",
                "Optimización continua",
                "Maximización de ROI",
              ],
              icon: "BarChart3",
              color: "from-yellow-500 to-orange-500",
            },
          ],
        },
        cta: {
          title: "¿Listo para Transformar tu Organización?",
          subtitle:
            "Comienza con un diagnóstico organizacional gratuito y ve cómo los agentes de IA pueden revolucionar tus operaciones",
          primaryButton: "Obtener Análisis Gratuito",
          secondaryButton: "Programar Consulta",
        },
      },
    }

    return NextResponse.json(content[lang as keyof typeof content] || content.en)
  } catch (error) {
    console.error("Error loading learn-more content:", error)
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 })
  }
}
