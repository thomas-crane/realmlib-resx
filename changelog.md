# Changelog

## [3.0.1] - 2019-05-14

### Fixed

+ Made the lib files executable.

## [3.0.0] - 2019-05-14

### Added

+ Added the rusted_realm lib.
+ Added the `extractPackets` method to replace the functionality of the removed methods. See the readme for more info about this method.

### Removed

+ The JPEXS lib has been removed.
+ The exported methods `makeGSCPath`, `unpackSwf` and `extractPacketInfo` have been removed.

## [2.0.0] - 2019-02-24

### Added

+ Methods which were previously members of the `ResX` class are now simply exported functions. This means that `import * as resx from ...` will still work, but code such as `import { unpackSwf } from ...` will now work as well.

### Removed

+ The `ResX` class.

## [1.0.0] - 2019-02-22

+ Initial release.
