'use client';

import React from 'react';

interface BodygraphSVGProps {
  definedCenters: string[];
  activatedGates: number[];
  channels: string[];
  centerDefinition: Record<string, boolean>;
}

// 人体图9个中心的位置和形状
const CENTER_POSITIONS: Record<string, {x:number, y:number, shape:string, w?:number, h?:number, r?:number}> = {
  'Head':        {x:200, y:15,  shape:'triangle-down', w:60},
  'Ajna':        {x:200, y:75,  shape:'diamond', w:60, h:40},
  'Throat':      {x:200, y:145, shape:'triangle', w:80},
  'G':           {x:200, y:215, shape:'diamond', w:50, h:35},
  'Ego':         {x:285, y:235, shape:'square', w:30},
  'Sacral':      {x:200, y:290, shape:'square', w:55},
  'Solar Plexus':{x:270, y:310, shape:'triangle', w:40},
  'Spleen':      {x:115, y:280, shape:'triangle', w:40},
  'Root':        {x:200, y:370, shape:'square', w:50},
};

// 闸门位置（相对于所属中心）
const GATE_POSITIONS: Record<number, {center:string, dx:number, dy:number}> = {
  1:{center:'Head',dx:0,dy:-25},2:{center:'Head',dx:0,dy:25},
  11:{center:'Ajna',dx:-20,dy:-15},24:{center:'Ajna',dx:20,dy:-15},61:{center:'Ajna',dx:-20,dy:15},62:{center:'Ajna',dx:20,dy:15},
  3:{center:'Throat',dx:-30,dy:-20},7:{center:'Throat',dx:30,dy:-20},10:{center:'Throat',dx:-30,dy:0},20:{center:'Throat',dx:30,dy:0},
  23:{center:'Throat',dx:-30,dy:20},31:{center:'Throat',dx:30,dy:20},
  13:{center:'G',dx:0,dy:-15},33:{center:'G',dx:0,dy:15},
  21:{center:'Ego',dx:0,dy:-12},26:{center:'Ego',dx:0,dy:12},40:{center:'Ego',dx:0,dy:-12},45:{center:'Ego',dx:0,dy:12},
  5:{center:'Sacral',dx:-20,dy:-15},9:{center:'Sacral',dx:20,dy:-15},14:{center:'Sacral',dx:-20,dy:15},29:{center:'Sacral',dx:20,dy:15},
  34:{center:'Sacral',dx:-20,dy:-15},42:{center:'Sacral',dx:20,dy:-15},59:{center:'Sacral',dx:-20,dy:15},6:{center:'Sacral',dx:20,dy:15},
  27:{center:'Sacral',dx:0,dy:-15},28:{center:'Sacral',dx:0,dy:15},
  12:{center:'Solar Plexus',dx:0,dy:-12},22:{center:'Solar Plexus',dx:0,dy:12},30:{center:'Solar Plexus',dx:0,dy:-12},36:{center:'Solar Plexus',dx:0,dy:12},
  35:{center:'Solar Plexus',dx:0,dy:-12},37:{center:'Solar Plexus',dx:0,dy:12},39:{center:'Solar Plexus',dx:0,dy:-12},49:{center:'Solar Plexus',dx:0,dy:12},
  32:{center:'Spleen',dx:-12,dy:-15},44:{center:'Spleen',dx:12,dy:-15},48:{center:'Spleen',dx:-12,dy:15},57:{center:'Spleen',dx:12,dy:15},
  50:{center:'Spleen',dx:0,dy:0},
  41:{center:'Root',dx:-20,dy:-15},52:{center:'Root',dx:20,dy:-15},54:{center:'Root',dx:-20,dy:15},58:{center:'Root',dx:20,dy:15},
  19:{center:'Root',dx:-20,dy:-15},38:{center:'Root',dx:20,dy:-15},53:{center:'Root',dx:-20,dy:15},60:{center:'Root',dx:20,dy:15},
};

// 通道路径（连接两个中心）
const CHANNEL_PATHS: Record<string, [string,string]> = {
  '1-8':['G','Throat'],'2-14':['G','Sacral'],'3-60':['Sacral','Root'],
  '4-63':['Root','Ajna'],'5-15':['Sacral','G'],'6-59':['Sacral','Sacral'],
  '7-31':['G','Throat'],'9-52':['Root','Root'],'10-20':['Sacral','Throat'],
  '10-34':['Sacral','Sacral'],'11-56':['Ajna','Throat'],'12-22':['Throat','Solar Plexus'],
  '13-33':['G','Throat'],'16-48':['Throat','Spleen'],'17-62':['Ajna','Throat'],
  '18-58':['Spleen','Root'],'19-49':['Solar Plexus','Solar Plexus'],
  '20-34':['Throat','Sacral'],'21-45':['Ego','Throat'],'23-43':['Throat','Ajna'],
  '24-61':['Ajna','Head'],'25-51':['G','Ego'],'26-44':['Ego','Spleen'],
  '27-50':['Sacral','Ego'],'28-38':['Spleen','Root'],'29-46':['Sacral','Sacral'],
  '30-41':['Solar Plexus','Root'],'32-54':['Spleen','Root'],'35-36':['Throat','Solar Plexus'],
  '37-40':['Solar Plexus','Ego'],'39-55':['Root','Solar Plexus'],
  '42-53':['Sacral','Root'],'47-64':['Ajna','Ajna'],'57-34':['Spleen','Sacral'],
  '59-6':['Sacral','Sacral'],
};

