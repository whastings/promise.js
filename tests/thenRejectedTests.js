import test from 'tape';
import thenSharedTests from './thenSharedTests';

export default function thenRejectedTests() {
  test('then() with rejection', function(t) {
    thenSharedTests('rejected', t);
  });
}
