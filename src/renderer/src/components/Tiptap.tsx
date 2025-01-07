import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
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

  return (
    <>
      <div className="app-drag-region">
        <h1>Floating notes</h1>
      </div>
      <EditorContent editor={editor} />
      {/* <FloatingMenu editor={editor}></FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </>
  )
}

export default Tiptap
