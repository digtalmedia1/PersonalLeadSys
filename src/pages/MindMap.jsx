
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Plus, Trash2, Edit, Save, 
  ArrowLeft, ZoomIn, ZoomOut, Move,
  FileJson, Link as LinkIcon, Minus,
  Activity, Zap, MousePointer2,
  Palette, Shapes, Type, LayoutGrid, Briefcase, ChevronRight, X,
  Minimize2, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

// --- Constants & Utilities ---
const NODE_SHAPES = [
  { id: 'rounded', label: 'מלבן עגול', class: 'rounded-2xl' },
  { id: 'square', label: 'מרובע', class: 'rounded-none' },
  { id: 'circle', label: 'עיגול', class: 'rounded-full aspect-square flex items-center justify-center' },
  { id: 'diamond', label: 'יהלום', class: 'rotate-45 [&>div]:-rotate-45 aspect-square flex items-center justify-center' },
  { id: 'hexagon', label: 'משושה', class: 'hexagon aspect-square flex items-center justify-center' }
];

const CONNECTION_TYPES = [
  { id: 'straight', label: 'ישר' },
  { id: 'curve', label: 'מעוקל' },
  { id: 'step', label: 'מדרגות' }
];

const CONNECTION_STYLES = [
  { id: 'solid', label: 'מלא' },
  { id: 'dashed', label: 'מקווקו' },
  { id: 'dotted', label: 'נקודות' }
];

const EMOJIS = ['😊', '🚀', '💡', '🔥', '⭐', '🎯', '🎨', '🔧', '📱', '💻', '📈', '💰', '🔒', '❤️', '✅', '❌', '🌈', '⚡', '🏆', '📣', '🧠', '⚙️', '📝', '📊'];

