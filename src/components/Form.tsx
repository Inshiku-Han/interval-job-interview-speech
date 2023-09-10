import { Button, Spacer, Textarea } from "@nextui-org/react";
import {
  useState,
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { type Script } from "../types";

function Form({
  isSpeaking,
  setScripts,
}: {
  isSpeaking: boolean;
  setScripts: Dispatch<SetStateAction<Script[]>>;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (isSpeaking) return;
    if (inputValue.trim() === "") return;
    setScripts((p) => [...p, { text: inputValue, createdAt: new Date() }]);
    setInputValue("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        label='Script'
        placeholder='Fill in the script'
        value={inputValue}
        maxLength={500}
        spellCheck={false}
        isDisabled={isSpeaking}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            handleSubmit(e);
          }
        }}
      />
      <Spacer y={4} />
      <Button
        type='submit'
        className='w-full'
        isDisabled={inputValue.trim() === "" || isSpeaking}
      >
        Add
      </Button>
    </form>
  );
}

export default Form;
