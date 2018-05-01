var lift_floor_current = [1, 1, 1, 1, 1];
var lift_floor_target = [1, 1, 1, 1, 1];

initFloor = () => {
    console.log("let's go!!");
    setFloorClosedColor(1, 1);
    setFloorClosedColor(2, 1);
    setFloorClosedColor(3, 1);
    setFloorClosedColor(4, 1);
    setFloorClosedColor(5, 1);
    goToTargetFloor(1, 9);
};

async function goToTargetFloor(lift, targetFloor) {
    let start = lift_floor_current[lift - 1];
    lift_floor_target[lift - 1] = targetFloor;
    for (var i = start; i != targetFloor;) {
        i = start > targetFloor ? i - 1 : i + 1;
        await sleep(500);
        moveToNextFloor(lift, i);
    }
};

moveToNextFloor = (lift, nextFloor) => {
    console.log(nextFloor);
    let currentFloor = lift_floor_current[lift - 1];
    setFloorNoneColor(lift, currentFloor);
    lift_floor_current[lift - 1] = nextFloor;
    setFloorClosedColor(lift, nextFloor);
};

setFloorNoneColor = (lift, floor) => {
    $("tbody").children().eq(20 - floor).children().eq(lift - 1).removeAttr("class");
};

setFloorClosedColor = (lift, floor) => {
    $("tbody").children().eq(20 - floor).children().eq(lift - 1).attr("class", "table-primary");
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
