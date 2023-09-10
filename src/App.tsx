import { Input, Spacer } from "@nextui-org/react";
import { type ChangeEvent, useCallback, useState } from "react";
import Footer from "./components/Footer";
import Form from "./components/Form";
import List from "./components/List";
import VoiceSelector from "./components/VoiceSelector";
import { type Script } from "./types";

export default function App() {
  const [voiceInterval, setVoiceInterval] = useState(30);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleChangeVoiceInterval = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setVoiceInterval(Number(e.target.value.replace(/[^0-9]/g, "")));
    },
    []
  );

  const handleStart = useCallback(async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const synth = window.speechSynthesis;

    for (let i = 0; i < scripts.length; i++) {
      const utterance = new SpeechSynthesisUtterance(scripts[i].text);
      utterance.voice = synth.getVoices()[selectedVoice];
      synth.speak(utterance);
      await new Promise((resolve) => {
        utterance.onend = () => setTimeout(resolve, voiceInterval * 1000);
      }).finally(() => {
        if (i === scripts.length - 1) setIsSpeaking(false);
      });
    }
  }, [isSpeaking, scripts, selectedVoice, voiceInterval]);

  const handleDeleteScript = useCallback(
    (index: number) => {
      if (isSpeaking) return;
      setScripts((p) => p.filter((_, i) => i !== index));
    },
    [isSpeaking]
  );

  return (
    <main className='container pt-4 pb-14'>
      <VoiceSelector
        selected={selectedVoice}
        setSelected={setSelectedVoice}
        isSpeaking={isSpeaking}
      />
      <Spacer y={4} />
      <Input
        label='Interval in Scripts(seconds)'
        inputMode='decimal'
        value={String(voiceInterval)}
        isDisabled={isSpeaking}
        maxLength={3}
        onChange={handleChangeVoiceInterval}
      />
      <Spacer y={4} />
      <Form isSpeaking={isSpeaking} setScripts={setScripts} />
      <List scripts={scripts} handleDeleteScript={handleDeleteScript} />
      <Footer
        handleStart={handleStart}
        isDisabled={scripts.length === 0}
        isSpeaking={isSpeaking}
      />
    </main>
  );
}
