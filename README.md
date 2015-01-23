# Elevator Saga solution
My solution for Elevator Saga (play it at http://play.elevatorsaga.com/)

I have written a [single solution](fairclosest.js) that can easily be configured to complete challenges 1-16 most of the time.
It is pre-configured for the last challenges (8-16).

There is still definitely room for improvement. For example in challenge 16 elevator #6 seems to just stand still a lot.

And of course occasionally it just fails to complete a challenge. This probably mostly happens when there are more people on a floor than can fit in the elevator at once and when an elevator visits that floor the floor goes to the end of the priority queue (we can't really tell that case apart from the case where fresh people appear on the floor immediately after the elevator leaves, or can we?)