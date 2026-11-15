import { useSyncExternalStore } from 'react';
import { Store } from './cue/store';
import { makeSample } from './cue/samples';
import { defaultPaper } from './cue/profiles';
import { loadCustom, onCustomChange } from './cue/custom';

// Imported formats are registered first, so a script that uses one lays out correctly when it is restored.
loadCustom();
const restored = Store.restore();
export const firstRun = !restored;
export const store = new Store(restored ?? makeSample('panto', defaultPaper()));

export function useStoreVersion() {
  return useSyncExternalStore(store.subscribeUi, store.getVersion);
}

// A format was added, edited or deleted: lay the script out again and refresh the menus.
onCustomChange(() => store.relayout());
