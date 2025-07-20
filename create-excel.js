const XLSX = require('xlsx');

const data = [
  {
    seniority: 'senior',
    yearsOfExperience: 8,
    availability: false
  }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

XLSX.utils.book_append_sheet(wb, ws, 'Employees');

XLSX.writeFile(wb, 'example-data.xlsx');

console.log('Archivo Excel creado: example-data.xlsx');
