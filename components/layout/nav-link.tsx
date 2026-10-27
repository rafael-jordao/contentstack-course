import Link from "next/link";
import { isExternalUrl, type NavigationLink } from "@/lib/content/navigation";

type NavLinkProps = NavigationLink & {
  className?: string;
};

export function NavLink({ label, url, className }: NavLinkProps) {
  if (isExternalUrl(url)) {
    return (
      <a href={url} rel="noopener noreferrer" target="_blank" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={url} className={className}>
      {label}
    </Link>
  );
}
