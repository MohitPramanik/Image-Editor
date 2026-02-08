import { Canvas } from 'fabric';
import { useEffect, useRef, useState } from 'react'
import './App.css'
import ImageUploader from './components/ImageUploader';
import CropImage from './components/CropImage';
import Rotate from './components/Rotate';
import HistoryControls from './components/HistoryControls';
import ExportControls from './components/ExportContorls';
import DeleteButton from './components/DeleteButton';
import Annotations from './components/Annotations';

const App = () => {

  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let initCanvas = new Canvas(canvasRef.current, {
      height: 500,
      width: 500
    });

    initCanvas.backgroundColor = "#fff";
    initCanvas.renderAll();

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    }
  }, [])

  return (
    <div className="app-root">
      <div className="container py-4">
        <div className="editor-card">
          <div className="editor-header">
            <div>
              <div className="eyebrow">Image Editor</div>
              <h1>Quick edits, clean exports</h1>
              <p>Crop, rotate, annotate, and export without leaving the page.</p>
            </div>
          </div>

          <div className="editor-controls">
            <ImageUploader canvas={canvas} />
            <CropImage canvas={canvas} />
            {/* <Annotations canvas={canvas} /> */}
            <Rotate canvas={canvas} />
            <HistoryControls canvas={canvas} />
            <ExportControls canvas={canvas} />
            <DeleteButton canvas={canvas} />
          </div>

          <div className="canvas-shell">
            <canvas id='canvas' ref={canvasRef} className='editor-canvas' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
