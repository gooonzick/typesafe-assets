import { asset } from "../generated/public.gen";

export function Demo() {
  return <img src={asset("/images/hero.png")} alt="hero" />;
}
