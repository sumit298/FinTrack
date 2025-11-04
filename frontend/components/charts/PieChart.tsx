"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieData[];
}

export default function PieChart({ data }: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    console.log('PieChart received data:', data);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const totalWidth = 500;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<PieData>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color);

    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text(d => d.data.value > 50 ? `$${d.data.value.toLocaleString()}` : '');

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(data)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 35})`);

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => d.color);

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .text(d => `${d.name} ($${d.value.toLocaleString()})`);

    // Add percentage labels
    const total = data.reduce((sum, d) => sum + d.value, 0);
    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 25)
      .style("font-size", "10px")
      .style("fill", "#666")
      .text(d => `${((d.value / total) * 100).toFixed(1)}%`);

  }, [data]);

  return (
    <svg
      ref={svgRef}
      width={500}
      height={300}
      className="w-full h-auto"
    />
  );
}