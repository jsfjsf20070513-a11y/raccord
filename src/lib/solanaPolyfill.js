// Browser polyfills required by @solana/web3.js + @coral-xyz/anchor.
// Both packages assume Node's `Buffer` global exists. Vite ships a polyfill
// in the `buffer` package; we assign it once at app boot.
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  if (!window.Buffer) window.Buffer = Buffer;
  if (!window.global) window.global = window;
}
