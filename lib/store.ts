import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface CouncilMember {
  id: string;
  agentName: AgentRole;
  status: MemberStatus;
  findings?: string;
  confidence?: number;
}

export interface Council {
  id: string;
  query: string;
  status: CouncilStatus;
  consensus?: string;
  members: CouncilMember[];
  createdAt: Date;
}

type AgentRole = 'RESEARCHER' | 'FACT_CHECKER' | 'CONTRARIAN' | 'SYNTHESIST' | 'EXECUTOR';
type MemberStatus = 'IDLE' | 'WORKING' | 'COMPLETE' | 'ERROR';
type CouncilStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface SolomState {
  // Active councils
  councils: Council[];
  activeCouncilId: string | null;
  
  // Actions
  createCouncil: (query: string) => void;
  updateCouncil: (id: string, updates: Partial<Council>) => void;
  updateMember: (councilId: string, memberId: string, updates: Partial<CouncilMember>) => void;
  setActiveCouncil: (id: string | null) => void;
  
  // Loading states
  isCreating: boolean;
}

export const useSolomStore = create<SolomState>()(
  immer((set) => ({
    councils: [],
    activeCouncilId: null,
    isCreating: false,
    
    createCouncil: (query) => {
      set((state) => {
        state.isCreating = true;
        const newCouncil: Council = {
          id: crypto.randomUUID(),
          query,
          status: 'PENDING',
          members: [
            { id: crypto.randomUUID(), agentName: 'RESEARCHER', status: 'IDLE' },
            { id: crypto.randomUUID(), agentName: 'FACT_CHECKER', status: 'IDLE' },
            { id: crypto.randomUUID(), agentName: 'CONTRARIAN', status: 'IDLE' },
            { id: crypto.randomUUID(), agentName: 'SYNTHESIST', status: 'IDLE' },
          ],
          createdAt: new Date(),
        };
        state.councils.unshift(newCouncil);
        state.activeCouncilId = newCouncil.id;
        state.isCreating = false;
      });
    },
    
    updateCouncil: (id, updates) => {
      set((state) => {
        const council = state.councils.find((c) => c.id === id);
        if (council) {
          Object.assign(council, updates);
        }
      });
    },
    
    updateMember: (councilId, memberId, updates) => {
      set((state) => {
        const council = state.councils.find((c) => c.id === councilId);
        if (council) {
          const member = council.members.find((m) => m.id === memberId);
          if (member) {
            Object.assign(member, updates);
          }
        }
      });
    },
    
    setActiveCouncil: (id) => {
      set((state) => {
        state.activeCouncilId = id;
      });
    },
  }))
);
