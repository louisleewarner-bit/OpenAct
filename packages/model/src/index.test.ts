import { expect, test } from 'vitest';
import { PRODUCT_NAME } from './index';

test('the product name is one word (D-029)', () => {
  expect(PRODUCT_NAME).toBe('OpenAct');
});
