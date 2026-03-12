import 'bootstrap/dist/css/bootstrap.min.css';
import { lazy, Suspense } from 'react'
import './App.css'
const ImageUploader = lazy(() => import("./components/ImageUploader"));
const CropTool = lazy(() => import("./components/CropTool"));
const Rotate = lazy(() => import("./components/Rotate"));
const HistoryControls = lazy(() => import("./components/HistoryControls"));
const ExportControls = lazy(() => import("./components/ExportContorls"));
const DeleteButton = lazy(() => import("./components/DeleteButton"));
const Annotations = lazy(() => import("./components/Annotations"));
const ZoomControls = lazy(() => import("./components/ZoomControls"));
const LayerControls = lazy(() => import("./components/LayerControls"));
const PanControls = lazy(() => import("./components/PanControls"));
const CanvasBox = lazy(() => import('./components/CanvasBox'));

const App = () => {
  return (
    <main className="app-root">
      <div className="editor-layout">
        <header className="editor-header">
          <div className="brand">
            <h1 className="outfit">Optimum Canvas</h1>
            <p>Pro Image Editor</p>
          </div>
          <div className="header-actions">
            <Suspense fallback={null}>
              <HistoryControls />
              <ExportControls />
            </Suspense>
          </div>
        </header>

        <aside className="editor-sidebar">
          <Suspense fallback={null}>
            <ImageUploader />
            <CropTool />
            <Annotations />
            <Rotate />
            <div className="sidebar-divider" />
            <ZoomControls />
            <PanControls />
            <LayerControls />
            <DeleteButton />
          </Suspense>
        </aside>

        <section className="canvas-area">
          <Suspense fallback={<div className="text-center text-muted outfit">Initializing Workspace...</div>}>
            <CanvasBox />
          </Suspense>
        </section>
      </div>
    </main>
  )
}

export default App
