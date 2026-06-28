'use client';

import React from 'react';

interface BodygraphSVGProps {
  definedCenters: string[];
  activatedGates: number[];
  channels: string[];
  centerDefinition: Record<string, boolean>;
}

// 9中心位置（Ra Uru Hu标准布局）
const C = {
  'Head':        {x:200, y:15,  shape:'triangle-down', w:60, h:35},
  'Ajna':        {x:200, y:70,  shape:'diamond', w:60, h:40},
  'Throat':      {x:200, y:135, shape:'triangle', w:80, h:40},
  'G':           {x:200, y:200, shape:'diamond', w:50, h:35},
  'Ego':         {x:285, y:225, shape:'square', w:30, h:25},
  'Sacral':      {x:200, y:275, shape:'square', w:55, h:40},
  'Solar Plexus':{x:270, y:310, shape:'triangle', w:40, h:30},
  'Spleen':      {x:115, y:270, shape:'triangle', w:40, h:30},
  'Root':        {x:200, y:365, shape:'square', w:50, h:40},
};

// 闸门→中心映射（区分的科学标准）
const GATE_CENTER: Record<number, string> = {
  61:'Head',63:'Head',64:'Head',
  11:'Ajna',17:'Ajna',24:'Ajna',43:'Ajna',47:'Ajna',
  8:'Throat',12:'Throat',16:'Throat',20:'Throat',
  23:'Throat',31:'Throat',33:'Throat',35:'Throat',45:'Throat',56:'Throat',62:'Throat',
  1:'G',2:'G',7:'G',10:'G',13:'G',15:'G',25:'G',46:'G',
  21:'Ego',26:'Ego',40:'Ego',51:'Ego',
  3:'Sacral',4:'Sacral',5:'Sacral',6:'Sacral',9:'Sacral',14:'Sacral',
  27:'Sacral',29:'Sacral',34:'Sacral',42:'Sacral',59:'Sacral',
  19:'Solar Plexus',22:'Solar Plexus',30:'Solar Plexus',36:'Solar Plexus',
  37:'Solar Plexus',49:'Solar Plexus',55:'Solar Plexus',
  18:'Spleen',28:'Spleen',32:'Spleen',44:'Spleen',48:'Spleen',50:'Spleen',57:'Spleen',
  39:'Root',41:'Root',52:'Root',53:'Root',54:'Root',58:'Root',60:'Root',
};

// 闸门位置（相对于所属中心）
const GATE_POS: Record<number, {dx:number, dy:number}> = {
  61:{dx:0,dy:-12},63:{dx:0,dy:12},64:{dx:0,dy:0},
  11:{dx:-20,dy:-12},17:{dx:20,dy:-12},24:{dx:-20,dy:12},43:{dx:20,dy:12},47:{dx:0,dy:0},
  8:{dx:-30,dy:-15},12:{dx:30,dy:-15},16:{dx:-30,dy:0},20:{dx:30,dy:0},
  23:{dx:-30,dy:15},31:{dx:30,dy:15},33:{dx:0,dy:-15},35:{dx:0,dy:15},45:{dx:0,dy:0},56:{dx:0,dy:0},62:{dx:0,dy:0},
  1:{dx:-12,dy:-12},2:{dx:12,dy:-12},7:{dx:-12,dy:12},10:{dx:12,dy:12},
  13:{dx:0,dy:-12},15:{dx:0,dy:12},25:{dx:0,dy:0},46:{dx:0,dy:0},
  21:{dx:0,dy:-12},26:{dx:0,dy:12},40:{dx:0,dy:0},51:{dx:0,dy:0},
  3:{dx:-20,dy:-15},4:{dx:20,dy:-15},5:{dx:-20,dy:0},6:{dx:20,dy:0},
  9:{dx:-20,dy:15},14:{dx:20,dy:15},27:{dx:0,dy:-15},29:{dx:0,dy:15},
  34:{dx:0,dy:0},42:{dx:0,dy:0},59:{dx:0,dy:0},
  19:{dx:-12,dy:-10},22:{dx:12,dy:-10},30:{dx:-12,dy:10},36:{dx:12,dy:10},
  37:{dx:0,dy:-10},49:{dx:0,dy:10},55:{dx:0,dy:0},
  18:{dx:-12,dy:-10},28:{dx:12,dy:-10},32:{dx:-12,dy:10},44:{dx:12,dy:10},
  48:{dx:0,dy:-10},50:{dx:0,dy:10},57:{dx:0,dy:0},
  39:{dx:-15,dy:-15},41:{dx:15,dy:-15},52:{dx:-15,dy:0},53:{dx:15,dy:0},
  54:{dx:-15,dy:15},58:{dx:15,dy:15},60:{dx:0,dy:0},
};

