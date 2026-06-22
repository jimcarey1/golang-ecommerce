import { Input as AriaInput } from 'react-aria-components';
import type { InputProps } from 'react-aria-components';

export default function Input(props: InputProps) {
  return (
    <AriaInput
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
      {...props}
    />
  );
}
