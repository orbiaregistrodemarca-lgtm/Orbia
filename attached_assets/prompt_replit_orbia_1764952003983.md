# PROMPT PARA REPLIT - PROYECTO ORBIA

## 🎯 RESUMEN DEL PROYECTO

Crea **ORBIA**, una plataforma web moderna para registro de marcas en México ante el IMPI (Instituto Mexicano de la Propiedad Industrial). La plataforma usa IA para clasificar marcas según el Sistema de Niza y generar documentos legales.

**Powered by NOMINUS** - El mejor despacho de abogados de registro de marcas de México.

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico:
- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** n8n webhooks (ya configurados)
- **Base de datos:** Supabase (ya configurada)
- **IA:** Agente NOMINUS via n8n

### Webhook de Clasificación (YA FUNCIONA):
```
URL: https://orbia.app.n8n.cloud/webhook/clasificar-marca
Método: POST
Headers: Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre_marca": "Mi Marca",
  "que_vende": "Descripción de productos/servicios",
  "url_empresa": "https://ejemplo.com (opcional)"
}
```

**Response (JSON directo, puede ser array):**
```json
{
  "clase_niza": 43,
  "nombre_clase": "Servicios de restauración (alimentación)",
  "justificacion": "Fundamento legal...",
  "nivel_viabilidad": "ALTA" | "MEDIA" | "BAJA",
  "es_nombre_famoso": true | false,
  "analisis_riesgo": "Análisis del riesgo...",
  "descripcion_juridica": "Descripción extendida de 150+ palabras...",
  "palabras_clave": ["palabra1", "palabra2"],
  "sugerencias_nombres": ["alternativa1", "alternativa2", "alternativa3"],
  "clases_adicionales": "Información sobre otras clases necesarias"
}
```

---

## 📱 ESTRUCTURA DE PÁGINAS

### 1. LANDING PAGE (/)

#### Hero Section:
- **Título grande:** "Registra tu marca en México con IA"
- **Subtítulo:** "ORBIA analiza tu marca en segundos y te guía paso a paso para protegerla ante el IMPI"
- **CTA Principal:** Botón grande "Analizar mi marca GRATIS" → lleva al formulario
- **Video/Animación:** Mostrar demo del proceso o animación de la mascota ORBIA

#### Mascota ORBIA:
- Crear un personaje/mascota que represente a ORBIA
- Puede ser un orbe/esfera brillante con ojos amigables, o un robot legal futurista
- La mascota aparece en diferentes secciones dando tips
- Animaciones sutiles con Framer Motion (flotar, parpadear, señalar)

#### Sección "¿Cómo funciona?":
3 pasos con iconos animados:
1. **Ingresa tu marca** - Icono de teclado/formulario
2. **IA analiza viabilidad** - Icono de cerebro/procesamiento
3. **Recibe tu estudio** - Icono de documento/check

#### Sección "¿Por qué ORBIA?":
- ✅ Análisis basado en la Ley Federal de Propiedad Industrial
- ✅ Clasificación NIZA automática
- ✅ Detección de nombres famosos prohibidos
- ✅ Descripción jurídica lista para IMPI
- ✅ Powered by NOMINUS, expertos en registro de marcas

#### Sección Testimonios:
- 3-4 testimonios de clientes ficticios con fotos placeholder
- Diseño tipo carrusel o grid

#### Sección Precios (placeholder):
- Plan Básico: Análisis de viabilidad
- Plan Pro: Análisis + Documento IMPI
- Plan Enterprise: Todo incluido + Asesoría legal

#### Footer:
- Logo ORBIA
- "Powered by NOMINUS"
- Links: Términos, Privacidad, Contacto
- Redes sociales (placeholder)

---

### 2. PÁGINA DE CLASIFICACIÓN (/clasificar)