const MindMap = () => {
  const { toast } = useToast();
  
  // --- State: General ---
  const [view, setView] = useState('list');
  const [maps, setMaps] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // --- State: Editor ---
  const [currentMap, setCurrentMap] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]); 
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  
  // Canvas Viewport
  const [scale, setScale] = useState(1);
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  
  // Interaction Modes
  const [interactionMode, setInteractionMode] = useState('select'); // 'select', 'connect'
  const [connectionStartNode, setConnectionStartNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // For temp line drawing
  const [draggingNodeId, setDraggingNodeId] = useState(null); // Custom drag handling

  // --- Modals State ---
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState(false);
  
  // --- Temp Data for Forms ---
  const [newMapData, setNewMapData] = useState({ name: '', description: '', projectId: '' });

  const editorRef = useRef(null);

  // --- Constants ---
  const nodeColors = [
    { id: 'blue', value: '#00D9FF' },
    { id: 'purple', value: '#9D4EDD' },
    { id: 'pink', value: '#FF006E' },
    { id: 'green', value: '#10B981' },
    { id: 'yellow', value: '#FFA500' },
    { id: 'cyan', value: '#06b6d4' },
    { id: 'white', value: '#ffffff' },
    { id: 'gray', value: '#64748b' },
  ];

  // --- Initialization ---
  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('empire_projects') || '[]');
    setProjects(storedProjects);
    const storedMaps = JSON.parse(localStorage.getItem('empire_mindmaps') || '[]');
    setMaps(storedMaps);
  }, []);

  // --- Dragging Logic for Nodes ---
  useEffect(() => {
      const handleGlobalMouseMove = (e) => {
          if (draggingNodeId) {
             e.preventDefault();
             setNodes(prev => prev.map(n => {
                 if (n.id === draggingNodeId) {
                     return {
                         ...n,
                         x: n.x + (e.movementX / scale),
                         y: n.y + (e.movementY / scale)
                     };
                 }
                 return n;
             }));
          }
      };

      const handleGlobalMouseUp = () => {
          if (draggingNodeId) {
              setDraggingNodeId(null);
              // Snap to grid on release
              setNodes(prev => prev.map(n => {
                  if (n.id === draggingNodeId) {
                       return {
                          ...n,
                          x: Math.round(n.x / 10) * 10,
                          y: Math.round(n.y / 10) * 10
                       };
                  }
                  return n;
              }));
          }
      };

      if (draggingNodeId) {
          window.addEventListener('mousemove', handleGlobalMouseMove);
          window.addEventListener('mouseup', handleGlobalMouseUp);
      }

      return () => {
          window.removeEventListener('mousemove', handleGlobalMouseMove);
          window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
  }, [draggingNodeId, scale]);

  // --- Persistence ---
  const saveMaps = (updatedMaps) => {
    setMaps(updatedMaps);
    localStorage.setItem('empire_mindmaps', JSON.stringify(updatedMaps));
  };

  const saveCurrentMap = () => {
    if (!currentMap) return;
    const updatedMap = { ...currentMap, nodes, connections };
    const updatedMaps = maps.map(m => m.id === currentMap.id ? updatedMap : m);
    saveMaps(updatedMaps);
    toast({ title: "המפה נשמרה", description: "כל השינויים נשמרו בהצלחה" });
  };

  // --- Map Management ---
  const handleCreateMap = () => {
    if (!newMapData.name) return;
    const newMap = {
      id: `mm_${Date.now()}`,
      ...newMapData,
      createdAt: new Date().toISOString(),
      nodes: [
        { id: 'root', label: newMapData.name, x: 0, y: 0, color: '#00D9FF', shape: 'rounded' } 
      ],
      connections: []
    };
    saveMaps([...maps, newMap]);
    setIsNewMapModalOpen(false);
    setNewMapData({ name: '', description: '', projectId: '' });
    openEditor(newMap);
    toast({ title: "מפה נוצרה", description: "התחלת עריכה" });
  };

  const deleteMap = (id) => {
    if (!window.confirm("למחוק את המפה?")) return;
    saveMaps(maps.filter(m => m.id !== id));
    toast({ title: "נמחק", variant: "destructive" });
  };

  const openEditor = (map) => {
    setCurrentMap(map);
    const safeNodes = (map.nodes || []).map(n => ({
        ...n,
        x: Number.isFinite(n.x) ? n.x : 0,
        y: Number.isFinite(n.y) ? n.y : 0
    }));
    setNodes(safeNodes);
    
    // Auto-generate connections if missing (backward compatibility)
    if (!map.connections && map.nodes) {
        const generatedConnections = map.nodes.filter(n => n.parentId).map(n => ({
            id: `c_${n.parentId}_${n.id}`,
            sourceId: n.parentId,
            targetId: n.id,
            type: 'curve',
            style: 'solid',
            color: '#555555',
            width: 2
        }));
        setConnections(generatedConnections);
    } else {
        setConnections(map.connections || []);
    }
    
    // Smart Centering
    if (safeNodes.length > 0) {
        const avgX = safeNodes.reduce((acc, n) => acc + n.x, 0) / safeNodes.length;
        const avgY = safeNodes.reduce((acc, n) => acc + n.y, 0) / safeNodes.length;
        setCanvasPos({ 
            x: (window.innerWidth / 2) - avgX, 
            y: (window.innerHeight / 2) - avgY 
        });
    } else {
        setCanvasPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    setScale(1);
    setView('editor');
  };

  // --- Interactions ---
  const handleCanvasMouseMove = (e) => {
    if (editorRef.current) {
        const rect = editorRef.current.getBoundingClientRect();
        const viewportX = e.clientX - rect.left;
        const viewportY = e.clientY - rect.top;
        
        const canvasX = (viewportX - canvasPos.x) / scale;
        const canvasY = (viewportY - canvasPos.y) / scale;
        
        setMousePos({ x: canvasX, y: canvasY });
    }

    if (isDraggingCanvas) {
       setCanvasPos(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const handleCanvasClick = () => {
    if(!isDraggingCanvas) {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
        if (interactionMode === 'connect') {
            setConnectionStartNode(null);
            toast({ title: "בוטל", description: "יצירת החיבור בוטלה" });
            setInteractionMode('select');
        }
    }
  };

  const handleNodePointerDown = (e, node) => {
      e.stopPropagation(); 
      if (interactionMode === 'connect') {
          handleNodeClick(e, node);
      } else {
          setSelectedNodeId(node.id);
          setSelectedConnectionId(null);
          setDraggingNodeId(node.id);
      }
  };

  const handleNodeClick = (e, node) => {
    if (interactionMode === 'connect') {
      if (!connectionStartNode) {
        setConnectionStartNode(node);
        toast({ title: "התחלה נבחרה", description: "כעת לחץ על צומת היעד", duration: 2000 });
      } else {
        if (connectionStartNode.id === node.id) {
          setConnectionStartNode(null);
          toast({ title: "בוטל", description: "לא ניתן לחבר צומת לעצמו", variant: "destructive" });
          return;
        }
        const exists = connections.find(
             c => (c.sourceId === connectionStartNode.id && c.targetId === node.id) || 
                  (c.sourceId === node.id && c.targetId === connectionStartNode.id)
        );
        if (exists) {
            toast({ title: "שגיאה", description: "החיבור כבר קיים", variant: "destructive" });
            setConnectionStartNode(null);
            return;
        }
        const newConn = {
          id: `c_${Date.now()}`,
          sourceId: connectionStartNode.id,
          targetId: node.id,
          type: 'curve',
          style: 'solid',
          color: '#555555',
          width: 2
        };
        setConnections([...connections, newConn]);
        setConnectionStartNode(null);
        toast({ title: "חובר בהצלחה", description: "נוצר חיבור חדש בין הצמתים" });
        setInteractionMode('select'); 
      }
    }
  };

  // --- Node Operations ---
  const addNewNodeToCanvas = () => {
      if (!editorRef.current) return;
      const viewportW = editorRef.current.clientWidth;
      const viewportH = editorRef.current.clientHeight;
      const centerX = ((viewportW / 2) - canvasPos.x) / scale;
      const centerY = ((viewportH / 2) - canvasPos.y) / scale;

      const newNode = {
          id: `n_${Date.now()}`,
          label: 'רעיון חדש',
          x: centerX - 75,
          y: centerY - 40,
          color: '#00D9FF',
          shape: 'rounded',
          emoji: ''
      };
      
      setNodes(prev => [...prev, newNode]);
      setSelectedNodeId(newNode.id);
      setSelectedConnectionId(null);
  };

  const updateSelectedNode = (updates) => {
    if (!selectedNodeId) return;
    setNodes(nodes.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n));
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    if(window.confirm("האם למחוק את הצומת הזה?")) {
        const idsToDelete = new Set([selectedNodeId]);
        const newConnections = connections.filter(c => c.sourceId !== selectedNodeId && c.targetId !== selectedNodeId);
        setNodes(nodes.filter(n => !idsToDelete.has(n.id)));
        setConnections(newConnections);
        setSelectedNodeId(null);
        toast({ title: "נמחק", description: "הצומת והחיבורים שלו נמחקו" });
    }
  };

  const handleClearAll = () => {
      if(window.confirm("האם אתה בטוח שברצונך למחוק הכל? פעולה זו אינה הפיכה.")) {
          setNodes([]);
          setConnections([]);
          toast({ title: "הלוח נוקה", variant: "destructive" });
      }
  };

  // --- Connection Operations ---
  const handleConnectionClick = (e, conn) => {
      e.stopPropagation();
      setSelectedConnectionId(conn.id);
      setSelectedNodeId(null);
  };

  const updateSelectedConnection = (updates) => {
      if (!selectedConnectionId) return;
      setConnections(connections.map(c => c.id === selectedConnectionId ? { ...c, ...updates } : c));
  };

  const deleteSelectedConnection = () => {
      if (!selectedConnectionId) return;
      setConnections(connections.filter(c => c.id !== selectedConnectionId));
      setSelectedConnectionId(null);
      toast({ title: "נמחק", description: "החיבור הוסר בהצלחה" });
  };

  // --- Render Helpers ---
  const getPath = (sx, sy, tx, ty, type) => {
      if (type === 'straight') {
          return `M ${sx} ${sy} L ${tx} ${ty}`;
      } else if (type === 'step') {
          const midX = (sx + tx) / 2;
          return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
      } else {
          const dist = Math.abs(tx - sx) + Math.abs(ty - sy);
          const cpOffset = Math.min(dist * 0.5, 150); 
          return `M ${sx} ${sy} C ${sx + cpOffset} ${sy}, ${tx - cpOffset} ${ty}, ${tx} ${ty}`;
      }
  };

  const renderConnections = () => {
    return (
      <>
        {connections.map(conn => {
          const source = nodes.find(n => n.id === conn.sourceId);
          const target = nodes.find(n => n.id === conn.targetId);
          if (!source || !target) return null;

          const getCenter = (node) => {
              const isShape = node.shape !== 'rounded' && node.shape !== 'square';
              const w = isShape ? 150 : 180; 
              const h = isShape ? 150 : 80; 
              return { x: node.x + w/2, y: node.y + h/2 };
          };

          const sPos = getCenter(source);
          const tPos = getCenter(target);

          const d = getPath(sPos.x, sPos.y, tPos.x, tPos.y, conn.type);
          const midX = (sPos.x + tPos.x) / 2;
          const midY = (sPos.y + tPos.y) / 2;

          return (
            <g 
                key={conn.id} 
                onClick={(e) => handleConnectionClick(e, conn)} 
                className="group cursor-pointer"
                style={{ pointerEvents: 'auto' }}
            >
                <path d={d} stroke="transparent" strokeWidth="20" fill="none" />
                <path
                  d={d}
                  stroke={conn.color}
                  strokeWidth={conn.width}
                  strokeDasharray={conn.style === 'dashed' ? '10,5' : conn.style === 'dotted' ? '2,4' : 'none'}
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  style={{ 
                      filter: selectedConnectionId === conn.id ? `drop-shadow(0 0 5px ${conn.color})` : 'none',
                      stroke: selectedConnectionId === conn.id ? '#fff' : conn.color,
                      opacity: 0.9
                  }}
                />
                {conn.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                        <rect x="-40" y="-12" width="80" height="24" rx="4" fill="#0A0E27" stroke={conn.color} strokeWidth="1" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: 'none' }}>{conn.label}</text>
                    </g>
                )}
            </g>
          );
        })}
        {interactionMode === 'connect' && connectionStartNode && (
            <path 
                d={getPath(
                    connectionStartNode.x + 90, 
                    connectionStartNode.y + 40, 
                    mousePos.x, 
                    mousePos.y, 
                    'curve'
                )} 
                stroke="#00D9FF" 
                strokeWidth="2" 
                strokeDasharray="5,5" 
                fill="none" 
                className="animate-pulse pointer-events-none opacity-60"
            />
        )}
      </>
    );
  };

  const handleExportJSON = () => {
    if (!currentMap) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ ...currentMap, nodes, connections }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${currentMap.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Helper to get currently selected item ---
  const activeNode = nodes.find(n => n.id === selectedNodeId);
  const activeConnection = connections.find(c => c.id === selectedConnectionId);

  // --- List View ---
  if (view === 'list') {
    return (
      <>
        <Helmet><title>Mind Maps - Empire CRM</title></Helmet>
        <div className="space-y-6 pb-6 font-rubik" dir="rtl">
          <div className="flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
                 מפות חשיבה (Mind Maps)
               </h1>
               <p className="text-gray-400 text-sm mt-1">ויזואליזציה מתקדמת של רעיונות ותהליכים</p>
             </div>
             <Button onClick={() => setIsNewMapModalOpen(true)} className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                <Plus className="w-5 h-5 ml-2" />
                מפה חדשה
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {maps.map(map => {
               const project = projects.find(p => p.id === map.projectId);
               return (
                 <div key={map.id} className="bg-[#050A18]/60 border border-white/10 rounded-2xl p-6 hover:border-[#00D9FF]/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D9FF]/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-[#00D9FF]/10 rounded-xl text-[#00D9FF]"><Network className="w-6 h-6" /></div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => deleteMap(map.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{map.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{map.description || 'ללא תיאור'}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                       <div className="text-xs text-gray-500 flex items-center gap-1">
                          {project ? (
                            <>
                               <Briefcase className="w-3 h-3" />
                               {project.name}
                            </>
                          ) : 'ללא פרויקט'}
                       </div>
                       <Button onClick={() => openEditor(map)} variant="ghost" size="sm" className="text-[#00D9FF] hover:bg-[#00D9FF]/10">
                          פתח לעריכה <ChevronRight className="w-4 h-4 mr-1" />
                       </Button>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>

        <Dialog open={isNewMapModalOpen} onOpenChange={setIsNewMapModalOpen}>
           <DialogContent className="bg-[#0A0E27] border border-[#00D9FF]/20 text-white sm:max-w-[425px]">
              <DialogHeader>
                 <DialogTitle>יצירת מפת חשיבה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4" dir="rtl">
                 <div className="space-y-2">
                    <Label>שם המפה</Label>
                    <input value={newMapData.name} onChange={e => setNewMapData({...newMapData, name: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#00D9FF]" placeholder="לדוגמה: תכנון השקה" />
                 </div>
                 <div className="space-y-2">
                    <Label>תיאור</Label>
                    <textarea rows={2} value={newMapData.description} onChange={e => setNewMapData({...newMapData, description: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#00D9FF]" />
                 </div>
                 <div className="space-y-2">
                    <Label>שיוך לפרויקט</Label>
                    <select value={newMapData.projectId} onChange={e => setNewMapData({...newMapData, projectId: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#00D9FF]">
                       <option value="">ללא פרויקט</option>
                       {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
              </div>
              <DialogFooter>
                 <Button onClick={handleCreateMap} className="bg-[#00D9FF] text-[#050A18] font-bold">צור מפה</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </>
    );
  }

  // --- Editor View ---
  return (
    <div className="flex flex-col h-full w-full bg-[#050A18] font-rubik overflow-hidden" dir="rtl">
       <style>{`
          .hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #0A0E27; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #00D9FF; border-radius: 4px; }
       `}</style>

       {/* Toolbar Header */}
       <div className="h-16 bg-[#0A0E27] border-b border-white/10 flex items-center justify-between px-4 z-50 shadow-xl backdrop-blur-md bg-opacity-95 select-none shrink-0">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setView('list')} className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
             </Button>
             <div>
                <h2 className="font-bold text-white text-lg">{currentMap?.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity className="w-3 h-3 text-[#00D9FF]" /> 
                    <span>{nodes.length} צמתים</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center bg-[#050A18] p-1.5 rounded-xl border border-white/10 gap-1 shadow-lg">
              <Button 
                variant={interactionMode === 'select' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => { setInteractionMode('select'); setConnectionStartNode(null); }}
                className={cn("h-9 gap-2 transition-all font-medium", interactionMode === 'select' && "bg-[#00D9FF]/20 text-[#00D9FF]")}
              >
                 <MousePointer2 className="w-4 h-4" /> בחירה
              </Button>
              <Button 
                variant={interactionMode === 'connect' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => { setInteractionMode('connect'); toast({ title: "מצב חיבור", description: "לחץ על צומת מקור, ואז על יעד" }); }}
                className={cn("h-9 gap-2 transition-all font-medium", interactionMode === 'connect' && "bg-[#9D4EDD]/20 text-[#9D4EDD] ring-2 ring-[#9D4EDD]/30")}
              >
                 <Zap className="w-4 h-4" /> חיבור
              </Button>
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              <Button onClick={addNewNodeToCanvas} size="sm" variant="ghost" className="h-9 gap-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 font-medium">
                 <Plus className="w-4 h-4" /> הוסף צומת
              </Button>
              <Button onClick={handleClearAll} size="sm" variant="ghost" className="h-9 gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 font-medium">
                 <Trash2 className="w-4 h-4" /> נקה הכל
              </Button>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={handleExportJSON} className="border-white/10 text-gray-300 gap-2 hover:bg-white/5"><FileJson className="w-4 h-4" /> Export</Button>
             <div className="h-6 w-px bg-white/10 mx-2"></div>
             <Button onClick={saveCurrentMap} className="bg-[#00D9FF] text-[#050A18] font-bold gap-2 shadow-[0_0_15px_#00D9FF]/40 hover:shadow-[0_0_25px_#00D9FF]/60 hover:bg-[#00B4D8] transition-all"><Save className="w-4 h-4" /> שמירה</Button>
          </div>
       </div>

       {/* Main Split Layout */}
       <div className="flex-1 flex overflow-hidden relative">
          
          {/* Right Sidebar - Properties Panel (Appears first in DOM for RTL: Right Side) */}
          {(selectedNodeId || selectedConnectionId) && (
              <div className="w-80 bg-[#0A0E27] border-l border-white/10 flex flex-col shadow-2xl z-20 shrink-0 h-full overflow-hidden">
                 <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050A18]/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {activeNode && <><Edit className="w-4 h-4 text-[#00D9FF]" /> עריכת צומת</>}
                        {activeConnection && <><Zap className="w-4 h-4 text-[#9D4EDD]" /> עריכת חיבור</>}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => {setSelectedNodeId(null); setSelectedConnectionId(null)}} className="h-8 w-8 text-gray-400 hover:text-white"><X className="w-4 h-4" /></Button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    {/* NODE EDITOR */}
                    {activeNode && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-gray-400 flex items-center gap-2"><Type className="w-4 h-4" /> טקסט</Label>
                                <input 
                                    value={activeNode.label} 
                                    onChange={e => updateSelectedNode({ label: e.target.value })} 
                                    className="w-full bg-[#050A18] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all" 
                                    placeholder="שם הצומת..."
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-gray-400 flex items-center gap-2"><Palette className="w-4 h-4" /> צבע</Label>
                                <div className="grid grid-cols-4 gap-2">
                                {nodeColors.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => updateSelectedNode({ color: c.value })}
                                        className={cn(
                                            "w-8 h-8 rounded-full border border-white/10 transition-transform hover:scale-110",
                                            activeNode.color === c.value && "ring-2 ring-white ring-offset-2 ring-offset-[#0A0E27] scale-110"
                                        )}
                                        style={{ background: c.value }}
                                    />
                                ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-gray-400 flex items-center gap-2"><Shapes className="w-4 h-4" /> צורה</Label>
                                <div className="grid grid-cols-5 gap-2">
                                {NODE_SHAPES.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => updateSelectedNode({ shape: s.id })}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center rounded hover:bg-white/5 transition-all",
                                            activeNode.shape === s.id && "bg-[#00D9FF]/20 text-[#00D9FF] ring-1 ring-[#00D9FF]"
                                        )}
                                        title={s.label}
                                    >
                                        <div className={cn("w-4 h-4 bg-current opacity-80", s.class === 'hexagon' ? 'hexagon' : s.class, s.id === 'diamond' ? 'rotate-45' : '')}></div>
                                    </button>
                                ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400">אמוג'י</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    <button onClick={() => updateSelectedNode({ emoji: '' })} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-[#050A18] hover:border-[#00D9FF]/50", !activeNode.emoji && "border-[#00D9FF] text-[#00D9FF]")}><Minus className="w-4 h-4" /></button>
                                    {EMOJIS.map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => updateSelectedNode({ emoji })} 
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all text-lg", 
                                                activeNode.emoji === emoji && "bg-[#00D9FF]/20 ring-1 ring-[#00D9FF] scale-110"
                                            )}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> קישור (URL)</Label>
                                <input 
                                    value={activeNode.link || ''} 
                                    onChange={e => updateSelectedNode({ link: e.target.value })} 
                                    placeholder="https://example.com" 
                                    className="w-full bg-[#050A18] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#00D9FF] text-sm font-mono" 
                                />
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <Button variant="destructive" onClick={deleteSelectedNode} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="w-4 h-4 ml-2" /> מחק צומת</Button>
                            </div>
                        </>
                    )}

                    {/* CONNECTION EDITOR */}
                    {activeConnection && (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>סוג קו</Label>
                                    <select value={activeConnection.type} onChange={e => updateSelectedConnection({ type: e.target.value })} className="w-full bg-[#050A18] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]">
                                        {CONNECTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>סגנון</Label>
                                    <select value={activeConnection.style} onChange={e => updateSelectedConnection({ style: e.target.value })} className="w-full bg-[#050A18] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]">
                                        {CONNECTION_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>תווית טקסט</Label>
                                <input 
                                    value={activeConnection.label || ''} 
                                    onChange={e => updateSelectedConnection({ label: e.target.value })} 
                                    placeholder="שם החיבור..." 
                                    className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>צבע הקו</Label>
                                <div className="flex gap-2 flex-wrap">
                                {['#555555', '#00D9FF', '#9D4EDD', '#FF006E', '#10B981', '#ffffff', '#FFA500'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => updateSelectedConnection({ color: c })}
                                        className={cn("w-8 h-8 rounded-full border border-white/10 transition-transform", activeConnection.color === c ? "ring-2 ring-white scale-110" : "hover:scale-105")}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between">
                                    <Label>עובי הקו</Label>
                                    <span className="text-xs text-gray-400">{activeConnection.width}px</span>
                                </div>
                                <Slider 
                                    defaultValue={[activeConnection.width]} 
                                    max={10} 
                                    min={1} 
                                    step={1} 
                                    onValueChange={(vals) => updateSelectedConnection({ width: vals[0] })}
                                    className="py-2"
                                />
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <Button variant="destructive" onClick={deleteSelectedConnection} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="w-4 h-4 ml-2" /> מחק חיבור</Button>
                            </div>
                        </>
                    )}
                 </div>
              </div>
          )}

          {/* Canvas Area */}
          <div 
            ref={editorRef}
            className={cn(
                "flex-1 relative overflow-hidden bg-[#050A18] select-none outline-none h-full",
                interactionMode === 'connect' && "cursor-crosshair",
                isDraggingCanvas && "cursor-grabbing"
            )}
            style={{ 
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: `${40 * scale}px ${40 * scale}px`, 
                backgroundPosition: `${canvasPos.x}px ${canvasPos.y}px`,
                backgroundColor: '#050A18'
            }}
            onMouseDown={(e) => {
                if (e.target === editorRef.current || e.target.tagName === 'svg') {
                setIsDraggingCanvas(true);
                handleCanvasClick();
                }
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={() => setIsDraggingCanvas(false)}
            onMouseLeave={() => setIsDraggingCanvas(false)}
          >
              {/* Zoom/Pan Controls */}
              <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-2 bg-[#0A0E27]/90 p-2 rounded-xl border border-white/10 backdrop-blur shadow-2xl">
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="hover:text-[#00D9FF] hover:bg-white/5"><ZoomIn className="w-5 h-5" /></Button>
                <div className="text-white text-xs py-1 px-2 text-center font-mono select-none border-y border-white/10 bg-black/20">{Math.round(scale * 100)}%</div>
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="hover:text-[#00D9FF] hover:bg-white/5"><ZoomOut className="w-5 h-5" /></Button>
                <div className="w-full h-px bg-white/10 my-1"></div>
                <Button variant="ghost" size="icon" onClick={() => { setCanvasPos({x: window.innerWidth/2, y: window.innerHeight/2}); setScale(1); }} className="hover:text-white hover:bg-white/5"><LayoutGrid className="w-5 h-5" /></Button>
              </div>

              {/* Transform Layer for Content */}
              <div 
                className="absolute top-0 left-0 w-full h-full origin-top-left will-change-transform"
                style={{ 
                    transform: `translate(${canvasPos.x}px, ${canvasPos.y}px) scale(${scale})`,
                    transformOrigin: '0 0'
                }}
              >
                {/* Connections SVG Layer */}
                <svg 
                    className="absolute top-0 left-0 w-full h-full overflow-visible z-0 pointer-events-none"
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    {renderConnections()}
                </svg>

                {/* Nodes Render Layer */}
                {nodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isConnectStart = connectionStartNode?.id === node.id;
                    const safeColor = node.color || '#00D9FF';
                    
                    return (
                    <div
                    key={node.id}
                    onPointerDown={(e) => handleNodePointerDown(e, node)}
                    className={cn(
                        "absolute min-w-[180px] p-4 shadow-lg z-10 group flex flex-col gap-2 backdrop-blur-md transition-shadow duration-200 select-none",
                        node.shape === 'circle' ? "rounded-full aspect-square w-[150px] items-center justify-center text-center" : 
                        node.shape === 'diamond' ? "rotate-45 w-[150px] h-[150px] items-center justify-center" : 
                        node.shape === 'hexagon' ? "hexagon w-[160px] h-[140px] items-center justify-center text-center" : 
                        "rounded-2xl",
                        interactionMode === 'connect' ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing",
                        isSelected ? "ring-2 ring-white z-50 shadow-2xl" : "hover:ring-1 hover:ring-white/30",
                        isConnectStart && "ring-2 ring-[#9D4EDD] ring-offset-4 ring-offset-[#050A18] animate-pulse shadow-[0_0_30px_#9D4EDD]"
                    )}
                    style={{ 
                        left: `${node.x || 0}px`,
                        top: `${node.y || 0}px`,
                        background: `linear-gradient(135deg, ${safeColor}20, ${safeColor}05)`,
                        borderWidth: '2px',
                        borderColor: safeColor,
                        boxShadow: isSelected || isConnectStart ? `0 0 40px ${safeColor}40, inset 0 0 20px ${safeColor}10` : `0 0 15px ${safeColor}10`
                    }}
                    >
                    {/* Inner Content Wrapper */}
                    <div className={cn("w-full h-full flex flex-col items-center justify-center relative", node.shape === 'diamond' && "-rotate-45")}>
                        
                        {/* Floating Emoji */}
                        {node.emoji && (
                            <div className="absolute -top-7 right-1/2 translate-x-1/2 text-3xl z-20 hover:scale-125 transition-transform cursor-pointer drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                                {node.emoji}
                            </div>
                        )}

                        {/* Node Label */}
                        <div className="w-full text-center relative z-10 px-2 pointer-events-none">
                            <span className="text-white font-bold text-sm drop-shadow-md break-words block leading-tight tracking-wide select-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {node.label || "ללא טקסט"}
                            </span>
                            {node.link && (
                                <div className="flex justify-center mt-2 pointer-events-auto">
                                    <a 
                                        href={node.link} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-[10px] text-white/80 hover:text-white bg-black/40 hover:bg-[#00D9FF]/20 rounded-full px-2 py-0.5 inline-flex items-center gap-1 transition-all border border-white/5 hover:border-[#00D9FF]/50"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <LinkIcon className="w-3 h-3" /> קישור
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Hover Actions */}
                        <div className={cn(
                            "flex justify-center gap-1 pt-2 transition-all duration-200 z-20 absolute -bottom-12 left-1/2 -translate-x-1/2 bg-[#0A0E27] p-1.5 rounded-full border border-white/20 shadow-xl scale-90 origin-top", 
                            isSelected ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0"
                        )}>
                            <button onClick={(e) => { e.stopPropagation(); setInteractionMode('connect'); setConnectionStartNode(node); toast({title: "מצב חיבור", description: "לחץ על יעד"}); }} className="p-2 hover:bg-white/10 rounded-full text-[#9D4EDD] transition-colors" title="חבר"><Zap className="w-4 h-4" /></button>
                        </div>
                    </div>
                    </div>
                    );
                })}
              </div>
          </div>
       </div>
    </div>
  );
};

export default MindMap;
