var hd = require('./src/lib/hd-engine-v6.cjs');

// 王献科 - Jovian Archive exact input
var w = hd.calculateBodygraph("1982-01-27", "02:00", "Asia/Shanghai", 36.45, 115.98);
console.log("=== 王献科 (Jovian数据 1982-01-27 02:00) ===");
console.log("类型:", w.type, "(Jovian: Generator)");
console.log("角色:", w.profile, "(Jovian: 5/1)");
console.log("权威:", w.authority, "(Jovian: Sacral)");
console.log("签名:", w.signature, "(Jovian: Satisfaction)");
console.log("非自我:", w.notSelfTheme, "(Jovian: Frustration)");
console.log("定义:", w.definition, "(Jovian: Split)");
console.log("定义中心:", w.definedCenters.join(","));
console.log("闸门:", w.activatedGates.join(","));
console.log("通道:", w.channels.join(","));

// 张晓霞 - Jovian Archive exact input (Oct 20 12:30)
console.log("\n=== 张晓霞 (Jovian数据 1982-10-20 12:30) ===");
var z = hd.calculateBodygraph("1982-10-20", "12:30", "Asia/Shanghai", 30.6, 114.3);
console.log("类型:", z.type, "(Jovian: Generator)");
console.log("角色:", z.profile, "(Jovian: 1/3)");
console.log("权威:", z.authority, "(Jovian: Sacral)");
console.log("签名:", z.signature, "(Jovian: Satisfaction)");
console.log("非自我:", z.notSelfTheme, "(Jovian: Frustration)");
console.log("定义:", z.definition, "(Jovian: Split)");
console.log("定义中心:", z.definedCenters.join(","));
console.log("闸门:", z.activatedGates.join(","));
console.log("通道:", z.channels.join(","));
