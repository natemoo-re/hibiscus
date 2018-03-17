console.log('Copy optimized svg files to dist/ionicons/svg');

var fs = require('fs-extra');
var path = require('path');

var optimizedSvgsDir = path.join(__dirname, '..', 'dist', 'collection', 'font', 'svg');
var componentSvgDir = path.join(__dirname, '..', 'dist', 'hibiscus-text', 'svg');

fs.emptyDirSync(componentSvgDir);

fs.copy(optimizedSvgsDir, componentSvgDir);