function getCenterCenter(center: string): {x:number, y:number} {
  const p = CENTER_POSITIONS[center];
  if (!p) return {x:200, y:200};
  return {x: p.x, y: p.y + (p.h || p.w || 50)/2};
}

function renderShape(ctx: {x:number, y:number, shape:string, w?:number, h?:number, r?:number}, defined: boolean, gates: number[], activatedGates: number[]) {
  const w = ctx.w || 50;
  const h = ctx.h || w;
  const r = ctx.r || 5;
  const fill = defined ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)';
  const stroke = defined ? '#c9a84c' : 'rgba(255,255,255,0.15)';
  const sw = defined ? 2 : 1;

  let d = '';
  if (ctx.shape === 'triangle') {
    d = `M${ctx.x},${ctx.y + h} L${ctx.x - w/2},${ctx.y} L${ctx.x + w/2},${ctx.y} Z`;
  } else if (ctx.shape === 'triangle-down') {
    d = `M${ctx.x},${ctx.y} L${ctx.x - w/2},${ctx.y + h} L${ctx.x + w/2},${ctx.y + h} Z`;
  } else if (ctx.shape === 'diamond') {
    d = `M${ctx.x},${ctx.y} L${ctx.x + w/2},${ctx.y + h/2} L${ctx.x},${ctx.y + h} L${ctx.x - w/2},${ctx.y + h/2} Z`;
  } else {
    d = `M${ctx.x - w/2},${ctx.y} L${ctx.x + w/2},${ctx.y} L${ctx.x + w/2},${ctx.y + h} L${ctx.x - w/2},${ctx.y + h} Z`;
  }
  return <path key={ctx.x+','+ctx.y} d={d} fill={fill} stroke={stroke} strokeWidth={sw} />;
}

export default function BodygraphSVG({ definedCenters, activatedGates, channels, centerDefinition }: BodygraphSVGProps) {
  const W = 400, H = 430;
  const gateSet = new Set(activatedGates);
  const channelSet = new Set(channels);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto" style={{background:'transparent'}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* 背景说明 */}
      <text x={W/2} y={H-8} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9">● 定义中心  ○ 开放中心</text>

      {/* 未激活通道（灰色虚线）*/}
      {Object.entries(CHANNEL_PATHS).map(([key, [c1, c2]]) => {
        if (channelSet.has(key)) return null;
        const p1 = getCenterCenter(c1), p2 = getCenterCenter(c2);
        return <line key={'ch-'+key} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />;
      })}

      {/* 激活通道（金色实线）*/}
      {channels.map(key => {
        const centers = CHANNEL_PATHS[key];
        if (!centers) return null;
        const p1 = getCenterCenter(centers[0]), p2 = getCenterCenter(centers[1]);
        return <line key={'ch-active-'+key} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#c9a84c" strokeWidth="2.5" filter="url(#glow)" />;
      })}

      {/* 能量中心 */}
      {Object.entries(CENTER_POSITIONS).map(([name, pos]) => {
        const defined = centerDefinition[name] || false;
        const centerActivatedGates = Object.entries(GATE_POSITIONS).filter(([,gp]) => gp.center === name).map(([g]) => parseInt(g));
        return renderShape(pos, defined, centerActivatedGates, activatedGates);
      })}

      {/* 闸门编号 */}
      {activatedGates.map(g => {
        const gp = GATE_POSITIONS[g];
        if (!gp) return null;
        const cp = CENTER_POSITIONS[gp.center];
        if (!cp) return null;
        const x = cp.x + (gp.dx || 0);
        const y = cp.y + (gp.dy || 0) + (cp.h || cp.w || 50)/2;
        return <text key={'g'+g} x={x} y={y} textAnchor="middle" fill="#c9a84c" fontSize="8" fontWeight="bold">{g}</text>;
      })}

      {/* 中心名称 */}
      {Object.entries(CENTER_POSITIONS).map(([name, pos]) => {
        const defined = centerDefinition[name] || false;
        return <text key={'lbl-'+name} x={pos.x} y={pos.y + (pos.h || pos.w || 50)/2 + 3} textAnchor="middle" fill={defined ? '#c9a84c' : 'rgba(255,255,255,0.35)'} fontSize="9" fontWeight={defined ? 'bold' : 'normal'}>{name}</text>;
      })}
    </svg>
  );
}
