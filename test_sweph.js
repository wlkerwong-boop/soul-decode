// Test sweph basic functionality
const sw = require('sweph');
console.log('sweph loaded');
console.log('Available keys starting with SE:', Object.keys(sw).filter(k => k.startsWith('SE')).join(', '));
console.log('Has swe_set_ephe_path:', typeof sw.swe_set_ephe_path);
console.log('Has swe_calc_ut:', typeof sw.swe_calc_ut);
console.log('Has swe_julday:', typeof sw.swe_julday);
console.log('SEFLG_SWIEPH:', sw.SEFLG_SWIEPH);
console.log('SEFLG_MOSEPH:', sw.SEFLG_MOSEPH);
console.log('SEFLG_JPLEPH:', sw.SEFLG_JPLEPH);
console.log('SE_DE_NUMBER:', sw.SE_DE_NUMBER);
