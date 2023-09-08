import {
  useState,
  useCallback,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type Script = {
  text: string;
  createdAt: Date;
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [voiceInterval, setVoiceInterval] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [scripts, setScripts] = useState<Script[]>([]);

  if (!window.speechSynthesis) {
    return <span>Aw... your browser does not support Speech Synthesis</span>;
  }

  const handleSubmit = (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setScripts([...scripts, { text: inputValue, createdAt: new Date() }]);
    setInputValue("");
  };

  const handleStart = async () => {
    const synth = window.speechSynthesis;

    for (let i = 0; i < scripts.length; i++) {
      const utterance = new SpeechSynthesisUtterance(scripts[i].text);
      utterance.voice = synth.getVoices()[selectedVoice];
      synth.speak(utterance);
      await new Promise((resolve) => {
        utterance.onend = () => setTimeout(resolve, voiceInterval * 1000);
      });
    }
  };

  return (
    <main>
      <div>
        <label htmlFor='voice-select'>목소리 설정</label>
        <VoiceSelector
          selected={selectedVoice}
          setSelected={setSelectedVoice}
        />
      </div>
      <div>
        <label htmlFor='voice-interval'>스크립트 간격(초)</label>
        <input
          inputMode='decimal'
          value={voiceInterval}
          maxLength={3}
          onChange={(e) =>
            setVoiceInterval(Number(e.target.value.replace(/[^0-9]/g, "")))
          }
        />
      </div>
      <button type='button' onClick={handleStart}>
        시작
      </button>
      <fieldset>
        <legend>스크립트 목록</legend>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder='스크립트 입력'
            value={inputValue}
            maxLength={500}
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
          <button type='submit'>추가</button>
        </form>
        <ul>
          {scripts.map((v) => (
            <li key={v.createdAt.getTime()}>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </fieldset>
    </main>
  );
}

interface VoiceSelectorProps {
  selected: number;
  setSelected: (selectedIndex: number) => void;
}

const VoiceSelector = ({ selected = 0, setSelected }: VoiceSelectorProps) => {
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
