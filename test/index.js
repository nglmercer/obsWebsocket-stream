const fs = require('fs');
const path = require('path');

// Ruta de la carpeta donde se encuentran los archivos SVG
const svgDirectory = path.join(__dirname, './solid');

// Objeto donde se almacenará el nombre y contenido de cada SVG
const svgData = {};

// Leer la carpeta y obtener los archivos SVG
fs.readdir(svgDirectory, (err, files) => {
  if (err) {
    return console.error('Error al leer la carpeta:', err);
  }

  // Filtrar solo los archivos .svg y leer su contenido
  files.forEach(file => {
    if (path.extname(file) === '.svg') {
      const filePath = path.join(svgDirectory, file);
      const fileName = path.basename(file, '.svg'); // Nombre del archivo sin extensión

      // Leer el contenido del archivo SVG
      const content = fs.readFileSync(filePath, 'utf-8');
      svgData[fileName] = content; // Guardar el nombre y contenido en el objeto
    }
  });

  // Guardar el objeto svgData en un archivo JSON
  const outputPath = path.join(__dirname, 'svgs.json');
  fs.writeFileSync(outputPath, JSON.stringify(svgData, null, 2), 'utf-8');
  console.log('Archivo svgs.json creado con éxito:', svgData);
});
