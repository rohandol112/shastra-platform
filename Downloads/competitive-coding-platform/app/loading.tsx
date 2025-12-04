"use client"

import { useEffect, useState } from "react"

// Graph nodes for BFS/DFS visualization
const nodes = [
  { id: 0, x: 150, y: 40 },   // Root
  { id: 1, x: 80, y: 100 },   // Left child
  { id: 2, x: 220, y: 100 },  // Right child
  { id: 3, x: 40, y: 160 },   // Left-left
  { id: 4, x: 120, y: 160 },  // Left-right
  { id: 5, x: 180, y: 160 },  // Right-left
  { id: 6, x: 260, y: 160 },  // Right-right
]

// Edges connecting nodes (parent -> child)
const edges = [
  [0, 1], [0, 2],  // Root to children
  [1, 3], [1, 4],  // Left subtree
  [2, 5], [2, 6],  // Right subtree
]

// BFS traversal order
const bfsOrder = [0, 1, 2, 3, 4, 5, 6]

export default function Loading() {
  const [visitedNodes, setVisitedNodes] = useState<number[]>([])
  const [visitedEdges, setVisitedEdges] = useState<number[]>([])
  const [currentNode, setCurrentNode] = useState<number | null>(null)

  useEffect(() => {
    let step = 0
    const interval = setInterval(() => {
      if (step < bfsOrder.length) {
        const nodeId = bfsOrder[step]
        setCurrentNode(nodeId)
        setVisitedNodes(prev => [...prev, nodeId])
        
        // Find edge to this node
        const edgeIndex = edges.findIndex(([, to]) => to === nodeId)
        if (edgeIndex !== -1) {
          setVisitedEdges(prev => [...prev, edgeIndex])
        }
        step++
      } else {
        // Reset animation
        setVisitedNodes([])
        setVisitedEdges([])
        setCurrentNode(null)
        step = 0
      }
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Graph visualization */}
        <div className="relative">
          <svg width="300" height="200" className="overflow-visible">
            {/* Edges */}
            {edges.map(([from, to], index) => {
              const fromNode = nodes[from]
              const toNode = nodes[to]
              const isVisited = visitedEdges.includes(index)
              return (
                <line
                  key={`edge-${index}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  className={`transition-all duration-300 ${
                    isVisited 
                      ? "stroke-secondary" 
                      : "stroke-muted-foreground/20"
                  }`}
                  strokeWidth={isVisited ? 3 : 2}
                />
              )
            })}
            
            {/* Nodes */}
            {nodes.map((node) => {
              const isVisited = visitedNodes.includes(node.id)
              const isCurrent = currentNode === node.id
              return (
                <g key={`node-${node.id}`}>
                  {/* Pulse effect for current node */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      className="fill-secondary/30 animate-ping"
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="16"
                    className={`transition-all duration-300 ${
                      isCurrent
                        ? "fill-secondary stroke-secondary"
                        : isVisited
                        ? "fill-primary stroke-primary"
                        : "fill-card stroke-muted-foreground/30"
                    }`}
                    strokeWidth="2"
                  />
                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-xs font-bold transition-colors duration-300 ${
                      isVisited || isCurrent
                        ? "fill-white"
                        : "fill-muted-foreground"
                    }`}
                  >
                    {node.id}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Algorithm label */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-mono text-primary">BFS Traversal</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">Loading</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary" />
            </span>
          </div>
          
          {/* Visited nodes display */}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">Visited:</span>
            <div className="flex gap-1">
              {visitedNodes.map((nodeId, idx) => (
                <span 
                  key={idx}
                  className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[10px] font-mono text-primary"
                >
                  {nodeId}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
