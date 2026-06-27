// Check sweph constants
const sw = require('sweph');
const c = sw.constants;
console.log('Constants keys:', Object.keys(c).slice(0, 50));
console.log('SEFLG_SWIEPH:', c.SEFLG_SWIEPH);
console.log('SEFLG_MOSEPH:', c.SEFLG_MOSEPH);
console.log('SEFLG_JPLEPH:', c.SEFLG_JPLEPH);
console.log('SE_SUN:', c.SE_SUN);
console.log('SE_MOON:', c.SE_MOON);
console.log('SE_DE_NUMBER:', c.SE_DE_NUMBER);
console.log('SE_GREG_CAL:', c.SE_GREG_CAL);
console.log('calc_ut signature:', sw.calc_ut.toString().substring(0, 200));
