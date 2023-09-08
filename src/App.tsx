import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import "./App.css";

type Script = {
  text: string;
  createdAt: Date;
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [voiceInterval, setVoiceInterval] = useState(30);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  if (!window.speechSynthesis) {
    return <span>Aw... your browser does not support Speech Synthesis</span>;
  }

  const handleSubmit = (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    if (isSpeaking) return;
    if (inputValue.trim() === "") return;
    setScripts([...scripts, { text: inputValue, createdAt: new Date() }]);
    setInputValue("");
  };

  return (
    <main className='container'>
      <div className='form-field-wrap'>
        <label htmlFor='voice-select'>Select Voice</label>
        <VoiceSelector
          selected={selectedVoice}
          setSelected={setSelectedVoice}
          isSpeaking={isSpeaking}
        />
      </div>
      <div className='form-field-wrap'>
        <label htmlFor='voice-interval'>Interval in Scripts(seconds)</label>
        <input
          inputMode='decimal'
          value={voiceInterval}
          disabled={isSpeaking}
          maxLength={3}
          onChange={(e) =>
            setVoiceInterval(Number(e.target.value.replace(/[^0-9]/g, "")))
          }
        />
      </div>

      <form onSubmit={handleSubmit} className='sub-container'>
        <div className='form-field-wrap'>
          <label htmlFor='input'>Input</label>
          <textarea
            id='input'
            placeholder='Fill in the script'
            value={inputValue}
            maxLength={500}
            spellCheck={false}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                handleSubmit(e);
              }
            }}
          />
        </div>
        <button
          type='submit'
          className='block-button'
          disabled={inputValue.trim() === "" || isSpeaking}
        >
          Add
        </button>
      </form>
      {scripts.length > 0 && (
        <fieldset>
          <legend>Scripts</legend>
          <ol className='scripts'>
            {scripts.map((v) => (
              <li key={v.createdAt.getTime()}>
                <p>{v.text}</p>
              </li>
            ))}
          </ol>
        </fieldset>
      )}
      <button
        type='button'
        onClick={handleStart}
        disabled={scripts.length === 0 || isSpeaking}
        className='block-button start-button'
      >
        Start
      </button>
    </main>
  );
}

interface VoiceSelectorProps {
  selected: number;
  isSpeaking: boolean;
  setSelected: (selectedIndex: number) => void;
}

const VoiceSelector = ({
  selected = 0,
  isSpeaking,
  setSelected,
}: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const populateVoiceList = useCallback(() => {
    const newVoices = window.speechSynthesis.getVoices();
    setVoices(newVoices);
  }, []);

  useEffect(() => {
    populateVoiceList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [populateVoiceList]);

  return (
    <select
      id='voice-select'
      value={selected}
      disabled={isSpeaking}
      onChange={(e) => setSelected(parseInt(e.target.value))}
    >
      {voices.map((voice, index) => (
        <option key={index} value={index}>
          {voice.name} ({voice.lang}) {voice.default && " [Default]"}
        </option>
      ))}
    </select>
  );
};