// 通道→两端中心（36标准通道）
const CH: Record<string, [string,string]> = {
  '1-8':['G','Throat'],'2-14':['G','Sacral'],'3-60':['Sacral','Root'],
  '4-63':['Sacral','Head'],'5-15':['Sacral','G'],'6-59':['Sacral','Solar Plexus'],
  '7-31':['G','Throat'],'9-52':['Sacral','Root'],'10-20':['G','Throat'],
  '10-34':['G','Sacral'],'11-56':['Ajna','Throat'],'12-22':['Throat','Solar Plexus'],
  '13-33':['G','Throat'],'16-48':['Throat','Spleen'],'17-62':['Ajna','Throat'],
  '18-58':['Spleen','Root'],'19-49':['Root','Solar Plexus'],
  '20-34':['Throat','Sacral'],'21-45':['Ego','Throat'],'23-43':['Throat','Ajna'],
  '24-61':['Ajna','Head'],'25-51':['G','Ego'],'26-44':['Ego','Spleen'],
  '27-50':['Sacral','Spleen'],'28-38':['Spleen','Root'],'29-46':['Sacral','G'],
  '30-41':['Solar Plexus','Root'],'32-54':['Spleen','Root'],'35-36':['Throat','Solar Plexus'],
  '37-40':['Solar Plexus','Ego'],'39-55':['Root','Solar Plexus'],
  '42-53':['Sacral','Root'],'47-64':['Ajna','Head'],'57-34':['Spleen','Sacral'],
  '59-6':['Sacral','Solar Plexus'],
};

function cx(p: {x:number,y:number,shape:string,w?:number,h?:number}): {x:number,y:number} {
  const h = p.h || p.w || 40;
  return {x:p.x, y:p.y + h/2};
}

function renderShape(p: {x:number,y:number,shape:string,w?:number,h?:number}, def: boolean) {
  const w = p.w||40, h = p.h||w;
  const fill = def ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.03)';
  const str = def ? '#c9a84c' : 'rgba(255,255,255,0.12)';
  const sw = def ? 2.5 : 1;
  let d='';
  if (p.shape==='triangle') d = `M${p.x},${p.y+h} L${p.x-w/2},${p.y} L${p.x+w/2},${p.y} Z`;
  else if (p.shape==='triangle-down') d = `M${p.x},${p.y} L${p.x-w/2},${p.y+h} L${p.x+w/2},${p.y+h} Z`;
  else if (p.shape==='diamond') d = `M${p.x},${p.y} L${p.x+w/2},${p.y+h/2} L${p.x},${p.y+h} L${p.x-w/2},${p.y+h/2} Z`;
  else d = `M${p.x-w/2},${p.y} L${p.x+w/2},${p.y} L${p.x+w/2},${p.y+h} L${p.x-w/2},${p.y+h} Z`;
  return <path key={p.x+','+p.y} d={d} fill={fill} stroke={str} strokeWidth={sw} strokeLinejoin="round" />;
}

export default function BodygraphSVG({ definedCenters, activatedGates, channels, centerDefinition }: BodygraphSVGProps) {
  const W=400, H=430;
  const gateSet = new Set(activatedGates);
  const chSet = new Set(channels);
  const defSet = new Set(definedCenters);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto" style={{background:'transparent'}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(201,168,76,0.06)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>

      <circle cx={W/2} cy={H/2} r={180} fill="url(#bgGrad)"/>
      <text x={W/2} y={H-8} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8">● 定义中心  ○ 开放中心</text>

      {/* 未激活通道 */}
      {Object.entries(CH).map(([k,[c1,c2]]) => {
        if (chSet.has(k)) return null;
        const p1=cx(C[c1]), p2=cx(C[c2]);
        return <line key={'ch-'+k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3" />;
      })}

      {/* 激活通道 */}
      {channels.map(k => {
        const ends = CH[k];
        if (!ends) return null;
        const p1=cx(C[ends[0]]), p2=cx(C[ends[1]]);
        return <line key={'a-'+k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#c9a84c" strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" />;
      })}

      {/* 能量中心形状 */}
      {Object.entries(C).map(([n,p]) => renderShape(p, defSet.has(n)))}

      {/* 激活闸门编号 */}
      {activatedGates.map(g => {
        const ct = GATE_CENTER[g];
        if (!ct) return null;
        const cp = C[ct], gp = GATE_POS[g];
        if (!cp || !gp) return null;
        return <text key={'g'+g} x={cp.x+gp.dx} y={cp.y+(cp.h||40)/2+gp.dy} textAnchor="middle" fill="#c9a84c" fontSize="8" fontWeight="bold" fontFamily="'Courier New',monospace">{g}</text>;
      })}

      {/* 中心名称（中文） */}
      const NAMES: Record<string,string> = {
        Head:'顶轮·灵感',Ajna:'眉心轮·思考',Throat:'喉咙·表达',
        G:'G中心·方向',Ego:'意志力·自我',Sacral:'荐骨·生命力',
        'Solar Plexus':'情绪·觉知',Spleen:'脾脏·直觉',Root:'根轮·压力'
      };
      {Object.entries(C).map(([n,p]) => {
        const d = defSet.has(n);
        return <text key={'lb-'+n} x={p.x} y={p.y+(p.h||40)/2+3} textAnchor="middle" fill={d?'#c9a84c':'rgba(255,255,255,0.3)'} fontSize="8" fontWeight={d?'bold':'normal'}>{NAMES[n]||n}</text>;
      })}
    </svg>
  );
}
