// src/types/relative-time.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    "relative-time": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      datetime?: string;
      tense?: "past" | "future";
      format?: "relative" | "duration";
      lang?: string;
    };
  }
}
