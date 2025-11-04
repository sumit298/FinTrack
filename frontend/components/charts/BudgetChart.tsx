"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BudgetData {
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  color: string;
}

interface BudgetChartProps {
  data: BudgetData[];
}

export default function BudgetChart({ data }: BudgetChartProps) {
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

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.categoryName))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.budgetAmount, d.spentAmount)) || 0])
      .range([height, 0]);

    // Bars
    const barWidth = x.bandwidth() / 2;

    // Budget bars
    g.selectAll(".budget-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "budget-bar")
      .attr("x", d => (x(d.categoryName) || 0) + barWidth / 2)
      .attr("y", d => y(d.budgetAmount))
      .attr("width", barWidth)
      .attr("height", d => height - y(d.budgetAmount))
      .attr("fill", "#e2e8f0");

    // Spent bars
    g.selectAll(".spent-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "spent-bar")
      .attr("x", d => (x(d.categoryName) || 0))
      .attr("y", d => y(d.spentAmount))
      .attr("width", barWidth)
      .attr("height", d => height - y(d.spentAmount))
      .attr("fill", d => d.spentAmount > d.budgetAmount ? "#ef4444" : "#10b981");

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`));

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 140}, 20)`);

    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#e2e8f0");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Budget")
      .style("font-size", "12px");

    legend.append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#10b981");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 32)
      .text("Spent (On Track)")
      .style("font-size", "12px");

    legend.append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#ef4444");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 52)
      .text("Spent (Over Budget)")
      .style("font-size", "12px");

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