#### Formulario de entrada:
```jsx
<form>
  {/* Campo 1: Nombre de la marca */}
  <input 
    type="text"
    name="nombre_marca"
    placeholder="Ej: TacoMax, TechFlow, Bella Vista..."
    required
  />

  {/* Campo 2: Descripción de productos/servicios */}
  <textarea
    name="que_vende"
    placeholder="Describe detalladamente qué vendes o qué servicios ofreces. Entre más detalle, mejor protección legal. Ejemplo: Vendo tacos de pastor, bistec y carnitas. También hago banquetes para eventos y vendo souvenirs como llaveros y playeras."
    rows={4}
    required
  />

  {/* Campo 3: URL (opcional) */}
  <input
    type="url"
    name="url_empresa"
    placeholder="https://tusitio.com o link a Instagram/Facebook (opcional)"
  />

  <button type="submit">
    Analizar mi marca
  </button>
</form>
```

#### Estado de carga:
- Mostrar la mascota ORBIA animada "pensando"
- Texto: "NOMINUS está analizando tu marca..."
- Barra de progreso o spinner elegante
- Tips rotativos mientras carga:
  - "Sabías que México usa el sistema uniclase para marcas?"
  - "El Artículo 173 de la LFPPI prohíbe nombres de personas famosas"
  - "Una buena descripción jurídica protege mejor tu marca"

---

### 3. PÁGINA DE RESULTADOS (/resultados)

#### Transformación de datos (IMPORTANTE):
El webhook devuelve snake_case, convertir a camelCase:
```javascript
const response = await fetch('https://orbia.app.n8n.cloud/webhook/clasificar-marca', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre_marca, que_vende, url_empresa })
});

const data = await response.json();
const rawData = Array.isArray(data) ? data[0] : data;

const result = {
  claseNiza: rawData.clase_niza || 0,
  nombreClase: rawData.nombre_clase || '',
  justificacion: rawData.justificacion || '',
  nivelViabilidad: rawData.nivel_viabilidad || 'MEDIA',
  esNombreFamoso: rawData.es_nombre_famoso || false,
  analisisRiesgo: rawData.analisis_riesgo || '',
  descripcionJuridica: rawData.descripcion_juridica || '',
  palabrasClave: Array.isArray(rawData.palabras_clave) 
    ? rawData.palabras_clave 
    : JSON.parse(rawData.palabras_clave || '[]'),
  sugerenciasNombres: rawData.sugerencias_nombres || [],
  clasesAdicionales: rawData.clases_adicionales || ''
};
```

#### Diseño de resultados (en orden):

**1. Header con nombre de marca:**
```
Resultados para
[NOMBRE DE LA MARCA]
```

**2. Card de Viabilidad (prominente):**
- ALTA: Fondo verde claro, icono ✓, texto "Viabilidad: ALTA"
- MEDIA: Fondo amarillo claro, icono ⚠️, texto "Viabilidad: MEDIA"
- BAJA: Fondo rojo claro, icono ✗, texto "Viabilidad: BAJA"

**3. Alerta de nombre famoso (si aplica):**
- Solo mostrar si `esNombreFamoso === true`
- Card roja con icono de advertencia
- Texto: "⚠️ Este nombre utiliza una persona famosa, lo cual está prohibido por el Artículo 173 de la LFPPI"

**4. Card de Clasificación NIZA:**
```
Clasificación NIZA
[NÚMERO GRANDE] - [Nombre de la clase]
```
- Si hay `clasesAdicionales`, mostrar sub-card amarilla:
  "⚠️ Para protección TOTAL también registrar en: [clases_adicionales]"

**5. Card de Análisis de Riesgo:**
- Título: "Análisis de Riesgo"
- Contenido: `analisisRiesgo`

**6. Card de Descripción Jurídica (expandible/collapsible):**
- Título: "Descripción para IMPI"
- Contenido largo de `descripcionJuridica`
- Botón "Copiar descripción" que copia al portapapeles
- Toast de confirmación al copiar

**7. Tags de Palabras Clave:**
- Título: "Palabras Clave"
- Mostrar `palabrasClave` como chips/tags con estilo pill

**8. Card de Sugerencias (solo si viabilidad NO es ALTA):**
- Título: "Nombres Alternativos Sugeridos"
- Mostrar cada sugerencia como botón clickeable
- Al hacer click, regresar al formulario con ese nombre pre-llenado

**9. Botón principal:**
- "Continuar con el registro →"
- Lleva al siguiente paso (por ahora puede ser placeholder)

**10. Link secundario:**
- "← Clasificar otra marca"
- Regresa al formulario limpio

---

## 🎨 DISEÑO Y ESTILOS

