import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import RichTextEditor from '../components/editor/RichTextEditor';
import { Moon, Sun, FileText, Plus, LogOut, Download, Trash2, LogIn, UserPlus, CloudOff, User, Edit2 } from 'lucide-react';

interface DashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const Dashboard = ({ isDarkMode, setIsDarkMode }: DashboardProps) => {
  const { isAuthenticated, logout, username } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    } else {
      setSessions([]);
      setActiveSession(null);
    }
  }, [isAuthenticated]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      const sortedSessions = response.data.sort((a: any, b: any) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setSessions(sortedSessions);

      const guestDraft = localStorage.getItem('vinotes-guest-draft');
      if (!activeSession) {
        if (guestDraft) {
          setActiveSession(null);
        } else if (sortedSessions.length > 0) {
          setActiveSession(sortedSessions[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  const handleNewDocument = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActiveSession(null); 
  };

  const startEditing = (session: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditingId(session._id);
    setEditTitle(session.title || 'Untitled Document');
  };

  const submitRename = async (id: string, e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await api.put(`/sessions/${id}`, { title: editTitle });
      
      setSessions(prev => prev.map(s => s._id === id ? { ...s, title: editTitle } : s));
      
      if (activeSession?._id === id) {
        setActiveSession({ ...activeSession, title: editTitle });
      }
      
      setEditingId(null);
    } catch (error) {
      console.error("Failed to rename session", error);
      setEditingId(null);
    }
  };

  const handleDownload = (session: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const tmp = document.createElement("DIV");
    tmp.innerHTML = session.content;
    const plainText = tmp.textContent || tmp.innerText || "Empty Document";
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (session.title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeTitle}.txt`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      if (activeSession?._id === id) {
        setActiveSession(null); 
      }
    } catch (error) {
      console.error("Failed to delete session", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-10 shadow-sm">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <FileText className="text-blue-600" size={20} />
            <span>Vi-Notes</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* New Document Button */}
        <div className="p-4">
          <button 
            onClick={handleNewDocument}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={18} /> New Document
          </button>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2 mt-2">
            {isAuthenticated ? 'Recent Files' : 'Cloud Sync Off'}
          </p>
          {isAuthenticated ? (
            sessions.map((session) => (
              <div 
                key={session._id}
                onClick={() => {
                  if (editingId !== session._id) setActiveSession(session);
                }}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors ${
                  activeSession?._id === session._id 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {editingId === session._id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(session._id, e);
                      if (e.key === 'Escape') setEditingId(null); // Cancel on Esc
                    }}
                    onBlur={(e) => submitRename(session._id, e as any)} // Save when clicking away
                    onClick={(e) => e.stopPropagation()} // Don't trigger outer div clicks
                    className="flex-1 bg-white dark:bg-gray-800 text-sm px-2 py-1 mr-2 border border-blue-500 rounded outline-none w-full"
                  />
                ) : (
                  <span className="truncate flex-1 pr-2 font-medium">
                    {session.title || 'Untitled Document'}
                  </span>
                )}

                {/* Hover Action Icons */}
                <div className="hidden group-hover:flex items-center gap-1">
                  
                  {/* 👇 Rename Button */}
                  <button 
                    onClick={(e) => startEditing(session, e)} 
                    className="text-gray-500 hover:text-green-500"
                    title="Rename"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button 
                    onClick={(e) => handleDownload(session, e)} 
                    className="text-gray-500 hover:text-blue-500"
                    title="Download as TXT"
                  >
                    <Download size={14} />
                  </button>

                  <button 
                    onClick={(e) => handleDelete(session._id, e)} 
                    className="text-gray-500 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
              <CloudOff size={24} className="text-gray-400 dark:text-gray-600 opacity-50" />
              <p>Your work is currently unsaved.</p>
              <p>Log in to save this document and access multiple files.</p>
            </div>
          )}
        </div>

        {/* Footer: Profile / Login */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2 bg-gray-50/50 dark:bg-gray-900/50">
          {isAuthenticated ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-1.5 rounded-full shrink-0">
                  <User size={18} />
                </div>
                <span className="text-sm font-semibold truncate text-gray-700 dark:text-gray-200">
                  {username || 'Author'}
                </span>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 w-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 py-2 rounded-lg text-sm font-medium">
                <LogIn size={18} /> Log In
              </button>
              <button onClick={() => navigate('/register')} className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black py-2 rounded-lg text-sm font-medium">
                <UserPlus size={18} /> Sign Up
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Editor Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <RichTextEditor 
            activeSession={activeSession} 
            onSaveSuccess={fetchSessions} 
          />
        </div>
      </main>

    </div>
  );
};

export default Dashboard;