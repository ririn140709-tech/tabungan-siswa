import type { ReactNode, SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function Ikon({ children, ...props }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconLock(props: Props) {
  return (
    <Ikon {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </Ikon>
  );
}

export function IconArrowRight(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Ikon>
  );
}

export function IconArrowLeft(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M20 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Ikon>
  );
}

export function IconChevronRight(props: Props) {
  return (
    <Ikon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Ikon>
  );
}

export function IconSearch(props: Props) {
  return (
    <Ikon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4-4" />
    </Ikon>
  );
}

export function IconSiswa(props: Props) {
  return (
    <Ikon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 19.5a6 6 0 0 1 12 0" />
      <path d="M16.5 5.2a3.5 3.5 0 0 1 0 5.6" />
      <path d="M18 14.6a5.6 5.6 0 0 1 3 4.9" />
    </Ikon>
  );
}

export function IconGuru(props: Props) {
  return (
    <Ikon {...props}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
      <path d="M11 12.5v2h2v-2" />
    </Ikon>
  );
}

export function IconKas(props: Props) {
  return (
    <Ikon {...props}>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 9.5h12.5a2.5 2.5 0 0 1 0 5H15" />
      <circle cx="16.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <path d="M6.5 6V4.8A1.3 1.3 0 0 1 7.8 3.5h8.7" />
    </Ikon>
  );
}

export function IconDompet(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a2 2 0 0 1 2 2v1" />
      <rect x="3" y="7.5" width="18" height="12" rx="3" />
      <path d="M16.5 13.5h1.5" />
    </Ikon>
  );
}

export function IconPlus(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Ikon>
  );
}

export function IconPencil(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Ikon>
  );
}

export function IconTrash(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6.5 7l.8 12.1a1.9 1.9 0 0 0 1.9 1.9h5.6a1.9 1.9 0 0 0 1.9-1.9L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </Ikon>
  );
}

export function IconLogout(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
      <path d="m16 16 5-4-5-4" />
      <path d="M21 12H9" />
    </Ikon>
  );
}

export function IconKunci(props: Props) {
  return (
    <Ikon {...props}>
      <circle cx="7.5" cy="7.5" r="4" />
      <path d="m10.4 10.4 9.1 9.1" />
      <path d="m15.6 15.6 2.4-2.4" />
      <path d="m17.8 17.8 2.2-2.2" />
    </Ikon>
  );
}

export function IconMata(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Ikon>
  );
}

export function IconMataTutup(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M4 5.5c-1.2 1.4-2 3.1-2 6.5 0 0 3.5 6.5 9.5 6.5 1.7 0 3.2-.5 4.5-1.2" />
      <path d="M9.7 6.1A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.8 17.8 0 0 1-2.6 3.6" />
      <path d="M10 10a2.8 2.8 0 0 0 4 4" />
      <path d="m4 4 16 16" />
    </Ikon>
  );
}

export function IconCalendar(props: Props) {
  return (
    <Ikon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </Ikon>
  );
}

export function IconNaik(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </Ikon>
  );
}

export function IconTurun(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M7 7l10 10" />
      <path d="M15.5 17H7V8.5" />
    </Ikon>
  );
}

export function IconKosong(props: Props) {
  return (
    <Ikon {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a2 2 0 0 1 2 2v1" />
      <rect x="3" y="7.5" width="18" height="12" rx="3" />
      <path d="M9 13.5h6" />
    </Ikon>
  );
}

export function IconCentang(props: Props) {
  return (
    <Ikon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Ikon>
  );
}

export function IconX(props: Props) {
  return (
    <Ikon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Ikon>
  );
}
