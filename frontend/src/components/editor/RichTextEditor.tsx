import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Cloud, CloudLightning, CloudOff, AlertCircle } from 'lucide-react';
import MenuBar from './MenuBar';
import { useAuth, api } from '../../context/AuthContext';

const GUEST_CACHE_KEY = 'vinotes-guest-draft';
const DEFAULT_CONTENT = `<h1>Vi-Notes Document</h1><p>Start writing your content here...</p>`;

interface RichTextEditorProps {
  activeSession: any | null;
  onSaveSuccess: () => void;
}

const RichTextEditor = ({ activeSession, onSaveSuccess }: RichTextEditorProps) => {
  const { isAuthenticated } = useAuth();
  
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState(() => localStorage.getItem(GUEST_CACHE_KEY) || DEFAULT_CONTENT);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    onUpdate: ({ editor }) => {
      const currentHtml = editor.getHTML();
      setContent(currentHtml);
      if (!isAuthenticated) localStorage.setItem(GUEST_CACHE_KEY, currentHtml);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert focus:outline-none max-w-none min-h-[500px] p-8 md:px-12 md:py-8',
      },
    },
  });

  useEffect(() => {
    if (activeSession) {
      setSessionId(activeSession._id);
      setTitle(activeSession.title || 'Untitled Document');
      editor?.commands.setContent(activeSession.content);
      setContent(activeSession.content);
    } else {
      setSessionId(null);
      setTitle('Untitled Document');
      const newContent = isAuthenticated ? DEFAULT_CONTENT : (localStorage.getItem(GUEST_CACHE_KEY) || DEFAULT_CONTENT);
      editor?.commands.setContent(newContent);
      setContent(newContent);
    }
  }, [activeSession?._id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !content) return;

    const delayDebounceFn = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        if (sessionId) {
          await api.put(`/sessions/${sessionId}`, { title, content, status: 'draft' });
          setSaveStatus('saved');
          onSaveSuccess(); 
        } else {
          const response = await api.post('/sessions/draft', { title, content });
          setSessionId(response.data._id); 
          setSaveStatus('saved');
          localStorage.removeItem(GUEST_CACHE_KEY);
          onSaveSuccess(); 
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [content, title, isAuthenticated, sessionId]);

  const renderSaveStatus = () => {
    if (!isAuthenticated) return <div className="flex items-center gap-1 text-gray-500"><CloudOff size={14} /> Local</div>;
    if (saveStatus === 'saving') return <div className="flex items-center gap-1 text-blue-500"><CloudLightning size={14} /> Saving...</div>;
    if (saveStatus === 'saved') return <div className="flex items-center gap-1 text-green-500"><Cloud size={14} /> Saved</div>;
    if (saveStatus === 'error') return <div className="flex items-center gap-1 text-red-500"><AlertCircle size={14} /> Error</div>;
    return <div className="flex items-center gap-1 text-gray-500"><Cloud size={14} /> Synced</div>;
  };

  return (
    <div className="w-full mx-auto flex flex-col shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden h-full min-h-[70vh]">
      

      <div className="flex justify-between items-center pr-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <MenuBar editor={editor} />
        <div className="text-xs font-medium">{renderSaveStatus()}</div>
      </div>
      
      <div className="flex-1 overflow-y-auto cursor-text bg-white dark:bg-gray-900" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;