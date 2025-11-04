"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
  title?: string;
}

export default function LineChart({ data, title }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates and sort data
    const parseDate = d3.timeParse("%Y-%m-%d");
    const sortedData = data
      .map(d => ({ ...d, date: parseDate(d.date) }))
      .filter(d => d.date)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(sortedData, d => d.date as Date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(sortedData, d => d.value) as [number, number])
      .range([height, 0]);

    // Line generator
    const line = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add line
    g.append("path")
      .datum(sortedData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    g.selectAll(".dot")
      .data(sortedData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date as Date))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", "#3b82f6");

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")));

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`));

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