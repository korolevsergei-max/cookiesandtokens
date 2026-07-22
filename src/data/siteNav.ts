/**
 * siteNav.ts — shared primary destinations for header/footer.
 * Homepage anchors stay on `/`; work and legal pages resolve to absolute paths.
 */

export type SiteNavLink = {
  label: string;
  href: string;
  homeHref: string;
};

export const primaryNavLinks: SiteNavLink[] = [
  { label: "Operators", href: "/#industries", homeHref: "#industries" },
  { label: "Creative", href: "/#creative", homeHref: "#creative" },
  { label: "Growth", href: "/#growth", homeHref: "#growth" },
  { label: "Digital", href: "/#software", homeHref: "#software" },
  { label: "Work", href: "/work/", homeHref: "#work" },
  { label: "About", href: "/#about", homeHref: "#about" },
];

export function resolveNavHref(
  link: SiteNavLink,
  pathname: string
): string {
  if (pathname === "/" || pathname === "") return link.homeHref;
  return link.href;
}
