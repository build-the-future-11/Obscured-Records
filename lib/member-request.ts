const memberBodyTimeoutMs = 5_000;

// Cancellation is best effort: an upload source must not extend the read deadline
// by returning a pending or rejected cancellation promise.
function cancelBody(body: ReadableStream<Uint8Array> | null) {
  try { void body?.cancel().catch(() => {}); } catch {}
}

export async function readMemberJson(request: Request, maximumBytes = 12_000): Promise<unknown | null> {
  const declared = request.headers.get("content-length");
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 0 ||
      (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)) || Number(declared) > maximumBytes)) ||
      request.signal.aborted || request.bodyUsed) {
    cancelBody(request.body);
    return null;
  }
  if (!request.body) return null;

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try { reader = request.body.getReader(); } catch { return null; }

  let interrupt: () => void = () => {};
  let interrupted = false;
  const interruption = new Promise<never>((_, reject) => {
    interrupt = () => { interrupted = true; reject(new Error("Member upload interrupted.")); };
  });
  // Keep an abort immediately after listener registration handled before the
  // first read race is installed.
  void interruption.catch(() => {});
  const timer = setTimeout(interrupt, memberBodyTimeoutMs);
  request.signal.addEventListener("abort", interrupt, { once: true });
  if (request.signal.aborted) interrupt();

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      if (interrupted) return null;
      const { done, value } = await Promise.race([reader.read(), interruption]);
      if (interrupted) return null;
      if (done) break;
      if (!(value instanceof Uint8Array)) throw new Error("Invalid member upload.");
      total += value.byteLength;
      if (total > maximumBytes) throw new Error("Member upload is too large.");
      if (!value.byteLength) {
        // Repeated immediately fulfilled empty chunks must yield to the shared
        // deadline and abort handler instead of starving their event-loop turn.
        await Promise.race([new Promise<void>((resolve) => setTimeout(resolve, 0)), interruption]);
        continue;
      }
      chunks.push(new Uint8Array(value));
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", interrupt);
    chunks.length = 0;
    // Also covers aborts before a read, stream errors and oversized input. Do
    // not await cancellation; release the lock even when its hook stalls.
    try { void reader.cancel().catch(() => {}); } catch {}
    try { reader.releaseLock(); } catch {}
  }
}
