export const translations = {
  es: {
    "app": {
      "title": "Sistema de Gestión de Candidatos",
      "language": "Idioma"
    },
    "candidateForm": {
      "title": "Registro de Candidato",
      "name": "Nombre",
      "surname": "Apellido",
      "seniority": "Seniority",
      "yearsOfExperience": "Años de experiencia",
      "availability": "Disponibilidad",
      "file": "Archivo Excel/CSV",
      "selectFile": "Seleccionar archivo",
      "noFileSelected": "No se ha seleccionado archivo",
      "submit": "Registrar Candidato",
      "refresh": "Actualizar datos",
      "registeredCandidates": "Candidatos Registrados",
      "loadingCandidates": "Cargando candidatos",
      "fileProcessedCorrectly": "Archivo procesado correctamente",
      "yes": "Sí",
      "no": "No",
      "fileFormatHelp": "Ayuda con formato de archivo",
      "viewInstructions": "Ver instrucciones",
      "fileInstructions": "El archivo debe contener exactamente una fila de datos con estas columnas:",
      "integerNumber": "número entero",
      "csvExample": "Ejemplo CSV",
      "completeAllFields": "Complete todos los campos obligatorios",
      "selectValidFile": "Seleccione un archivo válido",
      "errors": {
        "nameRequired": "El nombre es requerido",
        "nameMinlength": "El nombre debe tener al menos 2 caracteres",
        "surnameRequired": "El apellido es requerido",
        "surnameMinlength": "El apellido debe tener al menos 2 caracteres",
        "fileRequired": "Debe seleccionar un archivo",
        "fileInvalidFormat": "Formato de archivo inválido. Solo se permiten archivos .xlsx y .csv",
        "fileEmpty": "El archivo está vacío",
        "fileInvalidColumns": "El archivo debe contener exactamente 3 columnas: seniority, yearsOfExperience, availability",
        "fileInvalidSeniority": "El campo seniority debe ser \"junior\" o \"senior\"",
        "fileInvalidExperience": "El campo yearsOfExperience debe ser un número positivo",
        "fileInvalidAvailability": "El campo availability debe ser \"true\" o \"false\"",
        "fileReadError": "Error al leer el archivo",
        "fileInvalidRows": "El archivo debe contener exactamente una fila de datos (puede incluir una fila de encabezado)",
        "fileColumnMismatch": "El número de columnas no coincide"
      },
      "placeholders": {
        "enterName": "Ingrese el nombre",
        "enterSurname": "Ingrese el apellido"
      }
    },
    "status": {
      "noData": "No hay candidatos registrados",
      "hasData": "{{count}} candidato(s) registrado(s)",
      "loading": "Cargando",
      "error": "Error al cargar los datos",
      "serverReconnected": "✅ Servidor reconectado - Datos actualizados",
      "cachedDataMessage": "📂 Datos de respaldo",
      "noDataAndServerDown": "❌ No hay datos disponibles y el servidor no responde",
      "unknown": "desconocida"
    },
    "success": {
      "candidateRegistered": "Candidato registrado exitosamente"
    },
    "languages": {
      "es": "Español",
      "en": "English"
    }
  },
  en: {
    "app": {
      "title": "Candidate Management System",
      "language": "Language"
    },
    "candidateForm": {
      "title": "Candidate Registration",
      "name": "Name",
      "surname": "Surname",
      "seniority": "Seniority",
      "yearsOfExperience": "Years of experience",
      "availability": "Availability",
      "file": "Excel/CSV File",
      "selectFile": "Select file",
      "noFileSelected": "No file selected",
      "submit": "Register Candidate",
      "refresh": "Refresh data",
      "registeredCandidates": "Registered Candidates",
      "loadingCandidates": "Loading candidates",
      "fileProcessedCorrectly": "File processed correctly",
      "yes": "Yes",
      "no": "No",
      "fileFormatHelp": "File format help",
      "viewInstructions": "View instructions",
      "fileInstructions": "The file must contain exactly one data row with these columns:",
      "integerNumber": "integer number",
      "csvExample": "CSV Example",
      "completeAllFields": "Complete all required fields",
      "selectValidFile": "Select a valid file",
      "errors": {
        "nameRequired": "Name is required",
        "nameMinlength": "Name must be at least 2 characters long",
        "surnameRequired": "Surname is required",
        "surnameMinlength": "Surname must be at least 2 characters long",
        "fileRequired": "You must select a file",
        "fileInvalidFormat": "Invalid file format. Only .xlsx and .csv files are allowed",
        "fileEmpty": "File is empty",
        "fileInvalidColumns": "File must contain exactly 3 columns: seniority, yearsOfExperience, availability",
        "fileInvalidSeniority": "Seniority field must be \"junior\" or \"senior\"",
        "fileInvalidExperience": "Years of experience field must be a positive number",
        "fileInvalidAvailability": "Availability field must be \"true\" or \"false\"",
        "fileReadError": "Error reading file",
        "fileInvalidRows": "File must contain exactly one data row (may include a header row)",
        "fileColumnMismatch": "Number of columns doesn't match"
      },
      "placeholders": {
        "enterName": "Enter name",
        "enterSurname": "Enter surname"
      }
    },
    "status": {
      "noData": "No candidates registered",
      "hasData": "{{count}} candidate(s) registered",
      "loading": "Loading",
      "error": "Error loading data",
      "serverReconnected": "✅ Server reconnected - Data updated",
      "cachedDataMessage": "📂 Backup data",
      "noDataAndServerDown": "❌ No data available and server is not responding",
      "unknown": "unknown"
    },
    "success": {
      "candidateRegistered": "Candidate registered successfully"
    },
    "languages": {
      "es": "Español",
      "en": "English"
    }
  }
};
