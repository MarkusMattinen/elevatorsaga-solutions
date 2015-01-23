// by Markus Mattinen
//
// This solution should complete challenges 1-16 most of the time. Sometimes it gets unlucky on the very last challenges, just try again if that happens.
// Some configuration is required for some levels, see the first couple of lines of the code.
//
// The idea is to use empty elevators to pick up people in the order that the buttons at the floors are pressed to be as fair as possible.
// Of course multiple elevators are never sent to a floor at the same time to pick up the same people.
//
// After picking people up, they are taken to their destination floors in the order that they were picked up in, or in case multiple people were picked up at once,
// the closest ones will be taken first.
//
// This solution also includes code for counting how many people are in each elevator at each time.
// Unfortunately it appears to be impossible to count how many people are waiting on each floor.

{
    init: function(elevators, floors) {
        // Configuration
        var saveMoves = false; // set to true for "Transport x people using y elevator moves or less" challenges.
                               // Only moves when the elevator is full and only one floor at a time.
        var preferPickingUpMoreWhenCarryingLessThan = 1; // 3 should be used for the "Transport x people in y seconds or less" challenges so we don't just carry one person around all the time
                                                         // and 1 for the "Transport x people and let no one wait for more than y seconds" challenges for maximum fairness

        floors.waitQueue = [];
        floors.addToWaitQueue = function(floorNum) {
            if (floors.waitQueue.indexOf(floorNum) === -1) {
                floors.waitQueue.push(floorNum);
            }
        };
        floors.removeFromWaitQueue = function(floorNum) {
            var index = floors.waitQueue.indexOf(floorNum);

            if (index !== -1) {
                floors.waitQueue.splice(index, 1);
            }
        };
        
        var checkElevators = function() {
            elevators.forEach(function(elevator, elevatorNum) {
                elevator.checkIdle();
            });
        };

        floors.forEach(function(floor) {
            floor.peopleWaiting = false;
            floor.elevatorsGoing = Array.apply(null, new Array(elevators.length)).map(Number.prototype.valueOf,0);
            floor.countCapacityOfElevatorsGoing = function() {
                return this.elevatorsGoing.reduce(function(capacitySum, going, elevatorNum) {
                    if (going) {
                        return capacitySum + elevators[elevatorNum].capacity();
                    } else {
                        return capacitySum;
                    }
                }, 0);
            };

            floor.on("up_button_pressed down_button_pressed", function() {
                floor.peopleWaiting = true;
                floors.addToWaitQueue(floor.floorNum());
                checkElevators();
            });
        });

        elevators.forEach(function(elevator, elevatorNum) {
            elevator.elevatorNum = elevatorNum;
            elevator.peopleGoingTo = Array.apply(null, new Array(floors.length)).map(Number.prototype.valueOf,0);
            elevator.peopleQueue = [[]];

            elevator.goToFloorAndClearQueue = function(floor) {
                this.destinationQueue = [ floor.floorNum() ];
                this.checkDestinationQueue();
                this.idle = false;

                floors.forEach(function(floor) {
                    floor.elevatorsGoing[this.elevatorNum] = false;
                });

                floor.elevatorsGoing[this.elevatorNum] = true;
            };

            elevator.goTowardsFloor = function(floor) {
                var floorDelta = 1;

                if (floor.floorNum() < this.currentFloor()) {
                    floorDelta = -1;
                }

                var destinationFloorNum = this.currentFloor() + floorDelta;

                this.goToFloorAndClearQueue(floors[destinationFloorNum]);
            };

            elevator.goToFloorOrTowards = function(floor) {
                if (floor.floorNum() === elevator.currentFloor()) {
                    return;
                }
                
                if (saveMoves) {
                    this.goTowardsFloor(floor);
                } else {
                    this.goToFloorAndClearQueue(floor);
                }
            };

            elevator.peopleIn = function() {
                return elevator.peopleGoingTo.reduce(function(sum, current) {
                    return sum + current;
                }, 0);
            };

            elevator.capacity = function() {
                return 4 - this.peopleIn();
            };

            elevator.checkIdle = function() {
                if (!this.idle) {
                    return;
                }

                if (this.peopleIn() < preferPickingUpMoreWhenCarryingLessThan && !saveMoves) {
                    for (var i = 0; i < floors.waitQueue.length; ++i) {
                        var floor = floors[floors.waitQueue[i]];
                        
                        if (floor.countCapacityOfElevatorsGoing() === 0) {
                            this.goToFloorOrTowards(floor);
                            return;
                        }
                    }
                }

                var closestFloor = { floorNum: this.currentFloor(), delta: 999 };
                var minimumPeopleInElevator = saveMoves ? 4 : 0;

                var thisElevator = this;
                var queue = this.peopleQueue[0];

                if (queue.length === 0) {
                    return;
                }

                queue.forEach(function(floorNum) {
                    var delta = Math.abs(floorNum - thisElevator.currentFloor());

                    if (delta < closestFloor.delta && thisElevator.peopleIn() >= minimumPeopleInElevator) {
                        closestFloor = { floorNum: floorNum, delta: delta };
                    }
                });

                this.goToFloorOrTowards(floors[closestFloor.floorNum], true);
            };

            elevator.on("idle", function() {
                elevator.idle = true;
                elevator.checkIdle();
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                var currentQueue = elevator.peopleQueue[elevator.peopleQueue.length - 1];

                if (currentQueue.indexOf(floorNum) === -1) {
                    currentQueue.push(floorNum);
                }

                elevator.peopleGoingTo[floorNum] += 1;
                elevator.checkIdle();
            });
            
            elevator.on("stopped_at_floor", function(floorNum) {
                elevator.peopleQueue = elevator.peopleQueue.map(function(queue) {
                    var index = queue.indexOf(floorNum);

                    if (index !== -1) {
                        queue.splice(index, 1);
                    }

                    return queue;
                });

                elevator.peopleQueue = elevator.peopleQueue.filter(function(queue) {
                    return queue.length !== 0;
                });

                elevator.peopleQueue.push([]);

                floors.removeFromWaitQueue(floorNum);
                floors[floorNum].elevatorsGoing[elevatorNum] = false;
                floors[floorNum].peopleWaiting = false;
                elevator.peopleGoingTo[floorNum] = 0;
            });
        });
    },
    update: function(dt, elevators, floors) {
        elevators.forEach(function(elevator, elevatorNum) {
            if (elevator.idle) {
                elevator.goToFloor(elevator.currentFloor(), true); // pick up anyone waiting
            }
        });
    }
}
