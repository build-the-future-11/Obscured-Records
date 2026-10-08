import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LIBRARY_KEY, NOTES_KEY, readSaved, readNotes, writeLocal } from '../lib/reader-storage.ts';

const story = (index) => ({ slug: `record-${index}`, state: 'Unread', savedAt: '2026-10-08T00:00:00Z' });
const note = (index) => ({ id: `note-${index}`, slug: 'fedex-flight-705', text: `Passage ${index}`, note: `Private note ${index}`, anchor: 'opening', createdAt: '2026-10-08T00:00:00Z' });

function device(t, key, entries) {
  const values = new Map([[key, JSON.stringify(entries)]]);
  const events = [];
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const storage = { getItem: (name) => values.get(name) ?? null, setItem: (name, value) => values.set(name, value) };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { dispatchEvent: (event) => { events.push(event.type); return true; } } });
  t.after(() => {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete globalThis.window;
  });
  return { values, events, storage };
}

for (const [kind, key, entry, read] of [['stories', LIBRARY_KEY, story, readSaved], ['highlights', NOTES_KEY, note, readNotes]]) {
  test(`${kind}: the 500th entry persists without losing the first`, (t) => {
    const entries = Array.from({ length: 499 }, (_, index) => entry(index));
    const { values, events } = device(t, key, entries);
    const next = [...entries, entry(499)];
    writeLocal(key, next);
    assert.deepEqual(read(values.get(key)), next);
    assert.deepEqual(events, ['or-library-change']);
  });

  test(`${kind}: the 501st entry refuses without changing stored bytes or announcing success`, (t) => {
    const entries = Array.from({ length: 500 }, (_, index) => entry(index));
    const { values, events } = device(t, key, entries);
    const before = values.get(key);
    assert.throws(() => writeLocal(key, [...entries, entry(500)]), /500.*limit/i);
    assert.equal(values.get(key), before);
    assert.deepEqual(events, []);
  });

  test(`${kind}: existing records above the limit remain readable and can be reduced`, (t) => {
    const entries = Array.from({ length: 503 }, (_, index) => entry(index));
    const { values } = device(t, key, entries);
    assert.deepEqual(read(values.get(key)), entries);
    const smaller = entries.filter((_, index) => index !== 1);
    writeLocal(key, smaller);
    assert.deepEqual(read(values.get(key)), smaller);
    assert.equal(read(values.get(key))[0][kind === 'stories' ? 'slug' : 'id'], kind === 'stories' ? 'record-0' : 'note-0');
    assert.throws(() => writeLocal(key, [...smaller, entry(900)]), /500.*limit/i);
    assert.deepEqual(read(values.get(key)), smaller);
  });
}

test('an existing library above the limit can update a reading state without deleting records', (t) => {
  const entries = Array.from({ length: 503 }, (_, index) => story(index));
  const { values } = device(t, LIBRARY_KEY, entries);
  const next = entries.map((entry, index) => index === 0 ? { ...entry, state: 'Finished' } : entry);
  writeLocal(LIBRARY_KEY, next);
  assert.deepEqual(readSaved(values.get(LIBRARY_KEY)), next);
});

test('a browser storage failure never dispatches a successful library change', (t) => {
  const { values, events, storage } = device(t, NOTES_KEY, [note(0)]);
  const before = values.get(NOTES_KEY);
  storage.setItem = () => { throw new DOMException('Full device', 'QuotaExceededError'); };
  assert.throws(() => writeLocal(NOTES_KEY, [note(0), note(1)]), /Full device/);
  assert.equal(values.get(NOTES_KEY), before);
  assert.deepEqual(events, []);
});
