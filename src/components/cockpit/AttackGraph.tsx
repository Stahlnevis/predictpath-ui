import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PathReport, getTechniqueName } from '@/types/pipeline';

interface AttackGraphProps {
  pathReports: PathReport[];
}

export function AttackGraph({ pathReports }: AttackGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];
    let yOffset = 0;

    pathReports.forEach((report, reportIndex) => {
      const sessionColor = reportIndex % 2 === 0 ? '#22c55e' : '#3b82f6';
      
      // Root node
      const rootId = `${report.session_id}-root`;
      nodeMap.set(rootId, {
        id: rootId,
        position: { x: 50, y: yOffset },
        data: {
          label: (
            <div className="text-center">
              <div className="text-xs text-green-400 font-bold">ROOT</div>
              <div className="text-xs">{report.root_cause_node.substring(0, 12)}...</div>
              <div className="text-xs text-muted-foreground">{report.session_id}</div>
            </div>
          ),
        },
        style: {
          background: 'hsl(222 47% 8%)',
          border: `2px solid ${sessionColor}`,
          borderRadius: '8px',
          padding: '10px',
          color: 'white',
          width: 140,
        },
      });

      // Prediction nodes
      let xOffset = 220;
      report.prediction_vector.forEach((pred, predIndex) => {
        const predId = `${report.session_id}-pred-${predIndex}`;
        const opacity = Math.max(0.3, pred.probability);
        
        nodeMap.set(predId, {
          id: predId,
          position: { x: xOffset, y: yOffset },
          data: {
            label: (
              <div className="text-center">
                <div className="text-xs font-semibold text-yellow-400">
                  {pred.next_node}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(pred.probability * 100).toFixed(0)}%
                </div>
              </div>
            ),
          },
          style: {
            background: `hsl(222 47% 8% / ${opacity})`,
            border: `1px solid hsl(45 93% 47% / ${opacity})`,
            borderRadius: '8px',
            padding: '8px',
            color: 'white',
            width: 120,
          },
        });

        // Edge from root to prediction
        edgeList.push({
          id: `${rootId}-${predId}`,
          source: rootId,
          target: predId,
          animated: pred.probability > 0.5,
          style: { 
            stroke: sessionColor, 
            strokeWidth: Math.max(1, pred.probability * 3),
            opacity: pred.probability,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: sessionColor,
          },
          label: `${(pred.probability * 100).toFixed(0)}%`,
          labelStyle: { fill: '#fff', fontSize: 10 },
          labelBgStyle: { fill: 'hsl(222 47% 8%)', fillOpacity: 0.8 },
        });

        xOffset += 140;
      });

      // Blast radius nodes
      report.blast_radius.forEach((host, hostIndex) => {
        const hostId = `${report.session_id}-host-${hostIndex}`;
        
        nodeMap.set(hostId, {
          id: hostId,
          position: { x: 50 + hostIndex * 80, y: yOffset + 100 },
          data: {
            label: (
              <div className="text-center">
                <div className="text-xs text-red-400">💥</div>
                <div className="text-xs truncate" style={{ maxWidth: 60 }}>{host}</div>
              </div>
            ),
          },
          style: {
            background: 'hsl(0 84% 60% / 0.2)',
            border: '1px solid hsl(0 84% 60% / 0.5)',
            borderRadius: '50%',
            padding: '6px',
            color: 'white',
            width: 70,
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        });

        edgeList.push({
          id: `${rootId}-${hostId}`,
          source: rootId,
          target: hostId,
          style: { stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 2' },
        });
      });

      yOffset += 200;
    });

    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [pathReports]);

  if (pathReports.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p>No attack paths to visualize</p>
          <p className="text-sm">Run the analysis pipeline to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        style={{ background: 'hsl(222 47% 4%)' }}
      >
        <Background color="hsl(142 76% 36% / 0.1)" gap={20} />
        <Controls className="bg-card border-primary/30" />
        <MiniMap 
          nodeColor={(node) => {
            const style = node.style as React.CSSProperties;
            return (style?.borderColor as string) || '#22c55e';
          }}
          maskColor="hsl(222 47% 4% / 0.8)"
          style={{ background: 'hsl(222 47% 6%)' }}
        />
      </ReactFlow>
    </div>
  );
}
