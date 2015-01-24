# Elevator Saga solution
My solution for Elevator Saga (play it at http://play.elevatorsaga.com/)

This [solution](fairclosest.js) configures itself for the challenge automatically. It tries to be as fair as possible by considering all floors as equals and picking up/dropping off people in the order that they appeared.

Keeping maximum waiting time low is the top priority for the algorithm, but a throughput-increasing mode is automatically used for the first 5 levels to improve performance in them.

Since I also don't use the "going up" and "going down" indicators or any traditional elevator algorithms, the algorithm looks somewhat chaotic in action, but seems to do quite well on all challenges regardless.

Approximate success rates (tested with 100 runs each at timescale 21)

Challenge | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8
----------|----------|----------|----------|----------|----------|----------|----------|----------
Win rate  | 100 %    | 86 %     | 100 %    | 98 %     | 95 %     | 100 %    | 100 %    | 100 %

Challenge | 9        | 10       | 11       | 12       | 13       | 14       | 15       | 16
----------|----------|----------|----------|----------|----------|----------|----------|----------
Win rate  | 100 %    | 100 %    | 97 %     | 95 %     | 74 %     | 48 %     | 64 %     | 84 %

Challenge 17 converges to the following (tested with 1000 seconds elapsed time):
* 1.99 people transported/s (2.00 is the spawn rate, so all solutions eventually converge there after a long time)
* 6.5 s average waiting time
* 20.4 s max waiting time
* ~9.4 moves/second
