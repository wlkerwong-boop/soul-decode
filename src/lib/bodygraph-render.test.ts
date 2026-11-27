import { describe, expect, it } from 'vitest';
import { humanDesignSvg } from './report-charts';
import { CHANNEL_PAIRS, GATE_CENTER } from './bodygraph-geometry';
import { channelMapSnapshot } from './hd-channels-map';
import { renderBodygraph } from './bodygraph-render';

describe('bodygraph diagram', () => {
  it('matches the project channel and gate-to-center reference data', () => {
    const entries = Object.values(channelMapSnapshot());
    const normalized = (a: number, b: number) => [a, b].sort((x,y) => x-y).join('-');
    expect(new Set(CHANNEL_PAIRS.map(([a,b]) => normalized(a,b)))).toEqual(
      new Set(entries.map(e => normalized(e.gateA, e.gateB)))
    );
    const centers: Record<string, string> = {
      '头脑/Head': 'head', '逻辑/Ajna': 'ajna', '喉咙': 'throat', 'G': 'g',
      '意志力': 'heart', '荐骨': 'sacral', '脾': 'spleen', '情绪': 'solar-plexus', '根部': 'root',
    };
    for (const e of entries) {
      expect(GATE_CENTER[e.gateA]).toBe(centers[e.centerA]);
      expect(GATE_CENTER[e.gateB]).toBe(centers[e.centerB]);
    }
  });
  it('uses the same renderer for the print export and page', () => {
    const facts = { definedCenters: ['Ajna'], activatedGates: [4], channels: [] };
    expect(humanDesignSvg(facts)).toBe(renderBodygraph(facts, true));
  });
  it('shows all 64 gates and 36 distinct channels in their actual centers', () => {
    const svg = humanDesignSvg({ definedCenters: [], activatedGates: [], channels: [] })!;
    expect((svg.match(/data-gate="\d+"/g) || [])).toHaveLength(64);
    expect((svg.match(/data-channel="[\d-]+"/g) || [])).toHaveLength(36);
    expect(svg).toMatch(/data-gate="4" data-center="Ajna"/);
    expect(svg).toMatch(/data-gate="6" data-center="Solar Plexus"/);
    expect(svg).toMatch(/data-gate="19" data-center="Root"/);
  });
  it('marks only each activated gate half, regardless of channel key ordering', () => {
    const one = humanDesignSvg({ definedCenters: [], activatedGates: [63], channels: [] })!;
    expect(one).toMatch(/data-half="63-4"/);
    expect(one).not.toMatch(/data-half="4-63"/);
    const both = humanDesignSvg({ definedCenters: ['Head', 'Ajna'], activatedGates: [63, 4], channels: ['4-63'] })!;
    expect(both).toMatch(/data-half="63-4"/);
    expect(both).toMatch(/data-half="4-63"/);
    expect(both).toMatch(/data-center-shape="Head" data-defined="true"/);
  });
});
