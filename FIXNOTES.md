# FIXNOTES — v2.1.6l-wc10-f24

Build: `v2.1.6l-wc10-f24`  
Cache: `216lwc10f24`  
Source baseline: verified accepted `v2.1.6l-wc10-f19`  
Source SHA-256: `1e3e15e25b521e1098fae963d2a6b8b8224c0bee8e2ff4c13d982f296b3e4845`  
Actual iPhone acceptance: PENDING / USER DEVICE CHECK REQUIRED

## Fix scope

F24 addresses portrait Home geometry only. The model binds each vehicle circle to its own below-label and rejects candidate geometry when the own-label would overlap its circle or when the lower item would collide with the bottom menu/browser boundary.

## Rejected evidence excluded as source

F20, F21, F22, and F23 are rejected portrait evidence only and are not implementation sources for this package. F17 and F18 remain prohibited runtime sources.
