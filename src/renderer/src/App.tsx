import Tiptap from './components/Tiptap'

function App(): JSX.Element {
  const handleHideClick = (): void => {
    window.electron.ipcRenderer.send('hide-window')
  }

  return (
    <div className="app">
      <div className="app-drag-region">
        <h1>Floating notes</h1>
        <div onClick={handleHideClick} className="hide-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M18.36 19.78L12 13.41l-6.36 6.37l-1.42-1.42L10.59 12L4.22 5.64l1.42-1.42L12 10.59l6.36-6.36l1.41 1.41L13.41 12l6.36 6.36z"
            />
          </svg>
        </div>
      </div>
      <Tiptap />
    </div>
  )
}

export default App
