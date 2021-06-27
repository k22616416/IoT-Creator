// Import all plugins
// import $ from 'jquery';
// import * as bootstrap from 'bootstrap';
// import * as $ from 'jquery';
const overlapOffset = 0;

var onTop;
$(document).on('ready', function () {
    var line = new CreateLine();
    $('#screen_size').html($(document).width() + " x " + $(document).height());
    $('#canvas_size').html($('#canvas').width() + " x " + $('#canvas').height())
    $.each($('.node'), function (key, value) {
        $(value).css('z-index', key);
        if (key == $('.node').length - 1) {
            onTop = this;
        }
    })
    $(".node").draggable({
        containment: "parent",
        scroll: false,
        drag: function (event, ui) {

            var closest = getClosestNode($('.node'), event.target).target;
            $(closest).addClass("overlap");

            if (isOverlap(closest, event.target) || isOverlap(event.target, closest)) {
                $(closest).addClass("overlap");
                $(event.target).addClass('overlap');
                line.Destroy();
            }
            else {
                $(closest).removeClass("overlap");
                $(event.target).removeClass('overlap');
                if (line.line === undefined) {
                    line.Init(closest, event.target);
                    return;
                }
                line.ReDraw(closest, event.target);
            }
        },
        start: function (event, ui) {
            $(onTop).css('z-index', $(this).css('z-index'));
            $(this).css('z-index', $('.node').length - 1);
            onTop = this;
        },
        stop: function (event, ui) {
            line.Destroy();

        }
    });
});

function getClosestNode(_list, self) {
    var target = undefined;
    var self_pos = [
        $(self).offset().left + $(self).width() / 2,
        $(self).offset().top + $(self).height() / 2
    ];
    var dx, dy, closest_dis;

    var dis;
    var c_pos;

    $.each(_list, function (key, value) {
        if (value == self) return;
        c_pos = [
            $(value).offset().left + $(value).width() / 2,
            $(value).offset().top + $(value).height() / 2
        ];
        if (target == undefined) {
            target = value;
            dx = Math.abs(self_pos[0] - c_pos[0]);
            dy = Math.abs(self_pos[1] - c_pos[1]);
            closest_dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            return;
        }

        dx = Math.abs(self_pos[0] - c_pos[0]);
        dy = Math.abs(self_pos[1] - c_pos[1]);
        dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (dis < closest_dis) {
            target = value;
            closest_dis = dis;
        }
    });
    return { target, closest_dis, c_pos };
}



function isOverlap(idOne, idTwo) {
    var objOne = $(idOne),
        objTwo = $(idTwo),
        offsetOne = objOne.offset(),
        offsetTwo = objTwo.offset(),
        topOne = offsetOne.top,
        topTwo = offsetTwo.top,
        leftOne = offsetOne.left,
        leftTwo = offsetTwo.left,
        widthOne = objOne.width() + overlapOffset,
        widthTwo = objTwo.width() + overlapOffset,
        heightOne = objOne.height() + overlapOffset,
        heightTwo = objTwo.height() + overlapOffset;
    var leftTop = leftTwo > leftOne && leftTwo < leftOne + widthOne && topTwo > topOne && topTwo < topOne + heightOne,
        rightTop = leftTwo + widthTwo > leftOne && leftTwo + widthTwo < leftOne + widthOne && topTwo > topOne && topTwo <
            topOne + heightOne, leftBottom = leftTwo > leftOne && leftTwo < leftOne + widthOne && topTwo + heightTwo > topOne
                && topTwo + heightTwo < topOne + heightOne, rightBottom = leftTwo + widthTwo > leftOne && leftTwo + widthTwo <
                    leftOne + widthOne && topTwo + heightTwo > topOne && topTwo + heightTwo < topOne + heightOne;
    var
        topLine = Math.abs(topOne - topTwo) <= 5,
        bottomLine = Math.abs((topOne + heightOne) - (topTwo + heightTwo)) <= 5,
        leftLine = Math.abs(leftOne - leftTop) <= 5,
        rightLine = Math.abs((leftOne + widthOne) - (leftTwo + widthTwo)) <= 5;
    return leftTop || rightTop || leftBottom || rightBottom ||
        (topLine && bottomLine && leftLine && rightLine);
}

class CreateLine {

    line;

    constructor() {
        this.line = undefined;
    }

    DrawLine(ax, ay, bx, by) {
        if (ax > bx) {
            bx = ax + bx;
            ax = bx - ax;
            bx = bx - ax;
            by = ay + by;
            ay = by - ay;
            by = by - ay;
        }
        var angle = Math.atan((ay - by) / (bx - ax));

        angle = (angle * 180 / Math.PI);
        angle = -angle;

        var length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));

        var style = ""
        style += "left:" + (ax) + "px;"
        style += "top:" + (ay) + "px;"
        style += "width:" + length + "px;"
        style += "height:1px;"
        // style += "background-color: rgba(50,50,50,0.5);"
        style += "position:absolute;"
        style += "transform:rotate(" + angle + "deg);"
        // style += "-ms-transform:rotate(" + angle + "deg);"
        style += "transform-origin:0% 0%;"
        // style += "-moz-transform:rotate(" + angle + "deg);"
        // style += "-moz-transform-origin:0% 0%;"
        // style += "-webkit-transform:rotate(" + angle + "deg);"
        // style += "-webkit-transform-origin:0% 0%;"
        // style += "-o-transform:rotate(" + angle + "deg);"
        // style += "-o-transform-origin:0% 0%;"
        // style += "-webkit-box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, .1);"
        style += "box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, .1);"
        style += "z-index:99;"
        style += "border:1px dashed rgba(50,50,50,0.3)";
        return style;
        // return $("<div style='" + style + "'></div>");
    };

    Init(element, element2, reDraw = false) {
        let el1 = this.GetCoord(element);
        let el2 = this.GetCoord(element2);
        let x1 = el1[0];
        let y1 = el1[1];
        let x2 = el2[0];
        let y2 = el2[1];
        let line
        if (reDraw) {
            this.line.style = this.DrawLine(x1, y1, x2, y2);
        }
        else {
            line = document.createElement("div");
            line.style = this.DrawLine(x1, y1, x2, y2);
            this.line = line;
        }
        $(element).after(line);
        // let length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
        // let cx = ((x1 + x2) / 2) - (length / 2);
        // let cy = ((y1 + y2) / 2) - (1 / 2);
        // let deg = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
        // let line
        // if (reDraw) {
        //     line = this.line;
        // }
        // else {
        //     line = document.createElement("div");
        //     // line.style.position = "absolute";
        //     line.style.backgroundColor = "#000";
        //     line.style.zIndex = 999;
        // }
        // line.style.left = cx + "px";
        // line.style.top = cy + "px";
        // line.style.width = length + "px";
        // line.style.height = "2px";
        // line.style.transform = "rotate(" + deg + "deg)";
        // this.line = line;
        // $(element).after(line);
    }

    ReDraw(element, element2) {
        this.Init(element, element2, true);
    }

    GetLine() {
        return this.line;
    }

    GetCoord(element, top = true) {
        // 取div中心座標 座標從0開始所以要+1
        let x = element.offsetLeft + $(element).width() / 2 + 1;
        let y = element.offsetTop + $(element).height() / 2 + 1;
        return [x, y];
    }

    Destroy() {
        try {
            $(this.line).remove();
        }
        catch (e) {
            throw e;
        }
        delete this.line;

    }



}
