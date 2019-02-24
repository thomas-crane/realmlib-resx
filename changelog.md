# Changelog

## [2.0.0] - 2019-02-24

### Added

+ Methods which were previously members of the `ResX` class are now simply exported functions. This means that `import * as resx from ...` will still work, but code such as `import { unpackSwf } from ...` will now work as well.

### Removed

+ The `ResX` class.

## [1.0.0] - 2019-02-22

+ Initial release.
