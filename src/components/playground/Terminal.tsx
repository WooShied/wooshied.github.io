import { useEffect, useRef, useState } from "react";
import { commandNames, commands, type Ctx, type Out } from "./commands";

const PROMPT = "aadil@clearance:~$";
const intro: Out[] = [
  { text: "clearance shell — a command line for this site.", tone: "accent" },
  { text: 'Type "help", or try: whoami · exp · skills identity · hash hello · privacy', tone: "dim" },
];

export function Terminal({ onTab }: { onTab: Ctx["tab"] }) {
  const [lines, setLines] = useState<Out[]>(intro);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
  }, [lines]);

  const ctx: Ctx = {
    goto: (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    tab: onTab,
    clear: () => setLines([]),
  };

  const run = async (raw: string) => {
    const input = raw.trim();
    const echo: Out = { text: `${PROMPT} ${input}`, tone: "cmd" };
    if (!input) return setLines((l) => [...l, echo]);
    setHistory((h) => [input, ...h].slice(0, 50));
    setHIdx(-1);
    const [name, ...args] = input.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    if (!cmd) {
      setLines((l) => [...l, echo, { text: `${name}: command not found. Type "help".`, tone: "err" }]);
      return;
    }
    setLines((l) => [...l, echo]);
    const out = await cmd.run(args, ctx);
    if (name.toLowerCase() !== "clear") setLines((l) => [...l, ...out]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(history.length - 1, hIdx + 1);
      if (i >= 0) {
        setHIdx(i);
        setValue(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIdx - 1;
      setHIdx(Math.max(-1, i));
      setValue(i >= 0 ? history[i] : "");
    } else if (e.key === "Tab" && value && !value.includes(" ")) {
      const hits = commandNames.filter((c) => c.startsWith(value.toLowerCase()));
      if (hits.length === 1) {
        e.preventDefault();
        setValue(`${hits[0]} `);
      } else if (hits.length > 1) {
        e.preventDefault();
        setLines((l) => [...l, { text: hits.join("  "), tone: "dim" }]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term__chrome" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>clearance — zsh</span>
      </div>
      <div className="term__screen" ref={screenRef} role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) => (
          <p key={i} className="term__line" data-tone={l.tone}>
            {l.text}
          </p>
        ))}
        <form
          className="term__input"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label htmlFor="term-input" className="term__prompt">
            {PROMPT}
          </label>
          <input
            id="term-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command"
          />
        </form>
      </div>
      <div className="term__quick" aria-label="Quick commands">
        {["help", "whoami", "exp", "skills", "certs", "hash hello", "privacy"].map((c) => (
          <button key={c} type="button" className="chip" onClick={() => run(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