### Paleta de colores:
```css
:root {
  --primary: #1e3a5f;      /* Azul oscuro profesional */
  --secondary: #3b82f6;    /* Azul brillante */
  --accent: #10b981;       /* Verde éxito */
  --warning: #f59e0b;      /* Amarillo advertencia */
  --danger: #ef4444;       /* Rojo error */
  --background: #f8fafc;   /* Gris muy claro */
  --card: #ffffff;         /* Blanco para cards */
  --text: #1e293b;         /* Texto principal */
  --muted: #64748b;        /* Texto secundario */
}
```

### Tipografía:
- Headlines: Inter o Poppins (bold, moderno)
- Body: Inter (clean, legible)
- Tamaños responsivos

### Componentes:
- Cards con sombras suaves y bordes redondeados
- Botones con hover effects y transiciones
- Inputs con focus states claros
- Animaciones sutiles con Framer Motion

### Responsivo:
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 🤖 MASCOTA ORBIA

### Concepto:
- Orbe/esfera brillante con personalidad
- Colores: gradiente azul a verde
- Ojos amigables y expresivos
- Puede tener un "halo" o efecto de brillo

### Apariciones:
1. **Landing:** Grande en el hero, saludando
2. **Formulario:** Pequeña al lado, animando
3. **Loading:** Animación de "pensando" (gira, pulsa)
4. **Resultados:** Celebrando si viabilidad ALTA, preocupada si BAJA
5. **Tips:** Aparece con globo de texto dando consejos

### Implementación:
- Puede ser SVG animado o componente React con CSS animations
- O usar Lottie para animaciones más complejas
- Framer Motion para transiciones

---

## 📁 ESTRUCTURA DE ARCHIVOS SUGERIDA

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Card, Input, etc.)
│   ├── layout/          # Header, Footer, Container
│   ├── landing/         # Hero, Features, Testimonials, Pricing
│   ├── classifier/      # Form, LoadingState, Results
│   └── mascot/          # OrbiaMascot, animations
├── pages/
│   ├── Home.tsx         # Landing page
│   ├── Classify.tsx     # Formulario + resultados
│   └── NotFound.tsx
├── hooks/
│   ├── useClassification.ts  # Hook para llamar al webhook
│   └── useToast.ts
├── lib/
│   ├── api.ts           # Funciones de API
│   └── utils.ts         # Utilidades
├── styles/
│   └── globals.css      # Estilos globales + Tailwind
└── App.tsx              # Router principal
```

---

## ⚡ FUNCIONALIDADES EXTRA

### Toast notifications:
- Éxito: "Descripción copiada al portapapeles"
- Error: "Hubo un error al analizar tu marca"

### Local Storage:
- Guardar último resultado para no perderlo al refrescar

### SEO básico:
- Titles y meta descriptions
- Open Graph tags

### Analytics (placeholder):
- Eventos de: formulario enviado, resultado mostrado, descripción copiada

---

## 🚀 PRIORIDADES DE DESARROLLO

### Fase 1 (HOY):
1. ✅ Landing page completa con todas las secciones
2. ✅ Formulario funcional conectado al webhook
3. ✅ Página de resultados mostrando todos los datos
4. ✅ Diseño responsivo
5. ✅ Mascota básica

### Fase 2 (Después):
- Módulo 2: Análisis de logos
- Módulo 3: Captura de datos personales
- Módulo 4: Generación de PDF para IMPI
- Dashboard de usuario
- Autenticación

---

## 📝 NOTAS IMPORTANTES

1. **El webhook YA funciona** - No necesitas crear backend
2. **La respuesta puede ser un array** - Siempre hacer `Array.isArray(data) ? data[0] : data`
3. **Los campos vienen en snake_case** - Convertir a camelCase en el frontend
4. **`palabras_clave` puede venir como string JSON** - Parsear si es necesario
5. **Siempre mostrar `clases_adicionales`** - Es importante para protección total

---

## 🎬 EMPEZAR AHORA

Crea la aplicación comenzando por:
1. Setup del proyecto React + Tailwind
2. Landing page con Hero y mascota
3. Formulario de clasificación
4. Conexión al webhook
5. Página de resultados

¡La mascota ORBIA debe ser el elemento distintivo de la marca!
