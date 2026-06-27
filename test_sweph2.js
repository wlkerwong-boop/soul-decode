// Check sweph exports
const sw = require('sweph');
console.log('Type:', typeof sw);
console.log('Is function:', typeof sw === 'function');
console.log('All keys:', Object.keys(sw));
// Try default import
const sw2 = require('sweph').default || require('sweph');
console.log('Default keys:', Object.keys(sw2).slice(0, 30));
