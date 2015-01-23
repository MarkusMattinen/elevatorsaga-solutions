{
    init: function(elevators, floors) {
        // Configuration
        var saveMoves = false; // set to true for "Transport x people using y elevator moves or less" challenges.
                               // Only moves when the elevator is full and only one floor at a time.
        var preferPickingUpMoreWhenCarryingLessThan = 1; // 3 should be used for the "Transport x people in y seconds or less" challenges
                                                         // and 1 for the "Transport x people and let no one wait for more than y seconds" challenges

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

        floors.forEach(function(floor) {
            floor.peopleWaiting = false;
            floor.elevatorsGoing = Array.apply(null, new Array(elevators.length)).map(Number.prototype.valueOf,0);
            floor.countCapacityOfElevatorsGoing = function() {
                return this.elevatorsGoing.reduce(function(previous, current, elevatorNum) {
                    if (current === true) {
                        return previous + elevators[elevatorNum].capacity();
                    } else {
                        return previous;
                    }
                }, 0);
            };

            floor.on("up_button_pressed", function() {
                floor.peopleWaiting = true;
                floors.addToWaitQueue(floor.floorNum());
                checkElevators();
            });

            floor.on("down_button_pressed", function() {
                floor.peopleWaiting = true;
                floors.addToWaitQueue(floor.floorNum());
                checkElevators();
            });
        });

        var checkElevators = function() {
            elevators.forEach(function(elevator, elevatorNum) {
                elevator.checkIdle();
            });
        };

        elevators.forEach(function(elevator, elevatorNum) {
            elevator.previousLoadFactor = 0;
            elevator.elevatorNum = elevatorNum;
            elevator.goingToFloor = 0;
            elevator.peopleGoingTo = Array.apply(null, new Array(floors.length)).map(Number.prototype.valueOf,0);
            elevator.peopleQueue = [[]];

            elevator.queueToFloor = function(floor, force) {
                this.goToFloor(floor.floorNum(), force);
                this.idle = false;
                floor.elevatorsGoing[this.elevatorNum] = true;
            };

            elevator.goToFloorAndClearQueue = function(floor) {
                this.destinationQueue = [ floor.floorNum() ];
                this.checkDestinationQueue();
                this.idle = false;

                floors.forEach(function(floor) {
                    floor.elevatorsGoing[this.elevatorNum] = false;
                });

                floor.elevatorsGoing[this.elevatorNum] = true;
            };

            elevator.goTowardsFloor = function(floor, force, clear) {
                var floorDelta = 1;

                if (floor.floorNum() < this.currentFloor()) {
                    floorDelta = -1;
                }

                var destinationFloorNum = this.currentFloor() + floorDelta;

                if (clear) {
                    this.goToFloorAndClearQueue(floors[destinationFloorNum]);
                } else {
                    this.queueToFloor(floors[destinationFloorNum], force);
                }
            };

            elevator.goToFloorOrTowards = function(floor, clear, force) {
                if (floor.floorNum() === elevator.currentFloor()) {
                    return;
                }
                
                if (saveMoves) {
                    this.goTowardsFloor(floor, force);
                } else if (clear) {
                    this.goToFloorAndClearQueue(floor);
                } else {
                    this.queueToFloor(floor, force);
                }
            };

            elevator.peopleIn = function() {
                return elevator.peopleGoingTo.reduce(function(previous, current) {
                    return previous + current;
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
                        if (floors[floors.waitQueue[i]].countCapacityOfElevatorsGoing() === 0) {
                            this.goToFloorOrTowards(floors[floors.waitQueue[i]], true);
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
                elevator.destinationQueue = elevator.destinationQueue.filter(function(destinationFloorNum) {
                    return destinationFloorNum !== floorNum;
                });
                elevator.checkDestinationQueue();
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