import { Select, SelectItem } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";

function VoiceSelector({
  selected = 0,
  isSpeaking,
  setSelected,
}: {
  selected: number;
  isSpeaking: boolean;
  setSelected: (selectedIndex: number) => void;
}) {
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

  useEffect(() => {
    if (voices.length === 0) return;

    setSelected(voices.findIndex((v) => v.default));
  }, [setSelected, voices]);

  return (
    <Select
      label='Select Voice'
      placeholder='Select Voice'
      value={selected}
      isDisabled={isSpeaking}
      onChange={(e) => setSelected(parseInt(e.target.value))}
    >
      {voices.map((voice, index) => {
        const textValue = `${voice.name} (${voice.lang}) ${
          voice.default ? " [Default]" : ""
        }`;
        return (
          <SelectItem key={index} value={index} textValue={textValue}>
            {textValue}
          </SelectItem>
        );
      })}
    </Select>
  );
}

export default VoiceSelector;
