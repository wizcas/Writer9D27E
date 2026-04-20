const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf8');

// Replace script sections
content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"serve": "http-server \. -p 5500 --cors -c-1",\r?\n\s+"chrome": "start \\"\\" \\"C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome\.exe\\" \\"--remote-debugging-port=9222\\" \\"--user-data-dir=C:\\\\temp\\\\chrome-debug\\" \\"http:\/\/localhost:8000\\"",\r?\n=======\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g, 
  '      "serve": "http-server . -p 5500 --cors -c-1",\n      "chrome": "start \\"\\" \\"C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe\\" \\"--remote-debugging-port=9222\\" \\"--user-data-dir=C:\\\\temp\\\\chrome-debug\\" \\"http://localhost:8000\\"",');

content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"sync": "node tavern_sync\.mjs",\r?\n\s+"bundle": "node scripts\/bundle_release\.mjs"\r?\n=======\r?\n\s+"sync": "node tavern_sync\.mjs"\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"sync": "node tavern_sync\.mjs"\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "sync": "node tavern_sync.mjs",\n      "bundle": "node scripts/bundle_release.mjs"');

content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"@typescript-eslint\/parser": "\^8\.58\.1",\r?\n\s+"autoprefixer": "\^10\.4\.27",\r?\n=======\r?\n\s+"@typescript-eslint\/parser": "\^8\.58\.2",\r?\n\s+"autoprefixer": "\^10\.5\.0",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"@typescript-eslint\/parser": "\^8\.58\.2",\r?\n\s+"autoprefixer": "\^10\.5\.0",\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "@typescript-eslint/parser": "^8.58.2",\n      "autoprefixer": "^10.5.0",');

content = content.replace(/<<<<<<< HEAD\r?\n\s+"html-webpack-plugin": "\^5\.6\.6",\r?\n\s+"javascript-obfuscator": "\^4\.2\.2",\r?\n\s+"mini-css-extract-plugin": "\^2\.10\.2",\r?\n<<<<<<< HEAD\r?\n\s+"postcss": "\^8\.5\.9",\r?\n=======\r?\n\s+"postcss": "\^8\.5\.10",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"html-webpack-plugin": "\^5\.6\.7",\r?\n\s+"javascript-obfuscator": "\^4\.2\.2",\r?\n\s+"mini-css-extract-plugin": "\^2\.10\.2",\r?\n\s+"postcss": "\^8\.5\.10",\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "html-webpack-plugin": "^5.6.7",\n      "javascript-obfuscator": "^4.2.2",\n      "mini-css-extract-plugin": "^2.10.2",\n      "postcss": "^8.5.10",');

content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"prettier": "\^3\.8\.2",\r?\n=======\r?\n\s+"prettier": "\^3\.8\.3",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"prettier": "\^3\.8\.3",\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "prettier": "^3.8.3",');

content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"typescript-eslint": "\^8\.58\.1",\r?\n=======\r?\n\s+"typescript-eslint": "\^8\.58\.2",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"typescript-eslint": "\^8\.58\.2",\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "typescript-eslint": "^8.58.2",');

content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"webpack": "\^5\.106\.1",\r?\n=======\r?\n\s+"webpack": "\^5\.106\.2",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"webpack": "\^5\.106\.2",\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "webpack": "^5.106.2",');

content = content.replace(/<<<<<<< HEAD\r?\n<<<<<<< HEAD\r?\n\s+"gsap": "\^3\.14\.2",\r?\n=======\r?\n\s+"gsap": "\^3\.15\.0",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n\s+"jquery": "\^3\.7\.1",\r?\n\s+"jqueryui": "\^1\.11\.1",\r?\n\s+"json5": "\^2\.2\.3",\r?\n\s+"jsonrepair": "\^3\.13\.3",\r?\n\s+"klona": "\^2\.0\.6",\r?\n\s+"lodash": "\^4\.18\.1",\r?\n\s+"pinia": "\^3\.0\.4",\r?\n<<<<<<< HEAD\r?\n\s+"pixi\.js": "\^8\.17\.1",\r?\n=======\r?\n\s+"pixi\.js": "\^8\.18\.1",\r?\n>>>>>>> 098e1f6e4ff8f2f726c3a97ca746d13033a2c842\r?\n=======\r?\n\s+"gsap": "\^3\.15\.0",\r?\n\s+"jquery": "\^3\.7\.1",\r?\n\s+"jqueryui": "\^1\.11\.1",\r?\n\s+"json5": "\^2\.2\.3",\r?\n\s+"jsonrepair": "\^3\.14\.0",\r?\n\s+"klona": "\^2\.0\.6",\r?\n\s+"lodash": "\^4\.18\.1",\r?\n\s+"pinia": "\^3\.0\.4",\r?\n\s+"pixi\.js": "\^8\.18\.1",\r?\n>>>>>>> 5427fc4312cb5983ca9885b5f500c6082deaadf5/g,
  '      "gsap": "^3.15.0",\n      "jquery": "^3.7.1",\n      "jqueryui": "^1.11.1",\n      "json5": "^2.2.3",\n      "jsonrepair": "^3.14.0",\n      "klona": "^2.0.6",\n      "lodash": "^4.18.1",\n      "pinia": "^3.0.4",\n      "pixi.js": "^8.18.1",');

fs.writeFileSync('package.json', content);