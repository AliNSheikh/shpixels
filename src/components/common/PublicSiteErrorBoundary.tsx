import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class PublicSiteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[public-site] render failure', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#171717] text-[#f1f2ed] flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#706e6a]">
              SHPIXELS
            </div>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black font-quicksand">
              The site is temporarily recovering
            </h1>
            <p className="mt-4 text-sm text-[#a8a6a1] leading-relaxed">
              A content item could not be rendered safely. Reload the page to fetch the latest published site data.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-semibold"
              >
                Reload Site
              </button>
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-[#f1f2ed] text-xs font-semibold"
              >
                Home
              </a>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
