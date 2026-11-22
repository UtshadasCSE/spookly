import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseMediaRecorderReturn {
  isRecording: boolean;
  videoUrl: string | null;
  recordedDuration: number;
  startRecording: () => void;
  stopRecording: () => Promise<string | null>;
  resetRecording: () => void;
  getDuration: () => number;
}

export function useMediaRecorder(stream: MediaStream | null): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(stream);
  const videoUrlRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const pendingStopPromiseRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  // Keep videoUrlRef in sync
  useEffect(() => {
    videoUrlRef.current = videoUrl;
  }, [videoUrl]);

  const getSupportedMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
    ];
    for (const type of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      } catch {
        // ignore check errors
      }
    }
    return undefined;
  };

  const startRecording = useCallback(() => {
    const activeStream = streamRef.current;
    if (!activeStream) {
      console.warn('startRecording: No active stream available');
      return;
    }

    // Ensure all media tracks are enabled for recording
    activeStream.getTracks().forEach((track) => {
      track.enabled = true;
    });

    // Ensure any existing recording is stopped first
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Reset chunks and timer for fresh recording
    chunksRef.current = [];
    pendingStopPromiseRef.current = null;
    startTimeRef.current = Date.now();
    durationRef.current = 0;
    setRecordedDuration(0);

    // Revoke previous object URL to avoid memory leaks
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
      setVideoUrl(null);
    }

    try {
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(activeStream, options);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event: Event) => {
        console.warn('MediaRecorder error:', event);
      };

      // Start recording without timeslice to produce complete, unfragmented keyframe clusters
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to create/start MediaRecorder:', err);
      // Fallback: try default without options if specified mimeType failed
      try {
        const recorder = new MediaRecorder(activeStream);
        recorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (fallbackErr) {
        console.error('MediaRecorder fallback start failed:', fallbackErr);
      }
    }
  }, []);

  const stopRecording = useCallback((): Promise<string | null> => {
    // Calculate elapsed duration in seconds
    if (startTimeRef.current > 0) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      durationRef.current = elapsed;
      setRecordedDuration(elapsed);
    }

    // If a stop operation is already in progress, return that exact promise
    if (pendingStopPromiseRef.current) {
      return pendingStopPromiseRef.current;
    }

    const recorder = mediaRecorderRef.current;

    // If recorder is not active, return whatever URL was already recorded
    if (!recorder || recorder.state === 'inactive') {
      setIsRecording(false);
      return Promise.resolve(videoUrlRef.current);
    }

    const stopPromise = new Promise<string | null>((resolve) => {
      recorder.onstop = () => {
        setIsRecording(false);
        pendingStopPromiseRef.current = null;

        if (chunksRef.current.length > 0) {
          try {
            const mime = recorder.mimeType || 'video/webm';
            const blob = new Blob(chunksRef.current, { type: mime });
            const url = URL.createObjectURL(blob);
            videoUrlRef.current = url;
            setVideoUrl(url);
            resolve(url);
          } catch (e) {
            console.error('Failed to create video Blob URL:', e);
            resolve(videoUrlRef.current);
          }
        } else {
          console.warn('stopRecording: chunksRef is empty');
          resolve(videoUrlRef.current);
        }
      };

      try {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        } else {
          setIsRecording(false);
          pendingStopPromiseRef.current = null;
          resolve(videoUrlRef.current);
        }
      } catch (err) {
        console.warn('Error while stopping MediaRecorder:', err);
        setIsRecording(false);
        pendingStopPromiseRef.current = null;
        resolve(videoUrlRef.current);
      }
    });

    pendingStopPromiseRef.current = stopPromise;
    return stopPromise;
  }, []);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
    chunksRef.current = [];
    pendingStopPromiseRef.current = null;
    startTimeRef.current = 0;
    durationRef.current = 0;
    setIsRecording(false);
    setVideoUrl(null);
    setRecordedDuration(0);
  }, []);

  const getDuration = useCallback(() => {
    return durationRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    videoUrl,
    recordedDuration,
    startRecording,
    stopRecording,
    resetRecording,
    getDuration,
  };
}
