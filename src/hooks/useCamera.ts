import { useState, useEffect, useRef, useCallback } from 'react';

export interface CameraState {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
  isChecking: boolean;
  hasPermissions: boolean;
  error: string | null;
  startDevices: () => Promise<boolean>;
  stopDevices: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  checkAvailability: () => Promise<{ hasVideo: boolean; hasAudio: boolean }>;
}

export function useCamera(): CameraState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep streamRef in sync
  useEffect(() => {
    streamRef.current = stream;
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const checkAvailability = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { hasVideo: false, hasAudio: false };
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((d) => d.kind === 'videoinput');
      const hasAudio = devices.some((d) => d.kind === 'audioinput');
      return { hasVideo, hasAudio };
    } catch {
      return { hasVideo: false, hasAudio: false };
    }
  }, []);

  const startDevices = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera and microphone are not supported in your current browser environment. Please use a modern browser like Chrome, Edge, or Safari.'
      );
      setIsChecking(false);
      return false;
    }

    try {
      // Check device availability first
      const { hasVideo, hasAudio } = await checkAvailability();
      if (!hasVideo && !hasAudio) {
        setError('No camera or microphone found on your device. Please connect a webcam or headset.');
        setIsChecking(false);
        return false;
      }

      // Stop any existing tracks before requesting a new stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: hasVideo
          ? {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            }
          : false,
        audio: true,
      });

      setStream(mediaStream);
      setHasPermissions(true);
      setIsCameraOn(mediaStream.getVideoTracks().some((t) => t.enabled));
      setIsMicOn(mediaStream.getAudioTracks().some((t) => t.enabled));
      setIsChecking(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return true;
    } catch (err: any) {
      console.warn('Media devices request error:', err);
      let message = 'Could not access camera or microphone.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message =
          'Camera and microphone access was denied. Please allow permissions in your browser settings (look for the lock or camera icon in the address bar) and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message =
          'No camera or microphone found. Please connect your devices and reload the page.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message =
          'Your camera or microphone is already in use by another application. Please close other video calls and retry.';
      }

      setError(message);
      setHasPermissions(false);
      setIsChecking(false);
      return false;
    }
  }, [checkAvailability]);

  const stopDevices = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;
    const videoTracks = streamRef.current.getVideoTracks();
    if (videoTracks.length === 0) return;

    const nextState = !isCameraOn;
    videoTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setIsCameraOn(nextState);
  }, [isCameraOn]);

  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return;

    const nextState = !isMicOn;
    audioTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setIsMicOn(nextState);
  }, [isMicOn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    stream,
    videoRef,
    isCameraOn,
    isMicOn,
    isChecking,
    hasPermissions,
    error,
    startDevices,
    stopDevices,
    toggleCamera,
    toggleMic,
    checkAvailability,
  };
}
