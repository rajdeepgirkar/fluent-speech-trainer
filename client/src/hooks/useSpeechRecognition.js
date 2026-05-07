import { useState, useRef, useCallback } from 'react';
import { normalizeToken, evaluateWords } from '../utils/speechUtils';

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState({ final: '', interim: '' });

  const recognitionRef = useRef(null);
  const finalRef = useRef('');
  const startTimeRef = useRef(null);
  const wordsSpokenRef = useRef(0);
  const callbacksRef = useRef({});

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const initRecognition = useCallback(() => {
    if (!isSupported) return false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      let interimText = '';
      let newFinal = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) newFinal += t + ' ';
        else interimText += t;
      }
      if (newFinal) finalRef.current += newFinal;
      const combined = finalRef.current + interimText;
      wordsSpokenRef.current = combined.split(/\s+/).filter(Boolean).length;
      setTranscript({ final: finalRef.current, interim: interimText });
      callbacksRef.current.onTranscript?.(finalRef.current, interimText, combined);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        callbacksRef.current.onError?.(event.error);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isSupported]);

  const start = useCallback(() => {
    if (!recognitionRef.current && !initRecognition()) return false;
    try {
      finalRef.current = '';
      startTimeRef.current = null;
      wordsSpokenRef.current = 0;
      setTranscript({ final: '', interim: '' });
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (e) {
      if (e.name === 'InvalidStateError') { setIsListening(true); return true; }
      return false;
    }
  }, [initRecognition]);

  const stop = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  const getWPM = useCallback(() => {
    if (!startTimeRef.current || wordsSpokenRef.current === 0) return 0;
    return Math.round(wordsSpokenRef.current / ((Date.now() - startTimeRef.current) / 60000));
  }, []);

  const getFullTranscript = useCallback(() => finalRef.current + transcript.interim, [transcript]);

  const setCallbacks = useCallback((cbs) => { callbacksRef.current = cbs; }, []);

  const reset = useCallback(() => {
    finalRef.current = '';
    startTimeRef.current = null;
    wordsSpokenRef.current = 0;
    setTranscript({ final: '', interim: '' });
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
  }, []);

  return { isSupported, isListening, transcript, start, stop, reset, getWPM, getFullTranscript, setCallbacks };
}
