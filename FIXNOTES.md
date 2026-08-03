# Fix Notes — v2.1.6l-wc10-f22

F21 portrait failed because equal large circles allowed labels to overlap neighboring circles.

F22 changes only the portrait Home circle/label geometry path. The solver now maximizes filled circle area with unequal circle radii and rejects candidates when actual label footprints overlap another circle, overlap another label, or clip outside the rendered Home vehicle area.

Actual iPhone acceptance remains pending.
