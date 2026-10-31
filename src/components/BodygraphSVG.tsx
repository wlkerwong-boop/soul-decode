'use client';
import React from 'react';
import { renderBodygraph } from '../lib/bodygraph-render';

interface BodygraphSVGProps {
  definedCenters: string[];
  activatedGates: number[];
  channels: string[];
  centerDefinition: Record<string, boolean>;
  print?: boolean;
}

export default function BodygraphSVG({ definedCenters, activatedGates, channels, print }: BodygraphSVGProps) {
  const svg = renderBodygraph({ definedCenters, activatedGates, channels }, print);
  return <div className="w-full mx-auto chart-atlas-svg" style={{ maxWidth: 480 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
