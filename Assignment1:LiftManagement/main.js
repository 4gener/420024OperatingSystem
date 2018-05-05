let callDict = {};
let lifts = [];
let callKey = 0;
let lift_choice = -1;
let floor_num = 20;
let stepObj = {
    'UP': 1,
    'DOWN': -1,
    'WAIT': -2,
    'ARRIVE': 2,
    'FETCH': 0
};
let availableObj = {
    'TRUE': 1,
    'FALSE': 0,
    'SWAP': -1
}

class Lift {
    constructor(lift_id) {
        this.id = lift_id;
        this.currentFloor = 1;
        this.targetCallKey = -1;
        this.receivedCallFloors = [];
        this.direction = 0;
    }

    setNoneColor() {
        $("tbody").children().eq(floor_num - this.currentFloor).children().eq(this.id).removeAttr("class");
    };

    setMovingColor() {
        $("tbody").children().eq(floor_num - this.currentFloor).children().eq(this.id).attr("class", "table-primary");
    };

    setFetchColor() {
        $("tbody").children().eq(floor_num - this.currentFloor).children().eq(this.id).attr("class", "table-warning");
    }

    setArriveColor() {
        $("tbody").children().eq(floor_num - this.currentFloor).children().eq(this.id).attr("class", "table-danger");
    }

    setWaitingColor() {
        $("tbody").children().eq(floor_num - this.currentFloor).children().eq(this.id).attr("class", "table-info");
    }

    get nextStep() {
        if (this.targetCallKey === -1 && !(this.receivedCallFloors.length)) {
            this.direction = 0;
            return -2;
        }
        if (this.targetCallKey > -1) {
            if (this.currentFloor === callDict[this.targetCallKey].floor) {
                delete callDict[this.targetCallKey];
                this.targetCallKey = -1;
                return 0;
            } else {
                this.direction = (callDict[this.targetCallKey].floor > this.currentFloor) ? 1 : -1;
                return this.direction;
            }
        } else {
            if (this.receivedCallFloors.length) {
                if (this.receivedCallFloors.indexOf(this.currentFloor) > -1) {
                    this.receivedCallFloors.splice(this.receivedCallFloors.indexOf(this.currentFloor), 1);
                    if (this.id === lift_choice) {
                        reloadChoiceButtons();
                    }
                    console.log("emm");
                    return 2;
                }
                if (this.direction !== -1 && this.receivedCallFloors[this.receivedCallFloors.length - 1] < this.currentFloor) {
                    this.direction = -1;
                } else if (this.direction !== 1 && this.receivedCallFloors[0] > this.currentFloor) {
                    this.direction = 1;
                }
            } else {
                this.direction = 0;
            }
            return this.direction;
        }
    }

    checkAvailableforCall(callKey) {
        let callFloor = callDict[callKey].floor;
        if (this.targetCallKey === -1 && !(this.receivedCallFloors.length)) {
            return availableObj['TRUE'];
        } else if (this.targetCallKey === -1) {
            let callFloor = callDict[callKey].floor;
            if (this.direction === 1 && callFloor < this.receivedCallFloors[this.receivedCallFloors.length - 1] && callFloor > this.currentFloor) {
                return availableObj['TRUE'];
            } else if (this.direction === -1 && callFloor > this.receivedCallFloors[this.receivedCallFloors.length - 1] && callFloor < this.currentFloor) {
                return availableObj['TRUE'];
            } else {
                return availableObj['FALSE'];
            }
        } else {
            let currentCallFloor = callDict[this.targetCallKey].floor;
            if ((callFloor - currentCallFloor) * (currentCallFloor - this.currentFloor) <= 0) {
                return availableObj['SWAP'];
            } else {
                return availableObj['FALSE'];
            }
        }
    }

    async move() {
        let step = this.nextStep;
        switch (step) {
            case stepObj['FETCH']:
                this.setFetchColor();
                break;
            case stepObj['ARRIVE']:
                this.setArriveColor();
                break;
            case stepObj['WAIT']:
                this.setWaitingColor();
                break;
            default:
                this.setNoneColor();
                this.currentFloor += step;
                this.setMovingColor();
        }
        await
            sleep(500);
    };

}

class Call {
    constructor(floor, direction) {
        this.floor = floor;
        this.direction = direction;
        this.isAssigned = false;
    }
}

initLifts = () => {
    console.log("let's go!!");
    lifts = [new Lift(0), new Lift(1), new Lift(2), new Lift(3), new Lift(4)];
    changeLiftChoice(0);
    setInterval(monitor, 500);
};

monitor = () => {
    dispatch();
    move();
};

dispatch = () => {
    for (let keyIndex in Object.keys(callDict)) {
        let key = Object.keys(callDict)[keyIndex];
        if (!(callDict[key].isAssigned)) {
            assign(key);
        }
    }
};

move = () => {
    for (let i = 0; i < lifts.length; i++) {
        lifts[i].move();
    }
};

addCall = (floor, direction) => {
    for (let keyIndex in Object.keys(callDict)) {
        let key = Object.keys(callDict)[keyIndex];
        let call = callDict[key];
        if (call.floor === floor && call.direction === direction) {
            return;
        }
    }
    callDict[callKey] = new Call(floor, direction);
    console.log("++");
    callKey++;
};

assign = (callKey) => {
    let bestIndex = -1;
    for (let liftIndex = 0; liftIndex < lifts.length; liftIndex++) {
        let lift = lifts[liftIndex];
        let callFloor = callDict[callKey].floor;
        let code = lift.checkAvailableforCall(callKey);
        if (code !== availableObj['FALSE']) {
            if (bestIndex > -1) {
                console.log(Math.abs(lift.currentFloor - callFloor), Math.abs(lifts[bestIndex].currentFloor - callFloor));
                if (Math.abs(lift.currentFloor - callFloor) < Math.abs(lifts[bestIndex].currentFloor - callFloor)) {
                    bestIndex = liftIndex;
                    console.log("close");
                }
                console.log("far");
            } else {
                bestIndex = liftIndex;
            }
        }
    }
    if (bestIndex > -1) {
        let bestLift = lifts[bestIndex];
        if (bestLift.targetCallKey > -1) {
            callDict[bestLift.targetCallKey].isAssigned = false;
        }
        bestLift.targetCallKey = callKey;
        callDict[callKey].isAssigned = true;
    }
};

changeLiftChoice = (lift_choice_id) => {
    lift_choice = lift_choice_id;
    reloadChoiceButtons();
};

reloadChoiceButtons = () => {
    for (let i = 0; i < 5; i++) {
        $("#choice-buttons").children().eq(i).children().eq(0).attr("disabled", false);
    }
    $("#choice-buttons").children().eq(lift_choice).children().eq(0).attr("disabled", true);
    for (let i = 0; i < 20; i++) {
        $("#floor-buttons" + parseInt(i / 5)).children().eq(i % 5).children().eq(0).attr("disabled", false);
    }
    console.log(lifts[lift_choice].receivedCallFloors);
    for (let i in lifts[lift_choice].receivedCallFloors) {
        let j = floor_num - lifts[lift_choice].receivedCallFloors[i];
        console.log(j);
        $("#floor-buttons" + parseInt(j / 5)).children().eq(j % 5).children().eq(0).attr("disabled", true);
    }
};

addReceivedFloors = (floor) => {
    lifts[lift_choice].receivedCallFloors.push(floor);
    lifts[lift_choice].receivedCallFloors.sort();
    reloadChoiceButtons();
    console.log(lifts[lift_choice].receivedCallFloors);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
