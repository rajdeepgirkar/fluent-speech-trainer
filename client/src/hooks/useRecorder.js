import { useState, useRef, useCallback } from 'react';

export default function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const init = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return true;
    } catch {
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      const ok = await init();
      if (!ok) return false;
    }
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioURL(url);
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setIsRecording(true);
    return true;
  }, [init]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const downloadRecording = useCallback(() => {
    if (!audioURL) return;
    const a = document.createElement('a');
    a.href = audioURL;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
  }, [audioURL]);

  const reset = useCallback(() => {
    setAudioURL(null);
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return { isRecording, audioURL, audioBlob, init, startRecording, stopRecording, downloadRecording, reset };
}
