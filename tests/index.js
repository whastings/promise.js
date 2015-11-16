import catchTests from './catchTests';
import constructorTests from './constructorTests';
import Promise from '../lib/Unbreakable';
import thenRejectedTests from './thenRejectedTests';
import thenResolvedTests from './thenResolvedTests';
import staticMethodsTests from './staticMethodsTests';

global.Promise = Promise;

[
  constructorTests,
  thenResolvedTests,
  thenRejectedTests,
  catchTests,
  staticMethodsTests
].forEach((runner) => runner());
