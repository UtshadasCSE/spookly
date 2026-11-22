import React, { useEffect } from 'react';
import { Camera, CameraOff, Mic, MicOff, AlertCircle, RefreshCw } from 'lucide-react';
import { SpooklyCursorBadge } from '../ui';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream?: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  isListening: boolean;
  isEvaluating?: boolean;
  error: string | null;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onRetryPermissions?: () => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  stream,
  isCameraOn,
  isMicOn,
  isListening,
  isEvaluating = false,
  error,
  onToggleCamera,
  onToggleMic,
  onRetryPermissions,
}) => {
  // Ensure stream is attached to the video DOM element whenever mounted or stream updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Ignore normal abort errors during unmount/reload
          if (err.name !== 'AbortError') {
            console.warn('Video auto-play prevented:', err);
          }
        });
      }
    }
  }, [stream, isCameraOn, videoRef]);

  const hasVideoTrack = Boolean(
    stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks().some((t) => t.enabled)
  );

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Floating Figma-style cursor label: YOUR CAMERA */}
      <div className="flex items-center justify-between">
        <SpooklyCursorBadge name="YOUR CAMERA" color="#c8ff29" />
        <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider">
          LIVE PREVIEW
        </span>
      </div>

      {/* Video Container with Figma-style border and handles */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-sm overflow-hidden bg-[#171717] border-2 border-[#171717] shadow-[3px_3px_0px_0px_#171717] flex items-center justify-center">
        {/* Figma Corner Handles */}
        <span className="figma-handle -top-[4px] -left-[4px] z-30" />
        <span className="figma-handle -top-[4px] -right-[4px] z-30" />
        <span className="figma-handle -bottom-[4px] -left-[4px] z-30" />
        <span className="figma-handle -bottom-[4px] -right-[4px] z-30" />

        {/* Live Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }}
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-200 ${
            isCameraOn && !error ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Camera Off / Paused State */}
        {!error && (!isCameraOn || !hasVideoTrack) && (
          <div className="flex flex-col items-center justify-center text-center p-6 text-neutral-400 z-10">
            <div className="w-12 h-12 rounded-sm bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-3">
              <CameraOff className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-200">
              Camera Preview Off
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-[220px]">
              Microphone is active. Click below to enable your camera feed.
            </p>
            <button
              onClick={onToggleCamera}
              className="mt-3 px-3 py-1.5 text-[11px] font-mono font-bold uppercase bg-[#c8ff29] text-[#171717] border border-[#171717] rounded-xs hover:bg-[#b5f015] shadow-[1px_1px_0px_0px_#ffffff] transition"
            >
              Turn Camera On
            </button>
          </div>
        )}

        {/* Camera Permission Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-neutral-950/95 absolute inset-0 z-20">
            <div className="w-10 h-10 rounded-sm bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-[#c8ff29]" />
            </div>
            <p className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
              Camera Access Required
            </p>
            <p className="text-[11px] text-neutral-400 max-w-xs leading-relaxed mb-3">
              {error}
            </p>
            {onRetryPermissions && (
              <button
                onClick={onRetryPermissions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase bg-[#c8ff29] text-[#171717] border border-[#171717] rounded-xs hover:bg-[#b5f015] transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Access
              </button>
            )}
          </div>
        )}

        {/* Top-Left Recording / Status Indicator */}
        <div className="absolute top-3 left-3 z-20">
          {isListening ? (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#c8ff29] text-[#171717] text-xs font-mono font-bold border border-[#171717] shadow-[2px_2px_0px_0px_#171717]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#171717] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#171717]"></span>
              </span>
              RECORDING SPEECH
            </div>
          ) : isEvaluating ? (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-white text-[#171717] text-xs font-mono font-bold border border-[#171717]">
              <RefreshCw className="w-3 h-3 animate-spin text-[#171717]" />
              AI EVALUATING
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-black/80 text-white text-[10px] font-mono font-bold border border-neutral-700 backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8ff29]"></span>
              READY TO SPEAK
            </div>
          )}
        </div>

        {/* Top-Right Microphone Status Badge */}
        <div className="absolute top-3 right-3 z-20">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xs text-[10px] font-mono font-bold border ${
              isMicOn
                ? 'bg-black/80 text-white border-neutral-700'
                : 'bg-rose-500 text-white border-[#171717]'
            }`}
          >
            {isMicOn ? (
              <>
                <Mic className="w-3 h-3 text-[#c8ff29]" />
                MIC ON
              </>
            ) : (
              <>
                <MicOff className="w-3 h-3 text-white" />
                MIC MUTED
              </>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar beneath camera */}
      <div className="flex items-center justify-between p-3 rounded-sm bg-white border border-[#171717] shadow-[2px_2px_0px_0px_#171717]">
        <div className="flex items-center gap-2">
          {/* Toggle Camera button */}
          <button
            onClick={onToggleCamera}
            title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase transition border border-[#171717] ${
              isCameraOn
                ? 'bg-white text-[#171717] hover:bg-neutral-100'
                : 'bg-[#171717] text-[#c8ff29]'
            }`}
          >
            {isCameraOn ? (
              <>
                <Camera className="w-3.5 h-3.5 text-neutral-600" />
                CAMERA ON
              </>
            ) : (
              <>
                <CameraOff className="w-3.5 h-3.5 text-[#c8ff29]" />
                CAMERA OFF
              </>
            )}
          </button>

          {/* Toggle Mic button */}
          <button
            onClick={onToggleMic}
            title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase transition border border-[#171717] ${
              isMicOn
                ? 'bg-white text-[#171717] hover:bg-neutral-100'
                : 'bg-rose-500 text-white'
            }`}
          >
            {isMicOn ? (
              <>
                <Mic className="w-3.5 h-3.5 text-neutral-600" />
                MIC ACTIVE
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-white" />
                MUTED
              </>
            )}
          </button>
        </div>

        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
          CONTROLS
        </span>
      </div>
    </div>
  );
};
