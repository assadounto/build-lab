import { StudioShell } from "@/components/studio-shell";
import "./professional/professional.css";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
