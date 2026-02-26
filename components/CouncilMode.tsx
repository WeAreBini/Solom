'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSolomStore } from '@/lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Scale, 
  Brain,
  Send,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const agentIcons: Record<string, typeof Bot> = {
  RESEARCHER: Search,
  FACT_CHECKER: ShieldCheck,
  CONTRARIAN: Scale,
  SYNTHESIST: Brain,
  EXECUTOR: Bot,
};

const agentColors: Record<string, string> = {
  RESEARCHER: 'bg-blue-500/20 text-blue-400',
  FACT_CHECKER: 'bg-emerald-500/20 text-emerald-400',
  CONTRARIAN: 'bg-amber-500/20 text-amber-400',
  SYNTHESIST: 'bg-violet-500/20 text-violet-400',
  EXECUTOR: 'bg-cyan-500/20 text-cyan-400',
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-slate-500/20 text-slate-400',
  RUNNING: 'bg-violet-500/20 text-violet-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  FAILED: 'bg-red-500/20 text-red-400',
  IDLE: 'bg-slate-500/20 text-slate-400',
  WORKING: 'bg-violet-500/20 text-violet-400',
  COMPLETE: 'bg-emerald-500/20 text-emerald-400',
  ERROR: 'bg-red-500/20 text-red-400',
};

export function CouncilMode() {
  const [query, setQuery] = useState('');
  const { councils, activeCouncilId, createCouncil, setActiveCouncil, isCreating } = useSolomStore();
  
  const activeCouncil = councils.find((c) => c.id === activeCouncilId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      createCouncil(query.trim());
      setQuery('');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-violet-500/10">
            <Users className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Council Mode</h1>
            <p className="text-muted-foreground text-sm">
              Multi-agent deliberation for complex reasoning
            </p>
          </div>
        </div>
        
        {/* Query Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your question..."
            className="flex-1"
            disabled={isCreating}
          />
          <Button type="submit" disabled={isCreating || !query.trim()} className="gap-2">
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Consult Council
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Council List */}
        <div className="w-80 border-r bg-card/30 p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Recent Councils ({councils.length})
          </h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {councils.map((council) => (
                <button
                  key={council.id}
                  onClick={() => setActiveCouncil(council.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    activeCouncilId === council.id
                      ? 'bg-violet-500/20 border border-violet-500/50'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{council.query}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs ${statusStyles[council.status] || ''}`}>
                      {council.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(council.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Active Council */}
        <div className="flex-1 p-6 overflow-auto">
          {activeCouncil ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCouncil.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">{activeCouncil.query}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge className={`text-sm ${statusStyles[activeCouncil.status] || ''}`}>
                        {activeCouncil.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(activeCouncil.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Council Members */}
                <div className="grid gap-4">
                  {activeCouncil.members.map((member, index) => {
                    const Icon = agentIcons[member.agentName] || Bot;
                    const memberColor = agentColors[member.agentName] || 'bg-slate-500/20 text-slate-400';
                    const borderColor = 
                      member.status === 'COMPLETE' ? 'border-l-emerald-500' : 
                      member.status === 'WORKING' ? 'border-l-violet-500' : 
                      'border-l-slate-500';
                    
                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`border-l-4 ${borderColor}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`shrink-0 p-3 rounded-xl ${memberColor}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold capitalize">
                                    {member.agentName.toLowerCase().replace('_', ' ')}
                                  </h3>
                                  <Badge className={`text-xs ${statusStyles[member.status] || ''}`}>
                                    {member.status === 'WORKING' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                    {member.status.toLowerCase()}
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  {member.status === 'IDLE' && (
                                    <p className="text-sm text-muted-foreground">Waiting to start...</p>
                                  )}
                                  {member.status === 'WORKING' && (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                      <p className="text-sm">Working...</p>
                                    </div>
                                  )}
                                  {member.status === 'COMPLETE' && member.findings && (
                                    <div>
                                      <p className="text-sm">{member.findings}</p>
                                      {member.confidence && (
                                        <div className="mt-2">
                                          <div className="text-xs text-muted-foreground">
                                            Confidence: {Math.round(member.confidence * 100)}%
                                          </div>
                                          <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                                            <div 
                                              className="h-full bg-emerald-500 rounded-full transition-all"
                                              style={{ width: `${member.confidence * 100}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter a query to start a Council</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}