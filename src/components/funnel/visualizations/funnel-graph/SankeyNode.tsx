
import React from "react";
import { SankeyNode as ISankeyNode } from "./types";

interface SankeyNodeProps {
  node: ISankeyNode;
  onHover: (id: string | null) => void;
  isActive: boolean;
}

const SankeyNode: React.FC<SankeyNodeProps> = ({ node, onHover, isActive }) => {
  return (
    <g 
      className="sankey-node-group" 
      data-node-id={node.id}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill={node.color}
        rx={4}
        ry={4}
        className={`sankey-node ${isActive ? 'opacity-80' : 'opacity-100'}`}
        cursor="pointer"
      />
      <text
        x={node.x + (node.width / 2)}
        y={node.y + 20}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight="bold"
        pointerEvents="none"
      >
        {node.name}
      </text>
      <text
        x={node.x + (node.width / 2)}
        y={node.y + 40}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        pointerEvents="none"
      >
        {node.value.toLocaleString()}
      </text>
    </g>
  );
};

export default SankeyNode;
