import { create } from 'zustand';
import { PipelineState, ToolOutput } from '@/types/pipeline';

interface PipelineStore extends PipelineState {
  setInputFile: (file: File | null) => void;
  setInputType: (type: 'lanl' | 'cicids') => void;
  setBackendUrl: (url: string) => void;
  startPipeline: () => void;
  stopPipeline: () => void;
  updateTool: (toolIndex: number, updates: Partial<ToolOutput>) => void;
  addLog: (toolIndex: number, log: string) => void;
  setCurrentTool: (tool: number) => void;
  reset: () => void;
}

const TOOLS: Omit<ToolOutput, 'logs'>[] = [
  { tool: 1, name: 'Unified Event Intelligence', status: 'pending' },
  { tool: 2, name: 'Behavioral Path Reconstruction', status: 'pending' },
  { tool: 3, name: 'Predictive Attack Trajectory', status: 'pending' },
  { tool: 4, name: 'Adaptive Response Prioritization', status: 'pending' },
  { tool: 5, name: 'Controlled Response Execution', status: 'pending' },
  { tool: 6, name: 'Governance & Learning', status: 'pending' },
];

const initialState: PipelineState = {
  isRunning: false,
  currentTool: 0,
  tools: TOOLS.map(t => ({ ...t, logs: [] })),
  inputFile: null,
  inputType: 'lanl',
  backendUrl: 'http://localhost:8000',
};

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  ...initialState,

  setInputFile: (file) => set({ inputFile: file }),
  
  setInputType: (type) => set({ inputType: type }),
  
  setBackendUrl: (url) => set({ backendUrl: url }),

  startPipeline: () => set({ isRunning: true, currentTool: 1 }),
  
  stopPipeline: () => set({ isRunning: false }),

  updateTool: (toolIndex, updates) => set((state) => ({
    tools: state.tools.map((t, i) => 
      i === toolIndex ? { ...t, ...updates } : t
    ),
  })),

  addLog: (toolIndex, log) => set((state) => ({
    tools: state.tools.map((t, i) => 
      i === toolIndex ? { ...t, logs: [...t.logs, log] } : t
    ),
  })),

  setCurrentTool: (tool) => set({ currentTool: tool }),

  reset: () => set({
    ...initialState,
    tools: TOOLS.map(t => ({ ...t, logs: [] })),
  }),
}));
