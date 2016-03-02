var SVGBezier = React.createClass({displayName: 'SVGBezier',
    render: function()
    {
        if(this.props.curveData.length == 1)
        {
            return React.createElement("circle", {cx: this.props.curveData[0].x, cy: this.props.curveData[0].y, r: '1', fill: this.props.colour, stroke: this.props.colour});
        }
        else
        {
            var i;
            var param =     "M" + this.props.curveData[0].x + "," + this.props.curveData[0].y;
            param = param +" C" + this.props.curveData[1].x + "," + this.props.curveData[1].y;
            param = param + " " + this.props.curveData[2].x + "," + this.props.curveData[2].y;
            param = param + " " + this.props.curveData[3].x + "," + this.props.curveData[3].y;

            for(i = 4; i + 2 < this.props.curveData.length; i += 3)
            {
                param = param +" C" + this.props.curveData[i + 0].x + "," + this.props.curveData[i + 0].y;
                param = param + " " + this.props.curveData[i + 1].x + "," + this.props.curveData[i + 1].y;
                param = param + " " + this.props.curveData[i + 2].x + "," + this.props.curveData[i + 2].y;
            }

            return React.createElement("path", {d: param, fill: "none", stroke: this.props.colour});
        }
    }
});


var SVGComponent = React.createClass({displayName: 'SVGComponent',
    render: function()
    {
        var locCurves = this.props.curveListLoc.map(function (curve)
        {
            return React.createElement(SVGBezier, {key: curve.id, curveData: curve.curveSet, colour: curve.colour});
        });
        var remCurves = this.props.curveListRem.map(function (curve)
        {
            return React.createElement(SVGBezier, {key: curve.id, curveData: curve.curveSet, colour: curve.colour});
        });

        return React.createElement("svg", { className: "svgcomponent" }, locCurves, remCurves);
    }
});


