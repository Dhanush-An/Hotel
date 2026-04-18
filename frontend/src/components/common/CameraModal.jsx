import React, { useRef, useState } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';

export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = s;
      setStream(s);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
    }
  };

  const capture = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 400, 300);
    const data = canvasRef.current.toDataURL('image/jpeg');
    setImg(data);
    stream.getTracks().forEach(track => track.stop());
  };

  const handleDone = () => {
    onCapture(img);
    onClose();
  };

  React.useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1c1c24] rounded-[40px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        
        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-6">Verify Identity</h3>
        
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-[#13131a] rounded-3xl overflow-hidden border-4 border-gray-50 dark:border-[#2a2a35]">
           {!img ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
           ) : (
              <img src={img} className="w-full h-full object-cover" alt="captured" />
           )}
           <canvas ref={canvasRef} width="400" height="300" className="hidden" />
        </div>

        <div className="mt-8 flex gap-4">
           {!img ? (
              <button 
                onClick={capture}
                className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                 <Camera size={18} /> Capture Photo
              </button>
           ) : (
              <>
                <button 
                  onClick={() => { setImg(null); startCamera(); }}
                  className="p-4 bg-gray-100 dark:bg-[#2a2a35] text-gray-400 rounded-2xl transition-all"
                >
                   <RefreshCw size={20} />
                </button>
                <button 
                  onClick={handleDone}
                  className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                   <Check size={18} /> Confirm Photo
                </button>
              </>
           )}
        </div>
      </div>
    </div>
  );
}
