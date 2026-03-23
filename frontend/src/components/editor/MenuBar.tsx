import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, Heading3, Undo, Redo, Type
} from 'lucide-react';
import '@tiptap/starter-kit';


interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  const getButtonClass = (isActive: boolean) => {
    return `p-2 rounded-md transition-colors duration-200 flex items-center justify-center ${
      isActive 
        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={getButtonClass(editor.isActive('underline'))}
        title="Underline"
      >
        <UnderlineIcon size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={getButtonClass(editor.isActive('paragraph'))}
        title="Normal Text"
      >
        <Type size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={`${getButtonClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={`${getButtonClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default MenuBar;