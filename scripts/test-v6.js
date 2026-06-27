var hd = require('./src/lib/hd-engine-v6.cjs');
var people = [
  {n:"王献科", ds:"1982-01-27", ts:"02:00", tz:"Asia/Shanghai"},
  {n:"张晓霞", ds:"1982-10-28", ts:"12:00", tz:"Asia/Shanghai"},
  {n:"王一斐", ds:"2010-12-04", ts:"19:00", tz:"Asia/Shanghai"},
  {n:"王一如", ds:"2017-07-23", ts:"10:00", tz:"Asia/Shanghai"},
  {n:"王一然", ds:"2015-06-04", ts:"19:00", tz:"America/Los_Angeles"},
];
people.forEach(function(p) {
  var r = hd.calculateBodygraph(p.ds, p.ts, p.tz, 0, 0);
  console.log(p.n+": "+r.type+" "+r.profile+" "+r.authority+" sig="+r.signature+" ctr=["+r.definedCenters.join(",")+"] ch=["+(r.channels||[]).join(",")+"]");
});