var Whiteboard = React.createClass({displayName: 'Whiteboard',
getInitialState: function()
{
    this.mousePress = false;
    this.touchPress = false;
    this.pointList = [];
    this.isPoint = true;
    this.sendBuffer = [];
    this.recieveBuffer = [];
    this.recieveTimeouts = [];
    this.sendTimeouts = [];
    this.isProcessing = false;
    this.colour = 'black';
    return {data: [], curveListLoc: [], curveListRem: []};
},
setSocket: function(socket)
{
    var self = this;
    this.socket = socket;

    this.socket.on('CURVE', function(data)
    {
        // Set up the buffers to recieve data.
        self.recieveBuffer[data.serverId] = data;
        self.recieveBuffer[data.serverId].points = [];

        // Prepare the requesting of missing data.
        self.recieveTimeouts[data.serverId] = setInterval(function()
        {
            var i;
            var complete = true;

            if(!self.recieveBuffer[data.serverId])
            {
                console.error('Underfined here.');
            }

            for(i = 0; i < self.recieveBuffer[data.serverId].num_points; i++)
            {
                if(!self.recieveBuffer[data.serverId].points[i])
                {
                    complete = false;
                    self.socket.emit('MISSING', {id: data.serverId, seq_num: i});
                }
            }

            if(complete)
            {
                clearInterval(self.recieveTimeouts[data.serverId]);

                var curveListNew = [];
                if(self.state.curveListRem.length)
                {
                    curveListNew = self.state.curveListRem.slice();
                }

                curveListNew[curveListNew.length] = {id: data.serverId, user: self.recieveBuffer[data.serverId].userId, colour: self.recieveBuffer[data.serverId].colour, curveSet: self.recieveBuffer[data.serverId].points};
                self.setState({curveListRem: curveListNew});
            }

        }, 250);
    });
    this.socket.on('POINT', function(data)
    {
        // Make sure we know about this curve.
        if(self.recieveBuffer[data.id])
        {
            if(!self.recieveBuffer[data.id].points[data.num])
            {
                self.recieveBuffer[data.id].points[data.num] = {x: data.x, y: data.y};
            }
        }
        else
        {
            // Request curve data.
            self.socket.emit('UNKNOWN', data.id);
        }
    });
    this.socket.on('CURVEID', function(data)
    {
        var i;
        self.sendBuffer[data.localId].serverID = data.serverId;

        clearInterval(self.sendTimeouts[data.localId]);
        self.sendTimeouts.splice(data.localId, 1);

        // Send the points for this curve.
        for(i = 0; i < self.sendBuffer[data.localId].curveSet.length; i++)
        {
            var curve = self.sendBuffer[data.localId].curveSet[i];
            self.socket.emit('POINT', {id: data.serverId, num: i, x: curve.x, y: curve.y});
        }
    });
    this.socket.on('MISSED', function(data)
    {
        // The server has not recieced this point, send it.
        var curve = self.sendBuffer[data.curve].curveSet[data.point];
        self.socket.emit('POINT', {id: data.curve, num: data.point, x: curve.x, y: curve.y});
    });
    this.socket.on('ERROR', function(data)
    {
        // TODO: Server error.
    });
},
componentDidMount: function()
{

},
mouseUp: function(e)
{
    if(this.mousePress)
    {
        var reducedPoints;
        var curveListNew = [];
        var curves;
        var whitElem  = document.getElementById("whiteBoard-input");
        var context = whitElem.getContext('2d');

        context.clearRect(0, 0, whitElem.width, whitElem.height);

        if(this.state.curveListLoc.length)
        {
            curveListNew = this.state.curveListLoc.slice();
        }

        this.mousePress = false;
        this.isProcessing = true;

        if(this.isPoint)
        {
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY  = elemRect.top - document.body.scrollTop;
            var offsetX  = elemRect.left - document.body.scrollLeft;

            curves = [];
            curves[0] = {x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY)};
        }
        else
        {
            reducedPoints = this.pointList.slice(0);
            reducedPoints = SmoothCurve(reducedPoints);
            reducedPoints = DeCluster(reducedPoints, 10);

            var i;
            var tStr = "New curve points: ";

            for(i = 0; i < reducedPoints.length; i++)
            {
                tStr = tStr + "(" + reducedPoints[i].x + ", " + reducedPoints[i].y + "), ";
            }

            curves = FitCurve(reducedPoints, reducedPoints.length, 5);

            tStr = tStr + " Num Curves: " + curves.length;
            console.log(tStr);
        }

        this.sendBuffer[curveListNew.length] = {id: curveListNew.length, colour: this.colour, curveSet: curves};
        curveListNew[curveListNew.length] = {id: curveListNew.length, colour: this.colour, curveSet: curves};

        var self = this;
        // TODO: This is a callback, references may be screwy
        this.sendTimeouts[curveListNew.length - 1] = setInterval(function()
        {
            self.socket.emit('CURVE', {id: curveListNew.length - 1, colour: self.colour, num_points: curves.length});
        }, 60000);

        this.socket.emit('CURVE', {id: curveListNew.length - 1, colour: this.colour, num_points: curves.length});

        this.setState({curveListLoc: curveListNew});

    }

    this.isProcessing = false;
    this.pointList = [];
},
touchUp: function()
{
    this.touchPress = false;
},
mouseDown: function()
{
    this.mousePress = true;
    this.isPoint = true;
},
touchDown: function()
{
    this.touchPress = true;
},
mouseMove: function(e)
{
    if(this.mousePress && !this.isProcessing)
    {
        var whitElem  = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY  = elemRect.top - document.body.scrollTop;
        var offsetX  = elemRect.left - document.body.scrollLeft;
        var newPoint = {};

        newPoint.x = Math.round(e.clientX - offsetX);
        newPoint.y = Math.round(e.clientY - offsetY);

        if(this.pointList.length)
        {

            if(Math.round(this.pointList[this.pointList.length - 1].x - newPoint.x) || Math.round(this.pointList[this.pointList.length - 1].y - newPoint.y))
            {
                var context = whitElem.getContext('2d');
                this.isPoint = false;

                context.beginPath();
                context.moveTo(this.pointList[this.pointList.length - 1].x, this.pointList[this.pointList.length - 1].y);
                context.lineTo(newPoint.x, newPoint.y);
                context.stroke();

                this.pointList[this.pointList.length] = newPoint;
            }
        }
        else
        {
            this.pointList[this.pointList.length] = newPoint;
        }
    }
},
touchMove: function(e)
{
    if(this.state.touchPress)
    {
    }
},
render: function render()
{
    var inElem = React.createElement('canvas', {className: "inputSpace", id: "whiteBoard-input", onMouseDown: this.mouseDown, onMouseUp: this.mouseUp, onMouseMove: this.mouseMove, onMouseLeave: this.mouseUp});

    //document.body.addEventListener("mouseup", this.mouseUp, false);
    //document.body.addEventListener("touchcancel", this.touchUp, false);

    var outElem = React.createElement(SVGComponent, {className: "renderSpace", id: "whiteBoard-output", curveListLoc: this.state.curveListLoc, curveListRem: this.state.curveListRem});
    return  (React.createElement("div", {className: "whiteboard-app-container large-6 columns", id: "whiteboard-container"}, inElem, outElem));
}});
