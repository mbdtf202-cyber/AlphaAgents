import type { ComponentType } from "react";

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export function useMDXComponents(components: MdxComponentMap): MdxComponentMap {
  return {
    h1: (props) => <h1 className="font-display text-4xl leading-tight text-balance md:text-5xl" {...props} />,
    h2: (props) => <h2 className="mt-12 font-display text-3xl leading-tight text-balance md:text-4xl" {...props} />,
    h3: (props) => <h3 className="mt-8 text-xl font-semibold text-ink-900" {...props} />,
    p: (props) => <p className="mt-4 text-[1.02rem] leading-8 text-ink-700" {...props} />,
    ul: (props) => <ul className="mt-4 space-y-3 pl-6 text-[1.02rem] leading-8 text-ink-700" {...props} />,
    ol: (props) => <ol className="mt-4 space-y-3 pl-6 text-[1.02rem] leading-8 text-ink-700" {...props} />,
    li: (props) => <li className="list-disc" {...props} />,
    strong: (props) => <strong className="font-semibold text-ink-950" {...props} />,
    code: (props) => <code className="rounded bg-ink-950/8 px-1.5 py-0.5 text-[0.95em] text-ink-900 anywhere" {...props} />,
    ...components,
  };
}
