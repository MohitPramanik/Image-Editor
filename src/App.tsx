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
      <div className="container-md py-4">
        <div className="editor-card p-3">
          <div className="editor-header">
            <div>
              <div className="eyebrow">Image Editor</div>
              <h1>Quick edits, clean exports</h1>
              <p>Crop, rotate, annotate, and export without leaving the page.</p>
            </div>
          </div>

          <Suspense fallback={null}>
            <div className="editor-controls">
              <ImageUploader />
              <CropTool />
              <Annotations />
              <ZoomControls />
              <PanControls />
              <LayerControls />
              <Rotate />
              <HistoryControls />
              <ExportControls />
              <DeleteButton />
            </div>
          </Suspense>

          <Suspense fallback={<div className="my-4 mx-3 text-center fw-bold fs-2">Loading ...</div>}>
            <CanvasBox />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export default App
