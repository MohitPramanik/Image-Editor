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
import ZoomControls from './components/ZoomControls';
import LayerControls from './components/LayerControls';
import PanControls from './components/PanControls';

const App = () => {

  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasShellRef = useRef<HTMLDivElement | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    let initCanvas = new Canvas(canvasRef.current, {
      height: 500,
      width: 800,
      targetFindTolerance: 12,
      perPixelTargetFind: true
    });

    initCanvas.backgroundColor = "#fff";
    initCanvas.allowTouchScrolling = true;
    initCanvas.renderAll();

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    }
  }, [])

  useEffect(() => {
    if (!canvas) return;
    if (isPanning) {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.skipTargetFind = true;
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
    } else {
      canvas.skipTargetFind = false;
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
    }
    canvas.requestRenderAll();
  }, [canvas, isPanning]);

  useEffect(() => {
    const shell = canvasShellRef.current;
    if (!shell) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!isPanning) return;
      isDown = true;
      startX = e.clientX;
      scrollLeft = shell.scrollLeft;
      shell.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown || !isPanning) return;
      const dx = e.clientX - startX;
      shell.scrollLeft = scrollLeft - dx;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      shell.releasePointerCapture?.(e.pointerId);
    };

    shell.addEventListener('pointerdown', onPointerDown);
    shell.addEventListener('pointermove', onPointerMove);
    shell.addEventListener('pointerup', onPointerUp);
    shell.addEventListener('pointercancel', onPointerUp);

    return () => {
      shell.removeEventListener('pointerdown', onPointerDown);
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerup', onPointerUp);
      shell.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isPanning]);

  useEffect(() => {
    canvas?.setDimensions({
      height: 500,
      width: 800
    })
  }, [canvas])

  return (
    <div className="app-root">
      <div className="container-md py-4">
        <div className="editor-card p-3">
          <div className="editor-header">
            <div>
              <div className="eyebrow">Image Editor</div>
              <h1>Quick edits, clean exports</h1>
              <p>Crop, rotate, annotate, and export without leaving the page.</p>
            </div>
          </div>

          <div className="editor-controls">
            <ImageUploader canvas={canvas} />
            <CropImage canvas={canvas} isCropping={isCropping} setIsCropping={setIsCropping} />
            <Annotations canvas={canvas} />
            <ZoomControls canvas={canvas} />
            <PanControls isPanning={isPanning} setIsPanning={setIsPanning} />
            <LayerControls canvas={canvas} />
            <Rotate canvas={canvas} isCropping={isCropping} />
            <HistoryControls canvas={canvas} />
            <ExportControls isCropping={isCropping} canvas={canvas} />
            <DeleteButton canvas={canvas} />
          </div>

          <div className={`border border-2 border-secondary rounded-3 overflow-hidden d-flex justify-content-center ${isPanning ? 'is-panning' : ''}`} ref={canvasShellRef}>
            <canvas id='canvas' ref={canvasRef} className='editor-canvas' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
