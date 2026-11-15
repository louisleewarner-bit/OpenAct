import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { App } from './App';

test('the app renders the product name from @openact/model', () => {
  expect(renderToString(<App />)).toContain('<h1>OpenAct</h1>');
});
