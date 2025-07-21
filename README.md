# Sistema de Gestión de Candidatos

Una aplicación Angular moderna para la gestión de candidatos con funcionalidad avanzada de carga y procesamiento de archivos Excel/CSV.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Servicios](#servicios)
- [Patrones Implementados](#patrones-implementados)
- [Uso de la Aplicación](#uso-de-la-aplicación)

## 🏗️ Arquitectura

Esta aplicación sigue una **arquitectura basada en componentes standalone** con separación clara de responsabilidades:

### Capas de la Aplicación

```
┌─────────────────────────────────────┐
│           PRESENTACIÓN              │
│  (Componentes Angular Standalone)   │
├─────────────────────────────────────┤
│            SERVICIOS                │
│  (Lógica de Negocio + Estado)      │
├─────────────────────────────────────┤
│            MODELOS                  │
│     (Interfaces TypeScript)         │
├─────────────────────────────────────┤
│             DATOS                   │
│  (HTTP Client + Local Storage)      │
└─────────────────────────────────────┘
```

### Principios Arquitectónicos

- **Single Responsibility Principle**: Cada componente y servicio tiene una responsabilidad específica
- **Dependency Injection**: Utiliza la función `inject()` moderna de Angular
- **Reactive Programming**: Uso extensivo de RxJS para manejo de estado reactivo
- **Component-based**: Arquitectura modular con componentes standalone
- **Type Safety**: TypeScript estricto para mayor seguridad

## 🛠️ Tecnologías

### Core Framework
- **Angular 19+** - Framework principal con componentes standalone
- **TypeScript 5.7+** - Superset de JavaScript con tipado estático
- **RxJS 7.8** - Programación reactiva para manejo de estado

### UI y Estilos
- **Angular Material 19+** - Componentes UI seguindo Material Design
- **SCSS** - Preprocesador CSS para estilos avanzados
- **Transloco** - Internacionalización (i18n)

### Procesamiento de Archivos
- **xlsx** - Librería para procesamiento de archivos Excel
- **FileReader API** - API nativa para lectura de archivos

### Testing y Calidad
- **Jest** - Framework de testing
- **ESLint** - Linter para calidad de código
- **Angular Testing Utilities** - Herramientas de testing específicas de Angular

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión 18.0 o superior
- **npm** versión 9.0 o superior (viene con Node.js)
- **Git** para control de versiones

### Verificar Instalación

```bash
node --version  # Debe ser >= 18.0
npm --version   # Debe ser >= 9.0
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd babel-santander-front/frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno (Opcional)

```bash
# Copiar archivo de configuración de ejemplo
cp src/environments/environment.example.ts src/environments/environment.ts

# Editar variables según tu configuración
# API_URL, configuraciones de base de datos, etc.
```

### 4. Iniciar Aplicación en Modo Desarrollo

```bash
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

### 5. Verificar Instalación

1. Abre tu navegador en `http://localhost:4200`
2. Deberías ver la interfaz de gestión de candidatos
3. Intenta cargar un archivo CSV de ejemplo para probar la funcionalidad

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor de desarrollo
npm run build          # Compilar para producción
npm run watch          # Compilar en modo watch

# Testing
npm test               # Ejecutar tests unitarios
npm run test:watch     # Ejecutar tests en modo watch
npm run test:coverage  # Ejecutar tests con reporte de cobertura

# Calidad de Código
npm run lint           # Ejecutar linter (ESLint)
npm run lint:fix       # Ejecutar linter y corregir automáticamente

# Producción
npm run build:prod     # Compilar optimizado para producción
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/                    # Componentes de la aplicación
│   │   ├── candidate-check/           # Verificación de estado de API
│   │   ├── candidate-form/            # Formulario de registro
│   │   ├── candidate-management/      # Contenedor principal
│   │   ├── candidate-table/           # Tabla de candidatos
│   │   └── language-selector/         # Selector de idioma
│   │
│   ├── models/                        # Interfaces y tipos TypeScript
│   │   ├── candidate.model.ts         # Modelos de candidatos
│   │   └── file-parser.model.ts       # Modelos para parseo de archivos
│   │
│   ├── services/                      # Servicios de la aplicación
│   │   ├── candidate.service.ts       # Servicio HTTP para candidatos
│   │   ├── candidate-state.service.ts # Gestión de estado global
│   │   ├── file.service.ts            # Servicio principal de archivos
│   │   ├── csv-parser.service.ts      # Parser específico para CSV
│   │   ├── excel-parser.service.ts    # Parser específico para Excel
│   │   ├── file-parser.factory.ts     # Factory para parsers
│   │   ├── file-parsing.service.ts    # Servicio de UI para archivos
│   │   ├── file-validation.service.ts # Validaciones de archivos
│   │   ├── error-translation.service.ts # Traducción de errores
│   │   ├── language.service.ts        # Gestión de idiomas
│   │   └── notification.service.ts    # Notificaciones UI
│   │
│   ├── testing/                       # Utilidades de testing
│   ├── translations/                  # Archivos de traducción i18n
│   ├── app.component.ts              # Componente raíz
│   ├── app.config.ts                 # Configuración de la aplicación
│   └── app.routes.ts                 # Configuración de rutas
│
├── assets/                           # Recursos estáticos
│   └── i18n/                        # Archivos de traducción
├── environments/                     # Variables de entorno
├── styles.scss                      # Estilos globales
└── main.ts                          # Punto de entrada de la aplicación
```

## 🧩 Componentes Principales

### CandidateManagementComponent
**Responsabilidad**: Componente contenedor principal que orquesta la gestión completa de candidatos.

```typescript
// Funcionalidades:
- Coordinación entre componentes hijos
- Gestión del estado global de la aplicación
- Manejo de notificaciones de estado de API
```

### CandidateFormComponent
**Responsabilidad**: Formulario reactivo para registro de candidatos con carga de archivos.

```typescript
// Características:
- Validación de formularios con Angular Reactive Forms
- Integración con servicio de parsing de archivos
- Feedback visual durante el procesamiento
- Manejo de errores con traducciones
```

### CandidateTableComponent
**Responsabilidad**: Visualización tabular de datos con Angular Material.

```typescript
// Funcionalidades:
- Tabla Material Design responsiva
- Actualización reactiva de datos
- Indicadores de carga
```

### CandidateCheckComponent
**Responsabilidad**: Monitoreo del estado de conectividad con la API.

```typescript
// Características:
- Verificación de estado de API en tiempo real
- Indicadores visuales de conectividad
- Información de caché y última actualización
```

## 🔧 Servicios

### Servicios de Datos
- **CandidateService**: Comunicación HTTP con backend, caché local
- **CandidateStateService**: Gestión de estado reactivo global

### Servicios de Archivos
- **FileService**: API principal para procesamiento de archivos
- **FileParserFactory**: Factory pattern para selección de parsers
- **CsvFileParser**: Parser específico para archivos CSV
- **ExcelFileParser**: Parser específico para archivos Excel
- **FileValidationService**: Validaciones de estructura y contenido

### Servicios de UI
- **FileParsingService**: Coordinación entre parsers y feedback visual
- **NotificationService**: Sistema de notificaciones
- **LanguageService**: Gestión de idiomas e i18n
- **ErrorTranslationService**: Traducción contextual de errores

## 🎯 Patrones Implementados

### Design Patterns
1. **Factory Pattern**: `FileParserFactory` para selección de parsers
2. **Strategy Pattern**: Diferentes estrategias de parsing por tipo de archivo
3. **Observer Pattern**: Uso de RxJS Observables para estado reactivo
4. **Dependency Injection**: Función `inject()` moderna de Angular

### Architectural Patterns
1. **Component-Service Architecture**: Separación clara entre presentación y lógica
2. **Reactive Programming**: RxJS para manejo de estado y eventos asincrónicos
3. **Modular Architecture**: Componentes standalone auto-contenidos

## 💻 Uso de la Aplicación

### 1. Registro de Candidato Manual
1. Completa el formulario con nombre y apellido
2. Los campos son obligatorios con mínimo 2 caracteres
3. Click en "Registrar Candidato"

### 2. Carga de Archivo
1. Selecciona un archivo Excel (.xlsx, .xls) o CSV
2. El archivo debe contener **exactamente una fila de datos**
3. Formato requerido:

#### Estructura de Archivo CSV:
```csv
seniority,yearsOfExperience,availability
junior,5,true
```

#### Estructura de Archivo Excel:
| seniority | yearsOfExperience | availability |
|-----------|-------------------|--------------|
| senior    | 3                 | false        |

### 3. Validaciones Aplicadas
- **seniority**: Debe ser "junior" o "senior"
- **yearsOfExperience**: Número entero positivo
- **availability**: boolean (true/false)

### 4. Estados de la Aplicación
- **Online**: API disponible, datos en tiempo real
- **Offline**: Usando caché local, sincronización pendiente
- **Error**: Problemas de conectividad o validación

## 🔍 Desarrollo y Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Linting y Calidad
```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix
```

### Build de Producción
```bash
# Compilar para producción
npm run build

# Los archivos compilados estarán en dist/
```

---

## 📞 Soporte

Para problemas o preguntas sobre el desarrollo:

1. Revisa la documentación de [Angular](https://angular.io/)
2. Consulta la guía de [Angular Material](https://material.angular.io/)
3. Verifica las [mejores prácticas de RxJS](https://rxjs.dev/)

**¡Happy Coding!** 🚀
