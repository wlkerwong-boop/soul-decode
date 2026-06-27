var hd = require('./src/lib/hd-engine-v6.cjs');

// Jovian Archive cross-validation data
var cases = [
  {n:"ningbobo", y:1968, m:9, d:18, h:16, mi:30, tz:"Europe/Paris", jovian:"Generator 4/6 SolarPlexus"},
  {n:"shiduoduo", y:2002, m:7, d:5, h:8, mi:0, tz:"Australia/Sydney", jovian:"Manifestor 4/6 Splenic"},
  {n:"litete", y:1995, m:11, d:10, h:23, mi:20, tz:"Asia/Tokyo", jovian:"Manifesting Generator 5/1 SolarPlexus"},
  {n:"linxixi", y:1978, m:3, d:22, h:14, mi:45, tz:"Europe/London", jovian:"Generator 4/6 Sacral"},
  {n:"wanghaha", y:1985, m:8, d:15, h:6, mi:30, tz:"America/New_York", jovian:"Manifesting Generator 4/1 SolarPlexus"},
];

cases.forEach(function(c) {
  var ds = c.y+"-"+String(c.m).padStart(2,"0")+"-"+String(c.d).padStart(2,"0");
  var ts = String(c.h).padStart(2,"0")+":"+String(c.mi).padStart(2,"0");
  var r = hd.calculateBodygraph(ds, ts, c.tz, 0, 0);
  var match = r.type+" "+r.profile+" "+r.authority.slice(0,15);
  var jovian = c.jovian;
  var ok = (match === jovian || match.indexOf(jovian.split(" ")[0]) >= 0) ? "✅" : "❌";
  console.log(c.n+": v6="+match);
  console.log("      Jovian="+jovian+" "+ok);
  console.log("      ctr=["+r.definedCenters.join(",")+"] ch=["+(r.channels||[]).join(",")+"]");
});
