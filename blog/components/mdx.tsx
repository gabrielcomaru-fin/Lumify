import type { MDXComponents } from "mdx/types";
import { BlogCTA } from "@/components/BlogCTA";
import { CompoundInterestCalculator } from "@/components/CompoundInterestCalculator";

export function getMdxComponents(slug: string): MDXComponents {
  return {
    BlogCTA: (props: { hrefPath?: string; label?: string }) => (
      <BlogCTA slug={slug} hrefPath={props.hrefPath} label={props.label} />
    ),
    CalculadoraJurosCompostos: () => <CompoundInterestCalculator />,
  };
}
