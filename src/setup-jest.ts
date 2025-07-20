import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

Object.defineProperty(window, 'CSS', {value: null});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

class MockBlob {
  private parts: any[];
  public type: string;
  public size: number;

  constructor(parts: any[], options?: { type?: string }) {
    this.parts = parts;
    this.type = options?.type || '';
    this.size = parts.reduce((total, part) => total + part.length, 0);
  }

  text(): Promise<string> {
    return Promise.resolve(this.parts.join(''));
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    const text = this.parts.join('');
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(text).buffer);
  }
}

class MockFile extends MockBlob {
  public name: string;
  public lastModified: number;

  constructor(parts: any[], filename: string, options?: { type?: string; lastModified?: number }) {
    super(parts, options);
    this.name = filename;
    this.lastModified = options?.lastModified || Date.now();
  }
}

(global as any).Blob = MockBlob;
(global as any).File = MockFile;

(global as any).FileReader = class MockFileReader extends EventTarget {
  public result: string | ArrayBuffer | null = null;
  public error: any = null;
  public readyState: number = 0;

  public static readonly EMPTY = 0;
  public static readonly LOADING = 1;
  public static readonly DONE = 2;

  public onload: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
  public onloadend: ((event: any) => void) | null = null;

  readAsText(file: MockBlob): void {
    this.readyState = MockFileReader.LOADING;
    setTimeout(async () => {
      try {
        this.result = await file.text();
        this.readyState = MockFileReader.DONE;

        const event = { target: this, type: 'load' };
        if (this.onload) this.onload(event);
        if (this.onloadend) this.onloadend(event);
        this.dispatchEvent(new Event('load'));
      } catch (error) {
        this.error = error;
        this.readyState = MockFileReader.DONE;

        const event = { target: this, type: 'error' };
        if (this.onerror) this.onerror(event);
        if (this.onloadend) this.onloadend(event);
        this.dispatchEvent(new Event('error'));
      }
    }, 0);
  }

  readAsArrayBuffer(file: MockBlob): void {
    this.readyState = MockFileReader.LOADING;
    setTimeout(async () => {
      try {
        this.result = await file.arrayBuffer();
        this.readyState = MockFileReader.DONE;

        const event = { target: this, type: 'load' };
        if (this.onload) this.onload(event);
        if (this.onloadend) this.onloadend(event);
        this.dispatchEvent(new Event('load'));
      } catch (error) {
        this.error = error;
        this.readyState = MockFileReader.DONE;

        const event = { target: this, type: 'error' };
        if (this.onerror) this.onerror(event);
        if (this.onloadend) this.onloadend(event);
        this.dispatchEvent(new Event('error'));
      }
    }, 0);
  }
};

(global as any).fail = (message?: string) => {
  throw new Error(message || 'Test failed');
};

declare global {
  namespace jest {
    interface DoneCallback {
      fail(reason?: string | Error): void;
    }
  }
}

beforeEach(() => {
  const originalIt = global.it;
  global.it = (name: string, fn?: any, timeout?: number) => {
    if (fn && fn.length > 0) {
      return originalIt(name, (done: any) => {
        done.fail = (reason?: string | Error) => {
          const error = reason instanceof Error ? reason : new Error(reason || 'Test failed');
          done(error);
        };
        return fn(done);
      }, timeout);
    }
    return originalIt(name, fn, timeout);
  };
});
