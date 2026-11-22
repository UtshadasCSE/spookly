import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscript: (text: string) => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const isExplicitStopRef = useRef<boolean>(false);

  useEffect(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalizedAddition = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            finalizedAddition += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        if (finalizedAddition) {
          setTranscript((prev) => {
            const combined = (prev ? prev.trim() + ' ' : '') + finalizedAddition.trim();
            return combined;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'no-speech') {
          // Normal when user pauses or hasn't started talking yet
          return;
        }
        if (event.error === 'not-allowed') {
          setError('Microphone access for speech recognition was denied. Please allow microphone permissions.');
        } else if (event.error === 'network') {
          setError('Network issue with speech recognition service. Please check your internet connection.');
        } else {
          setError(`Speech recognition encountered an issue: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        // If not stopped intentionally and continuous recognition should continue, could restart;
        // but keeping it simple and stable:
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to initialize SpeechRecognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript('');
    isExplicitStopRef.current = false;

    if (!recognitionRef.current) {
      if (!isSupported) {
        setError('Browser speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      }
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      // If already started, ignore error
      if (err.name !== 'InvalidStateError') {
        console.error('Failed to start speech recognition:', err);
        setError('Could not start speech recognition. Please try again.');
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    stopListening();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stopListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
