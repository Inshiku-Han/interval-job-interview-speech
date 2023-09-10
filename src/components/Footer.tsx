import { Button } from "@nextui-org/react";

export default function Footer({
  handleStart,
  isDisabled,
  isSpeaking,
}: {
  handleStart: () => void;
  isDisabled: boolean;
  isSpeaking: boolean;
}) {
  return (
    <footer className='fixed bg-white dark:bg-black bottom-0 bg- left-0 w-full p-2 z-10'>
      <Button
        type='button'
        onClick={handleStart}
        isDisabled={isDisabled}
        isLoading={isSpeaking}
        className='w-full'
      >
        Start
      </Button>
    </footer>
  );
}
