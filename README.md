# Employee Management System

Angular application for employee management with file upload functionality.

## Quick Start

### Prerequisites
- Node.js (16+ recommended)
- npm or yarn

### Installation & Run

```bash
# Clone and navigate to project
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve

# Open browser at http://localhost:4200
```

## Features

- Employee registration form with validation
- Excel/CSV file upload with data validation
- Real-time data display in Material Design table
- Reactive programming with RxJS
- Local storage caching
- Standalone Angular components

## Usage

1. **Fill the form**: Enter name and surname (required, min 2 characters each)
2. **Upload file**: Select Excel (.xlsx/.xls) or CSV file with employee data
3. **Submit**: Click "Registrar Empleado" to save the employee

### File Format Requirements

Your file must contain exactly **one data row** with these columns:
- `seniority`: "junior" or "senior"
- `yearsOfExperience`: positive integer
- `availability`: true or false

#### Example CSV:
```csv
seniority,yearsOfExperience,availability
junior,3,true
```

## Available Scripts

```bash
npm start          # Start dev server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run linter
```

## Project Structure

```
src/
├── app/
│   ├── components/employee-form/     # Main form component
│   ├── models/employee.model.ts      # TypeScript interfaces
│   ├── services/                     # HTTP and file services
│   └── app.config.ts                # App configuration
```

## Technologies

- Angular 17+ (Standalone Components)
- Angular Material
- RxJS
- TypeScript
- SCSS

## Example Files

Check the root directory for example files:
- `example-data.csv` - Valid example
- `example-data.xlsx` - Excel format example
- `example-data-invalid.csv` - For testing validation

---

**Ready to code!** 🚀
