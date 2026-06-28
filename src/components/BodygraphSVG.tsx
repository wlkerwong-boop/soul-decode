'use client';
import React from 'react';

interface BodygraphSVGProps {
  definedCenters: string[];
  activatedGates: number[];
  channels: string[];
  centerDefinition: Record<string, boolean>;
}

const C: Record<string, {x:number,y:number,shape:string,w:number,h:number}> = {
  'Head':        {x:200,y:15, shape:'triangle-down', w:60, h:35},
  'Ajna':        {x:200,y:70, shape:'diamond', w:60, h:40},
  'Throat':      {x:200,y:135, shape:'triangle', w:80, h:40},
  'G':           {x:200,y:200, shape:'diamond', w:50, h:35},
  'Ego':         {x:285,y:225, shape:'square', w:30, h:25},
  'Sacral':      {x:200,y:275, shape:'square', w:55, h:40},
  'Solar Plexus':{x:270,y:310, shape:'triangle', w:40, h:30},
  'Spleen':      {x:115,y:270, shape:'triangle', w:40, h:30},
  'Root':        {x:200,y:365, shape:'square', w:50, h:40},
};

const GC: Record<number,string> = {
  61:'Head',63:'Head',64:'Head',
  11:'Ajna',17:'Ajna',24:'Ajna',43:'Ajna',47:'Ajna',
  8:'Throat',12:'Throat',16:'Throat',20:'Throat',23:'Throat',31:'Throat',33:'Throat',35:'Throat',45:'Throat',56:'Throat',62:'Throat',
  1:'G',2:'G',7:'G',10:'G',13:'G',15:'G',25:'G',46:'G',
  21:'Ego',26:'Ego',40:'Ego',51:'Ego',
  3:'Sacral',4:'Sacral',5:'Sacral',6:'Sacral',9:'Sacral',14:'Sacral',27:'Sacral',29:'Sacral',34:'Sacral',42:'Sacral',59:'Sacral',
  19:'Solar Plexus',22:'Solar Plexus',30:'Solar Plexus',36:'Solar Plexus',37:'Solar Plexus',49:'Solar Plexus',55:'Solar Plexus',
  18:'Spleen',28:'Spleen',32:'Spleen',44:'Spleen',48:'Spleen',50:'Spleen',57:'Spleen',
  39:'Root',41:'Root',52:'Root',53:'Root',54:'Root',58:'Root',60:'Root',
};

const CH: Record<string,[string,string]> = {
  '1-8':['G','Throat'],'2-14':['G','Sacral'],'3-60':['Sacral','Root'],'4-63':['Sacral','Head'],
  '5-15':['Sacral','G'],'6-59':['Sacral','Solar Plexus'],'7-31':['G','Throat'],'9-52':['Sacral','Root'],
  '10-20':['G','Throat'],'10-34':['G','Sacral'],'11-56':['Ajna','Throat'],'12-22':['Throat','Solar Plexus'],
  '13-33':['G','Throat'],'16-48':['Throat','Spleen'],'17-62':['Ajna','Throat'],'18-58':['Spleen','Root'],
  '19-49':['Root','Solar Plexus'],'20-34':['Throat','Sacral'],'21-45':['Ego','Throat'],'23-43':['Throat','Ajna'],
  '24-61':['Ajna','Head'],'25-51':['G','Ego'],'26-44':['Ego','Spleen'],'27-50':['Sacral','Spleen'],
  '28-38':['Spleen','Root'],'29-46':['Sacral','G'],'30-41':['Solar Plexus','Root'],'32-54':['Spleen','Root'],
  '35-36':['Throat','Solar Plexus'],'37-40':['Solar Plexus','Ego'],'39-55':['Root','Solar Plexus'],
  '42-53':['Sacral','Root'],'47-64':['Ajna','Head'],'57-34':['Spleen','Sacral'],'59-6':['Sacral','Solar Plexus'],
};

const GP: Record<number,{dx:number,dy:number}> = {
  61:{dx:0,dy:-12},63:{dx:0,dy:12},64:{dx:0,dy:0},
  11:{dx:-20,dy:-12},17:{dx:20,dy:-12},24:{dx:-20,dy:12},43:{dx:20,dy:12},47:{dx:0,dy:0},
  8:{dx:-30,dy:-15},12:{dx:30,dy:-15},16:{dx:-30,dy:0},20:{dx:30,dy:0},
  23:{dx:-30,dy:15},31:{dx:30,dy:15},33:{dx:0,dy:-15},35:{dx:0,dy:15},
  1:{dx:-12,dy:-12},2:{dx:12,dy:-12},7:{dx:-12,dy:12},10:{dx:12,dy:12},
  13:{dx:0,dy:-12},15:{dx:0,dy:12},
  21:{dx:0,dy:-12},26:{dx:0,dy:12},40:{dx:0,dy:0},51:{dx:0,dy:0},
  3:{dx:-20,dy:-15},4:{dx:20,dy:-15},5:{dx:-20,dy:0},6:{dx:20,dy:0},
  9:{dx:-20,dy:15},14:{dx:20,dy:15},27:{dx:0,dy:-15},29:{dx:0,dy:15},
  34:{dx:0,dy:0},42:{dx:0,dy:0},59:{dx:0,dy:0},
  19:{dx:-12,dy:-10},22:{dx:12,dy:-10},30:{dx:-12,dy:10},36:{dx:12,dy:10},
  37:{dx:0,dy:-10},49:{dx:0,dy:10},
  18:{dx:-12,dy:-10},28:{dx:12,dy:-10},32:{dx:-12,dy:10},44:{dx:12,dy:10},
  48:{dx:0,dy:-10},50:{dx:0,dy:10},57:{dx:0,dy:0},
  39:{dx:-15,dy:-15},41:{dx:15,dy:-15},52:{dx:-15,dy:0},53:{dx:15,dy:0},
  54:{dx:-15,dy:15},58:{dx:15,dy:15},60:{dx:0,dy:0},
};

