import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GameSessionRecord } from '../types/history';

interface HistoryD3ChartProps {
  sessions: GameSessionRecord[];
}

export const HistoryD3Chart: React.FC<HistoryD3ChartProps> = ({ sessions }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSession, setHoveredSession] = useState<GameSessionRecord | null>(null);
  const [metric, setMetric] = useState<'totalPoints' | 'comparison'>('totalPoints');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || sessions.length === 0) return;

    const container = containerRef.current;
    const width = Math.max(320, container.clientWidth);
    const height = 260;
    const margin = { top: 25, right: 20, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add subtle horizontal gridlines
    const maxScore = d3.max(sessions, (d) =>
      metric === 'totalPoints' ? d.totalPoints : Math.max(d.team1Score, d.team2Score)
    ) || 300;
    const yMax = Math.ceil((maxScore * 1.15) / 50) * 50;

    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .call((group) => {
        group.select('.domain').remove();
        group.selectAll('line').attr('stroke', '#334155').attr('stroke-dasharray', '3,3');
      });

    if (metric === 'totalPoints') {
      const xScale = d3
        .scaleBand()
        .domain(sessions.map((_, i) => `${i + 1}`))
        .range([0, innerWidth])
        .padding(0.35);

      // Bars
      const bars = g
        .selectAll('.bar')
        .data(sessions)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .style('cursor', 'pointer');

      // Bar rect
      bars
        .append('rect')
        .attr('x', (_, i) => xScale(`${i + 1}`) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 5)
        .attr('fill', (d) => {
          if (d.winnerId === 1) return '#F59E0B'; // Amber Gold (Team 1 Win)
          if (d.winnerId === 2) return '#3B82F6'; // Blue (Team 2 Win)
          return '#10B981'; // Emerald Tie
        })
        .attr('stroke', (d) => (d.winnerId === 1 ? '#FCD34D' : '#93C5FD'))
        .attr('stroke-width', 1.5)
        .on('mouseenter', (_, d) => setHoveredSession(d))
        .on('mouseleave', () => setHoveredSession(null))
        .transition()
        .duration(600)
        .delay((_, i) => i * 60)
        .attr('y', (d) => yScale(d.totalPoints))
        .attr('height', (d) => innerHeight - yScale(d.totalPoints));

      // Value label on top of bar
      bars
        .append('text')
        .attr('x', (_, i) => (xScale(`${i + 1}`) || 0) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.totalPoints) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#F8FAFC')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('opacity', 0)
        .text((d) => `${d.totalPoints}`)
        .transition()
        .delay((_, i) => i * 60 + 350)
        .duration(300)
        .attr('opacity', 1);

      // X Axis
      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((_, i) => {
          const s = sessions[i];
          return s ? `${s.dateStr}` : `Match ${i + 1}`;
        });

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((group) => {
          group.select('.domain').attr('stroke', '#64748B');
          group
            .selectAll('text')
            .attr('fill', '#94A3B8')
            .attr('font-size', '11px')
            .attr('font-weight', '500')
            .attr('dy', '1em');
          group.selectAll('line').attr('stroke', '#64748B');
        });
    } else {
      // Comparison grouped bar chart (Team 1 vs Team 2)
      const x0Scale = d3
        .scaleBand()
        .domain(sessions.map((_, i) => `${i + 1}`))
        .range([0, innerWidth])
        .padding(0.3);

      const x1Scale = d3
        .scaleBand()
        .domain(['team1', 'team2'])
        .range([0, x0Scale.bandwidth()])
        .padding(0.1);

      const groups = g
        .selectAll('.session-group')
        .data(sessions)
        .enter()
        .append('g')
        .attr('transform', (_, i) => `translate(${x0Scale(`${i + 1}`)},0)`)
        .style('cursor', 'pointer')
        .on('mouseenter', (_, d) => setHoveredSession(d))
        .on('mouseleave', () => setHoveredSession(null));

      // Team 1 Bar
      groups
        .append('rect')
        .attr('x', x1Scale('team1') || 0)
        .attr('y', innerHeight)
        .attr('width', x1Scale.bandwidth())
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', '#F59E0B')
        .transition()
        .duration(600)
        .delay((_, i) => i * 60)
        .attr('y', (d) => yScale(d.team1Score))
        .attr('height', (d) => innerHeight - yScale(d.team1Score));

      // Team 2 Bar
      groups
        .append('rect')
        .attr('x', x1Scale('team2') || 0)
        .attr('y', innerHeight)
        .attr('width', x1Scale.bandwidth())
        .attr('rx', 4)
        .attr('fill', '#3B82F6')
        .transition()
        .duration(600)
        .delay((_, i) => i * 60 + 30)
        .attr('y', (d) => yScale(d.team2Score))
        .attr('height', (d) => innerHeight - yScale(d.team2Score));

      // X Axis
      const xAxis = d3
        .axisBottom(x0Scale)
        .tickFormat((_, i) => sessions[i]?.dateStr || `M${i + 1}`);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((group) => {
          group.select('.domain').attr('stroke', '#64748B');
          group.selectAll('text').attr('fill', '#94A3B8').attr('font-size', '11px').attr('dy', '1em');
          group.selectAll('line').attr('stroke', '#64748B');
        });
    }

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    g.append('g')
      .call(yAxis)
      .call((group) => {
        group.select('.domain').attr('stroke', '#64748B');
        group.selectAll('text').attr('fill', '#94A3B8').attr('font-size', '10px');
        group.selectAll('line').attr('stroke', '#64748B');
      });
  }, [sessions, metric]);

  return (
    <div className="w-full">
      {/* Chart Metric Selector & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetric('totalPoints')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              metric === 'totalPoints'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Total Points per Match
          </button>
          <button
            type="button"
            onClick={() => setMetric('comparison')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              metric === 'comparison'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Score Comparison
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
            <span>Team 1 / Partner 1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            <span>Team 2 / Bot</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div ref={containerRef} className="w-full relative bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Interactive Hover Tooltip */}
        {hoveredSession && (
          <div className="absolute top-3 right-3 bg-slate-900 border-2 border-amber-500/50 p-2.5 rounded-xl shadow-xl text-left text-xs pointer-events-none animate-fadeIn max-w-[200px]">
            <div className="font-bold text-amber-300 flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
              <span>{hoveredSession.dateStr}</span>
              <span className="text-[10px] uppercase text-slate-400 font-mono">
                {hoveredSession.mode}
              </span>
            </div>
            <div className="space-y-0.5 text-slate-200">
              <div className="flex justify-between">
                <span>{hoveredSession.team1Name}:</span>
                <strong className="text-amber-400 font-mono">{hoveredSession.team1Score} pts</strong>
              </div>
              <div className="flex justify-between">
                <span>{hoveredSession.team2Name}:</span>
                <strong className="text-blue-400 font-mono">{hoveredSession.team2Score} pts</strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Total Combined:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {hoveredSession.totalPoints} pts
                </span>
              </div>
              <div className="text-[11px] font-semibold text-amber-300 pt-0.5">
                Winner: {hoveredSession.winnerName}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
