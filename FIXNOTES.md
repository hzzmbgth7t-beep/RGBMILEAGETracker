# FIXNOTES

## v2.1.6u - Home Screen Menu Detection Lock

### Reason For This Release
The prior menu-only correction still left blank space beneath the menu in Home Screen mode, suggesting that the app was still behaving as if browser-style bottom space was reserved.

### Fix Implemented
- strengthened standalone/Home Screen detection
- applied standalone-specific menu-bottom anchoring
- left circles, labels, title, and spacing above the menu unchanged intentionally
