import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const extensions = [StarterKit]
const content = ''

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
    editable: true,
    autofocus: true
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}

export default Tiptap
