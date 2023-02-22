# arcade

A watched pot never boilerplates.

Yes, this is just my personal boilerplate for the minimal _comfortable_ configuration.


## Developer FAQ

### Why is there no consideration for how much time passes per frame?

It's simpler and my excuse is that it behaves like old consoles did. The game would slow down if a frame couldn't be rendered in time. This means that the framerate and the tickrate are in lockstep.

### You merge state directly onto the GameObject, living alongside the Pixi object attributes.

Yep. It feels like a smell to me too. But it makes the whole thing more conveinent. And these are small games.

### Why is Game a closure and not a class?

I tried to make it a class but it's very tedious to have to define types every time. As a closure, you get type literals (and autocomplete!) just by instantiating GameObjects.