function cc(p: typeof C[string]) { return {x:p.x, y:p.y + p.h/2}; }

function curve(x1:number,y1:number,x2:number,y2:number,act:boolean) {
  const dx=x2-x1, dy=y2-y1;
  const mx=Math.abs(dx)/1.5, my=Math.abs(dy)/3;
  return `M${x1},${y1} C${x1+mx},${y1-my} ${x2-mx},${y2+my} ${x2},${y2}`;
}

function shape(p: typeof C[string], def:boolean) {
  const {x,y,w,h,shape:s}=p;
  const fill=def?'rgba(201,168,76,0.15)':'rgba(255,255,255,0.02)';
  const str=def?'#c9a84c':'rgba(255,255,255,0.1)';
  const sw=def?2:1;
  let d='';
  if (s==='triangle') d=`M${x},${y+h}L${x-w/2},${y}L${x+w/2},${y}Z`;
  else if (s==='triangle-down') d=`M${x},${y}L${x-w/2},${y+h}L${x+w/2},${y+h}Z`;
  else if (s==='diamond') d=`M${x},${y}L${x+w/2},${y+h/2}L${x},${y+h}L${x-w/2},${y+h/2}Z`;
  else d=`M${x-w/2},${y}L${x+w/2},${y}L${x+w/2},${y+h}L${x-w/2},${y+h}Z`;
  return <path key={x+','+y} d={d} fill={fill} stroke={str} strokeWidth={sw} strokeLinejoin="round" opacity={def?1:0.6} />;
}

export default function BodygraphSVG({definedCenters,activatedGates,channels}:BodygraphSVGProps) {
  const W=400,H=430;
  const defSet=new Set(definedCenters), chSet=new Set(channels);
  const N:Record<string,string>={Head:'顶轮·灵感',Ajna:'眉心轮·思考',Throat:'喉咙·表达',G:'G中心·方向',Ego:'意志力·自我',Sacral:'荐骨·生命力','Solar Plexus':'情绪·觉知',Spleen:'脾脏·直觉',Root:'根轮·压力'};

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto">
      <defs>
        <filter id="g"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="bg"><stop offset="0%" stopColor="rgba(201,168,76,0.04)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></radialGradient>
        <radialGradient id="defGrad"><stop offset="0%" stopColor="rgba(201,168,76,0.25)"/><stop offset="100%" stopColor="rgba(201,168,76,0.1)"/></radialGradient>
      </defs>
      <circle cx={W/2} cy={H/2} r={160} fill="url(#bg)"/>
      <text x={W/2} y={H-6} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="7">● 定义中心  ○ 开放中心</text>

      {/* Inactive channels - thin dashed */}
      {Object.entries(CH).map(([k,[c1,c2]])=>chSet.has(k)?null:(<path key={'ic-'+k} d={curve(cc(C[c1]).x,cc(C[c1]).y,cc(C[c2]).x,cc(C[c2]).y,false)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,3" strokeLinecap="round"/>))}

      {/* Active channels - glowing gold curve */}
      {channels.map(k=>{const e=CH[k];if(!e)return null;const p=cc(C[e[0]]),q=cc(C[e[1]]);return<path key={'ac-'+k} d={curve(p.x,p.y,q.x,q.y,true)} fill="none" stroke="#c9a84c" strokeWidth="3" filter="url(#g)" strokeLinecap="round"/>})}
      {channels.map(k=>{const e=CH[k];if(!e)return null;const p=cc(C[e[0]]),q=cc(C[e[1]]);return<path key={'acl-'+k} d={curve(p.x,p.y,q.x,q.y,true)} fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5" strokeLinecap="round"/>})}

      {/* Centers */}
      {Object.entries(C).map(([n,p])=>shape(p,defSet.has(n)))}

      {/* Defined centers inner glow */}
      {Object.entries(C).filter(([n])=>defSet.has(n)).map(([n,p])=>{
        const sx=p.shape,xc=p.x,yc=p.y+p.h/2,ww=p.w-4,hh=p.h-4;
        let dd='';
        if(sx==='diamond')dd=`M${xc},${yc-hh/2}L${xc+ww/2},${yc}L${xc},${yc+hh/2}L${xc-ww/2},${yc}Z`;
        return<path key={'dg-'+n} d={dd||`M${xc-ww/2},${yc-hh/2}h${ww}v${hh}h-${ww}z`} fill="url(#defGrad)" opacity={0.5}/>;
      })}

      {/* Active gate numbers */}
      {activatedGates.map(g=>{const ct=GC[g],cp=C[ct],gp=GP[g];if(!ct||!cp||!gp)return null;return<text key={'g'+g} x={cp.x+gp.dx} y={cp.y+cp.h/2+gp.dy} textAnchor="middle" fill="#d4a84c" fontSize="8" fontWeight="bold" fontFamily="'Noto Sans SC',sans-serif">{g}</text>})}

      {/* Center names */}
      {Object.entries(C).map(([n,p])=>{const d=defSet.has(n);return<text key={'lb-'+n} x={p.x} y={p.y+p.h/2+3} textAnchor="middle" fill={d?'#c9a84c':'rgba(255,255,255,0.25)'} fontSize="7" fontWeight={d?'bold':'normal'} fontFamily="'Noto Sans SC',sans-serif">{N[n]||n}</text>})}
    </svg>
  );
}
