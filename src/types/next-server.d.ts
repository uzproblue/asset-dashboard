declare module "next/server" {
  export class NextResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    static json(data: unknown, init?: ResponseInit): NextResponse;
    static text(data: string, init?: ResponseInit): NextResponse;
  }

  export interface NextRequest extends Request {
    // NextRequest extends Request
  }
}

declare module "next" {
  export interface NextConfig {
    typescript?: {
      ignoreBuildErrors?: boolean;
    };
    eslint?: {
      ignoreDuringBuilds?: boolean;
    };
    outputFileTracingRoot?: string;
  }

  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: unknown;
  }
}

declare module "fs" {
  export function readFileSync(path: string, encoding: string): string;
  export function statSync(path: string): { mtime: Date };
}

declare module "path" {
  export function join(...paths: string[]): string;
}

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
};

declare namespace React {
  interface ReactNode {
    // React node type
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: object;
  }
}

declare module "react" {
  export function useState<T>(
    initialState: T | (() => T)
  ): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(
    effect: () => void | (() => void),
    deps?: unknown[]
  ): void;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    deps?: unknown[]
  ): T;
  export function useTransition(): [boolean, (callback: () => void) => void];
  export function memo<T>(component: T): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function lazy<T>(importFunc: () => Promise<{ default: T }>): T;
  export function Suspense(props: {
    children: unknown;
    fallback: unknown;
  }): unknown;
}
