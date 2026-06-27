// Test using @it-healer/human-design-calculator directly with native swisseph
const path = require('path');
const { calculateBodygraph } = require('@it-healer/human-design-calculator/src/bodygraph');

const people = [
  {name:'王献科', date:'1982-01-27', time:'02:00', tz:'Asia/Shanghai', lat:36.7, lon:117.0},
  {name:'张晓霞', date:'1982-10-28', time:'12:00', tz:'Asia/Shanghai', lat:30.6, lon:114.3},
  {name:'王一斐', date:'2010-12-04', time:'19:00', tz:'Asia/Shanghai', lat:23.1, lon:113.3},
  {name:'王一如', date:'2017-07-23', time:'10:00', tz:'Asia/Shanghai', lat:36.7, lon:117.0},
  {name:'王一然', date:'2015-06-04', time:'19:00', tz:'America/Los_Angeles', lat:34.1, lon:-118.2},
];

// Use the swisseph native package's ephe directory
const ephePath = path.resolve(__dirname, 'node_modules', 'swisseph', 'ephe');
console.log('Using ephemeris path:', ephePath);

people.forEach(p => {
  try {
    const result = calculateBodygraph(p.date, p.time, p.tz, p.lat, p.lon, ephePath);
    console.log(`\n=== ${p.name} ===`);
    console.log(`  Type: ${result.type}`);
    console.log(`  Profile: ${result.profile}`);
    console.log(`  Authority: ${result.authority}`);
    console.log(`  Definition: ${result.definition}`);
    console.log(`  Design Date UTC: ${result.designDateUTC}`);
    console.log(`  Channels: ${result.channels.join(', ')}`);
    console.log(`  Activated Gates: ${result.activatedGates.join(', ')}`);
    console.log(`  Defined Centers: ${result.definedCenters.join(', ')}`);
    
    // Compare with expected
    const expected = {
      '王献科': 'Generator 5/1',
      '张晓霞': 'Manifesting Generator 3/5',
      '王一斐': 'Projector 1/4',
      '王一如': 'Generator 1/1',
      '王一然': 'Reflector 3/1',
    }[p.name];
    
    const actual = `${result.type} ${result.profile}`;
    const match = actual === expected ? '✅' : '❌';
    console.log(`  Result: ${actual} ${match} (expected: ${expected})`);
  } catch(e) {
    console.log(`\n=== ${p.name} === ERROR: ${e.message}`);
  }
});
