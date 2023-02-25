# The Arcade

A simple game engine and catalog of little dumb games written for fun by Andrew Blakey.

## Developer FAQ

### Why is there no consideration for how much time passes per frame?

It's simpler and my excuse is that it behaves like old consoles did. The game would slow down if a frame couldn't be rendered in time. This means that the framerate and the tickrate are in lockstep.

### Engine is a global object?!

Yes. Sue me. =)
