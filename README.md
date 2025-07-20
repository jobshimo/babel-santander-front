# Sistema de Gestión de Candidatos

Aplicación Angular para gestión de candidatos con funcionalidad de carga de archivos.

## Inicio Rápido

### Prerrequisitos
- Node.js (16+ recomendado)
- npm o yarn

### Instalación y Ejecución

```bash
# Clonar y navegar al proyecto
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
# o
ng serve

# Abrir navegador en http://localhost:4200
```

## Features

- Formulario de registro de candidatos con validación
- Carga de archivos Excel/CSV con validación de datos
- Visualización de datos en tiempo real con tabla de Material Design
- Programación reactiva con RxJS
- Caché de almacenamiento local
- Componentes standalone de Angular

## Usage

1. **Llenar formulario**: Ingresar nombre y apellido (requeridos, mín 2 caracteres cada uno)
2. **Subir archivo**: Seleccionar archivo Excel (.xlsx/.xls) o CSV con datos del candidato
3. **Enviar**: Hacer clic en "Registrar Candidato" para guardar el candidato

### Requisitos del formato de archivo

Tu archivo debe contener exactamente **una fila de datos** con estas columnas:
- `seniority`: "junior" o "senior"
- `yearsOfExperience`: número entero positivo
- `availability`: true o false

#### Ejemplo CSV:
```csv
seniority,yearsOfExperience,availability
junior,3,true
```

## Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm test           # Ejecutar tests
npm run lint       # Ejecutar linter
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/candidate-form/     # Componente principal del formulario
│   ├── models/candidate.model.ts      # Interfaces de TypeScript
│   ├── services/                     # Servicios HTTP y de archivos
│   └── app.config.ts                # Configuración de la aplicación
```

## Tecnologías

- Angular 17+ (Componentes Standalone)
- Angular Material
- RxJS
- TypeScript
- SCSS

---

**¡Listo para programar!** 🚀
