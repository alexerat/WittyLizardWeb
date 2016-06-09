"use strict";

var UserMedia = React.createClass({displayName: 'UserMedia',
    render: function()
    {
        var streamUrl = window.URL.createObjectURL(this.props.stream);
        var vidElem = React.createElement('video', {className: "userVideo", src: streamUrl, autoPlay: true});
        var usrName = React.createElement('p', {className: "userName"}, this.props.username);
        return  (React.createElement("li", { className: "userContainer"}, vidElem, usrName));
    }
});

var MediaContainer = React.createClass({displayName: 'MediaContainer',
updateList: function(userData)
{

    this.setState({data: userData});

},
getInitialState: function()
{
    return {data: []};
},
componentDidMount: function()
{

},
render: function render()
{
    var mediaNodes = this.state.data.map(function (user)
    {
        return React.createElement(UserMedia, { username: user.username, stream: user.stream, key: user.userId });
    });
    return React.createElement("ul", { className: "small-block-grid-3" }, mediaNodes);
}});

var SVGBezier = React.createClass({displayName: 'SVGBezier',
getInitialState: function()
{
    this.id = -1;
    this.isLocal = false;
    this.mouseCallback = function(local, id) {};
    return null;
},
mouseClick: function(e)
{
    if(this.id != -1)
    {
        this.mouseCallback(this.isLocal, this.id);
    }
},
mouseMove: function(e)
{
    if(e.buttons & 1 && this.id != -1)
    {
        this.mouseCallback(this.isLocal, this.id);
    }
},
render: function()
{
    this.isLocal = this.props.local;
    this.id = this.props.curveId;
    this.mouseCallback = this.props.mouseCall;

    if(this.props.curveData.length == 1)
    {
        return React.createElement("circle", {cx: this.props.curveData[0].x, cy: this.props.curveData[0].y, r: this.props.size, fill: this.props.colour, stroke: this.props.colour, onClick: this.mouseClick, onMouseMove: this.mouseMove});
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

        return React.createElement('path', {d: param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size, strokeLinecap: 'round', onClick: this.mouseClick, onMouseMove: this.mouseMove});
    }
}
});

var SVGText = React.createClass({displayName: 'SVGText',
getInitialState: function()
{
    this.id = -1;
    this.isLocal = false;
    this.mouseCallback = function(local, id) {};
    return null;
},
mouseClick: function(e)
{
    if(this.id != -1)
    {
        this.mouseCallback(this.isLocal, this.id);
    }
},
mouseMove: function(e)
{
    if(e.buttons & 1 && this.id != -1)
    {
        this.mouseCallback(this.isLocal, this.id);
    }
},
render: function()
{
    this.isLocal = this.props.local;
    this.id = this.props.textId;
    this.mouseCallback = this.props.mouseCall;

    var i;
    var j;
    var justified = true;
    var whitElem  = document.getElementById("whiteBoard-output");
    var tMount = document.createElementNS('http://www.w3.org/2000/svg', "text");
    tMount.setAttributeNS(null, "opacity", 0);
    whitElem.appendChild(tMount);

    //this function checks if there should be a dash at the given position, instead of a blank
    checkDashPosition = function(dashArray,pos)
    {
        var result = false;
        for (var i=0; i < dashArray.length; i++)
        {
            if (dashArray[i] == pos)
            {
                result = true;
            }
        }
        return result;
    };

    var childText = [];

    var dashArray = new Array();
    var dashFound = true;
    var indexPos = 0;
    var cumulY = 0;
    var counter = 0;
    var currPos = 0;
    var prevPos = 0;

    while (dashFound == true)
    {
        var result = this.props.textData.indexOf("-", indexPos);
        if (result == -1)
        {
            //could not find a dash
            dashFound = false;
        }
        else
        {
            dashArray.push(result);
            indexPos = result + 1;
        }
    }

    //split the text at all spaces and dashes
    var words = this.props.textData.split(/[\s-]/);
    var line = "";
    var dy = this.props.size;
    var ddy = 1.5 * this.props.size;
    var curNumChars = 0;
    var computedTextLength = 0;
    var sizeCheck;
    var myTextNode;
    var tspanEl = {};
    var additionalWordSpacing = 0;
    var nodeCounter = 0;
    var lastLineBreak = 0;

    for (i = 0; i < words.length; i++)
    {
        var word = words[i];
        curNumChars += word.length + 1;
        additionalWordSpacing = 0;

        if(i == 0)
        {
            if(checkDashPosition(dashArray, curNumChars - 1))
            {
                line = word + "-";
            }
            else
            {
                line = word + " ";
            }
        }

        if (computedTextLength > this.props.width)
        {
            var tempText = line;
            tempText = tempText.slice(0,(tempText.length - words[i - 1].length - 2)); //the -2 is because we also strip off white space
            tspanEl = {};
            tspanEl.styles = [];
            tspanEl.text = tempText;
            tspanEl.spacing = 0;
            tspanEl.x = this.props.x;
            tspanEl.dy = dy;
            tspanEl.id = counter;
            currPos += tempText.length;

            if(i != words.length - 1)
            {
                // If this is not the last line, account for whitespace.
                currPos++;
            }

            tspanEl.start = prevPos;
            tspanEl.end = currPos;
            prevPos = currPos;
            sizeCheck.firstChild.nodeValue = tempText;

            if (justified)
            {
                //determine the number of words in this line
                var nrWords = tempText.split(/\s/).length;

                // This is an issue.......
                computedTextLength = sizeCheck.getComputedTextLength();
                additionalWordSpacing = (this.props.width - computedTextLength) / (nrWords - 1);

                tspanEl.spacing = additionalWordSpacing;
            }

            counter++;
            nodeCounter = 0;
            for(j = 0; j < this.props.styleNodes.length; j++)
            {
                if(this.props.styleNodes[j].start < tspanEl.end && this.props.styleNodes[j].end > tspanEl.start)
                {
                    var startPoint = (this.props.styleNodes[j].start < tspanEl.start) ? 0 : (this.props.styleNodes[j].start - tspanEl.start);
                    var endPoint = (this.props.styleNodes[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (this.props.styleNodes[j].end - tspanEl.start);
                    var newStyle = {key: nodeCounter, text: tspanEl.text.slice(startPoint, endPoint), colour: this.props.styleNodes[j].colour, decoration: this.props.styleNodes[j].decoration, weight: this.props.styleNodes[j].weight, style: this.props.styleNodes[j].style};
                    tspanEl.styles.push(newStyle);
                    nodeCounter++;
                }
            }

            childText.push(tspanEl);

            if(checkDashPosition(dashArray, curNumChars - 1))
            {
                line = word + "-";
            }
            else
            {
                line = word + " ";
            }

            if (i != 0)
            {
                line = words[i - 1] + " " + line;
            }

            dy = ddy;
            cumulY += dy;
        }
        else if(i != 0)
        {
            if(checkDashPosition(dashArray, curNumChars - 1))
            {
                line += word + "-";
            }
            else
            {
                line += word + " ";
            }
        }

        if(sizeCheck)
        {
            tMount.removeChild(sizeCheck);
        }

        sizeCheck = document.createElementNS('http://www.w3.org/2000/svg', "tspan");
        tMount.appendChild(sizeCheck);
        sizeCheck.setAttributeNS(null, "x", this.props.x);
        sizeCheck.setAttributeNS(null, "dy", dy);
        sizeCheck.setAttributeNS(null, "font-size", this.props.size);
        myTextNode = document.createTextNode(line);
        sizeCheck.appendChild(myTextNode);

        computedTextLength = sizeCheck.getComputedTextLength();

        if (i == words.length - 1)
        {
            if (computedTextLength > this.props.width)
            {
                var tempText = line;

                line = tempText.slice(0,(tempText.length - word.length - 1));

                tspanEl = {};
                tspanEl.styles = [];
                tspanEl.spacing = 0;
                tspanEl.x = this.props.x;
                tspanEl.y = this.props.y;
                tspanEl.dy = dy;
                tspanEl.text = line;
                tspanEl.id = counter;

                currPos += line.length;
                if(i != words.length - 1)
                {
                    // If this is not the last line, account for whitespace.
                    currPos++;
                }

                tspanEl.start = prevPos;
                tspanEl.end = currPos;
                prevPos = currPos;

                counter++;
                nodeCounter = 0;
                for(j = 0; j < this.props.styleNodes.length; j++)
                {
                    if(this.props.styleNodes[j].start < tspanEl.end && this.props.styleNodes[j].end > tspanEl.start)
                    {
                        var startPoint = (this.props.styleNodes[j].start < tspanEl.start) ? 0 : (this.props.styleNodes[j].start - tspanEl.start);
                        var endPoint = (this.props.styleNodes[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (this.props.styleNodes[j].end - tspanEl.start);
                        var newStyle = {key: nodeCounter, text: tspanEl.text.slice(startPoint, endPoint), colour: this.props.styleNodes[j].colour, decoration: this.props.styleNodes[j].decoration, weight: this.props.styleNodes[j].weight, style: this.props.styleNodes[j].style};
                        tspanEl.styles.push(newStyle);
                        nodeCounter++;
                    }
                }

                childText.push(tspanEl);

                dy = ddy;

                tspanEl = {};
                tspanEl.styles = [];
                tspanEl.spacing = 0;
                tspanEl.x = this.props.x;
                tspanEl.y = this.props.y;
                tspanEl.dy = dy;
                tspanEl.text = word;
                tspanEl.id = counter;

                currPos += word.length;

                tspanEl.start = prevPos;
                tspanEl.end = currPos;
                prevPos = currPos;

                counter++;
                nodeCounter = 0;
                for(j = 0; j < this.props.styleNodes.length; j++)
                {
                    if(this.props.styleNodes[j].start < tspanEl.end && this.props.styleNodes[j].end > tspanEl.start)
                    {
                        var startPoint = (this.props.styleNodes[j].start < tspanEl.start) ? 0 : (this.props.styleNodes[j].start - tspanEl.start);
                        var endPoint = (this.props.styleNodes[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (this.props.styleNodes[j].end - tspanEl.start);
                        var newStyle = {key: nodeCounter, text: tspanEl.text.slice(startPoint, endPoint), colour: this.props.styleNodes[j].colour, decoration: this.props.styleNodes[j].decoration, weight: this.props.styleNodes[j].weight, style: this.props.styleNodes[j].style};
                        tspanEl.styles.push(newStyle);
                        nodeCounter++;
                    }
                }

                childText.push(tspanEl);
            }
            else
            {
                tspanEl = {};
                tspanEl.styles = [];
                tspanEl.spacing = 0;
                tspanEl.x = this.props.x;
                tspanEl.y = this.props.y;
                tspanEl.dy = dy;
                tspanEl.text = line;
                tspanEl.id = counter;

                currPos += line.length;

                tspanEl.start = prevPos;
                tspanEl.end = currPos;
                prevPos = currPos;

                counter++;
                nodeCounter = 0;
                for(j = 0; j < this.props.styleNodes.length; j++)
                {
                    if(this.props.styleNodes[j].start < tspanEl.end && this.props.styleNodes[j].end > tspanEl.start)
                    {
                        var startPoint = (this.props.styleNodes[j].start < tspanEl.start) ? 0 : (this.props.styleNodes[j].start - tspanEl.start);
                        var endPoint = (this.props.styleNodes[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (this.props.styleNodes[j].end - tspanEl.start);
                        var newStyle = {key: nodeCounter, text: tspanEl.text.slice(startPoint, endPoint), colour: this.props.styleNodes[j].colour, decoration: this.props.styleNodes[j].decoration, weight: this.props.styleNodes[j].weight, style: this.props.styleNodes[j].style};
                        tspanEl.styles.push(newStyle);
                        nodeCounter++;
                    }
                }

                childText.push(tspanEl);
            }
        }
    }

    var self = this;

    var tspanElems = childText.map(function (textElem)
    {
        //tspanEl.setAttributeNS(null, "word-spacing", additionalWordSpacing);
        //alternatively one could use textLength and lengthAdjust, however, currently this is not too well supported in SVG UA's

        var styleNodeElems = textElem.styles.map(function (node)
        {
            // TODO: Set attributes.
            return React.createElement('tspan', {key: node.key, fill: node.colour}, node.text);
        });

        return React.createElement('tspan', {key: textElem.id, x: textElem.x, dy: textElem.dy, textLength: self.props.width, wordSpacing: textElem.spacing}, styleNodeElems);
    });

    return React.createElement('text', {x: this.props.x, y: this.props.y, fontSize: this.props.size}, tspanElems);
}
});

var SVGComponent = React.createClass({displayName: 'SVGComponent',
render: function()
{
    var self = this;
    var locCurves = this.props.curveListLoc.map(function (curve)
    {
        if(!curve.isDeleted)
        {
            return React.createElement(SVGBezier, {key: 'loc' + curve.id, local: true, curveId: curve.id, mouseCall: self.props.curveEraseCall, curveData: curve.curveSet, colour: curve.colour, size: curve.size});
        }
        else
        {
            return null;
        }
    });
    var remCurves = this.props.curveListRem.map(function (curve)
    {
        if(!curve.isDeleted)
        {
            return React.createElement(SVGBezier, {key: 'rem' + curve.id, local: false, curveId: curve.id, mouseCall: self.props.curveEraseCall, curveData: curve.curveSet, colour: curve.colour, size: curve.size});
        }
        else
        {
            return null;
        }
    });
    var locText = this.props.textListLoc.map(function(textBox)
    {
        if(!textBox.isDeleted)
        {
            return React.createElement(SVGText, {key: 'loc' + textBox.id, local: true, textId: textBox.id, mouseCall: self.props.textEraseCall, styleNodes: textBox.styles, textData: textBox.text, colour: textBox.colour, size: textBox.size, x: textBox.x, y: textBox.y, width: textBox.width, height: textBox.height});
        }
        else
        {
            return null;
        }
    });
    var remText = this.props.textListRem.map(function(textBox)
    {
        if(!textBox.isDeleted)
        {
            console.log('Rendering Remote Text.');
            return React.createElement(SVGText, {key: 'rem' + textBox.id, local: false, textId: textBox.id, mouseCall: self.props.textEraseCall, styleNodes: textBox.styles, textData: textBox.text, colour: textBox.colour, size: textBox.size, x: textBox.x, y: textBox.y, width: textBox.width, height: textBox.height});
        }
        else
        {
            return null;
        }
    });

    return React.createElement('svg', { className: 'svgcomponent', id: 'whiteBoard-output', viewBox: this.props.viewBox}, locCurves, remCurves, locText, remText);
}
});


var ControlComponent = React.createClass({displayName: 'ControlComponent',
getInitialState: function()
{
    this.colourCallback = function(colour) {};
    this.modeCallback = function(mode) {};
    return {colour: 'black', mode: 0};
},
onBlack: function()
{
    this.setState({colour: 'black'});
    this.colourCallback('black');
},
onBlue: function()
{
    this.setState({colour: 'blue'});
    this.colourCallback('blue');
},
onRed: function()
{
    this.setState({colour: 'red'});
    this.colourCallback('red');
},
onGreen: function()
{
    this.setState({colour: 'green'});
    this.colourCallback('green');
},
onDrawMode: function()
{
    this.setState({mode: 0});
    this.modeCallback(0);
},
onTextMode: function()
{
    this.setState({mode: 1});
    this.modeCallback(1);
},
onEraseMode: function()
{
    this.setState({mode: 2});
    this.modeCallback(2);
},
render: function()
{
    var blackButt  = React.createElement('button', {className: 'button colour-button', id: 'black-button', onClick: this.onBlack});
    var blueButt   = React.createElement('button', {className: 'button colour-button', id: 'blue-button', onClick: this.onBlue});
    var redButt    = React.createElement('button', {className: 'button colour-button', id: 'red-button', onClick: this.onRed});
    var greenButt  = React.createElement('button', {className: 'button colour-button', id: 'green-button', onClick: this.onGreen});
    var drawButt   = React.createElement('button', {className: 'button mode-button', id: 'draw-button', onClick: this.onDrawMode}, 'D');
    var textButt   = React.createElement('button', {className: 'button mode-button', id: 'text-button', onClick: this.onTextMode}, 'T');
    var erasetButt = React.createElement('button', {className: 'button mode-button', id: 'erase-button', onClick: this.onEraseMode}, 'E');

    this.colourCallback = this.props.colourCallback;
    this.modeCallback = this.props.modeCallback;

    if(this.state.colour == 'black')
    {
        blackButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'black-button'});
    }
    else if(this.state.colour == 'blue')
    {
        blueButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'blue-button'});
    }
    else if(this.state.colour == 'red')
    {
        redButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'red-button'});
    }
    else if(this.state.colour == 'green')
    {
        greenButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'green-button'});
    }

    if(this.state.mode == 0)
    {
        drawButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'draw-button'}, 'D');
    }
    else if(this.state.mode == 1)
    {
        textButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'text-button'}, 'T');
    }
    else if(this.state.mode == 2)
    {
        erasetButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'erase-button'}, 'E');
    }

    var colourCont = React.createElement('div', {className: 'whiteboard-controlgroup', id: 'whiteboard-colourgroup'}, blackButt, blueButt, redButt, greenButt);
    var modeCont = React.createElement('div', {className: 'whiteboard-controlgroup', id: 'whiteboard-modegroup'}, drawButt, textButt, erasetButt);


    return React.createElement('div', {className: 'large-1 small-2 columns', id: 'whiteboard-controler'}, colourCont, modeCont);
}});


var Whiteboard = React.createClass({displayName: 'Whiteboard',
getInitialState: function()
{
    this.lMousePress = false;
    this.wMousePress = false;
    this.touchPress = false;
    this.pointList = [];
    this.isPoint = true;
    this.curveOutBuffer = [];
    this.curveInBuffer = [];
    this.curveInTimeouts = [];
    this.curveOutTimeouts = [];
    this.textOutBuffer = [];
    this.textInBuffer = [];
    this.textInTimeouts = [];
    this.textOutTimeouts = [];
    this.isProcessing = false;
    this.colour = 'black';
    this.mode = 0;
    this.baseSize = 1;
    this.scaleF = 1;
    this.panX = 0;
    this.panY = 0;
    this.scaleNum = 0;
    this.isHost = false;
    this.userId = 0;
    this.isWriting = false;
    this.textParam = {};
    this.textBoxTimer = null;
    this.isDisplayed = false;
    this.prevX = 0;
    this.prevY = 0;
    this.downPoint = {};
    this.currTextEdit = 0;
    this.cursorStart = 0;
    this.cursorEnd = 0;
    this.textDecoration = 'none';
    this.textStyle = 'normal';
    this.textWeight = 'normal';
    this.isLocText = true;

    return {data: [], curveListLoc: [], curveListRem: [], textListLoc: [], textListRem: [], viewBox: null};
},
completeEdit: function(textId, userId, editId)
{

    var isLoc = false;
    var i;
    var textListNewRem = this.state.textListRem.slice();
    var textListNewLoc = this.state.textListLoc.slice();
    var editData = this.textInBuffer[textId].editBuffer[userId][editId];
    var newTextList;
    var textItem;
    var fullText = '';

    for(i = 0; i < textListNewLoc.length; i++)
    {
        if(textListNewLoc[i].serverID == textId)
        {
            isLoc = true;
            textListNewLoc[i].styles.splice(data.num, 1);
        }
    }

    if(isLoc)
    {
        newTextList = textListNewLoc;
    }
    else
    {
        newTextList = textListNewRem;
    }

    for(i = 0; i < newTextList.length; i++)
    {
        if(newTextList[i].id == textId)
        {
            textItem = newTextList[i];
        }
    }

    textItem.styles = [];

    // Add
    for(i = 0; i < editData.nodes.length; i++)
    {
        textItem.styles[editData.nodes[i].num] = editData.nodes[i];
    }

    for(i = 0; i < textItem.styles.length; i++)
    {
        fullText += textItem.styles[i].text;
    }

    textItem.text = fullText;

    if(isLoc)
    {
        this.setState({textListLoc: newTextList});
    }
    else
    {
        this.setState({textListRem: newTextList});
    }
},
setSocket: function(socket)
{
    var self = this;
    this.socket = socket;

    this.socket.on('CURVE', function(data)
    {
        // Set up the buffers to recieve data.
        self.curveInBuffer[data.serverId] = data;
        self.curveInBuffer[data.serverId].points = [];

        setTimeout(function()
        {
            var i;
            var complete = true;
            for(i = 0; i < self.curveInBuffer[data.serverId].num_points; i++)
            {
                if(!self.curveInBuffer[data.serverId].points[i])
                {
                    complete = false;
                }
            }

            if(complete)
            {
                var curveListNew = [];
                if(self.state.curveListRem.length)
                {
                    curveListNew = self.state.curveListRem.slice();
                }

                curveListNew[curveListNew.length] = {id: data.serverId, user: self.curveInBuffer[data.serverId].userId, isDeleted: false, colour: self.curveInBuffer[data.serverId].colour, size: self.curveInBuffer[data.serverId].size, curveSet: self.curveInBuffer[data.serverId].points};
                self.setState({curveListRem: curveListNew});
            }
            else
            {
                // Prepare the requesting of missing data.
                self.curveInTimeouts[data.serverId] = setInterval(function()
                {
                    var j;
                    var complete = true;

                    for(j = 0; j < self.curveInBuffer[data.serverId].num_points; j++)
                    {
                        if(!self.curveInBuffer[data.serverId].points[j])
                        {
                            complete = false;
                            console.log('Sending Missing message.');
                            self.socket.emit('MISSING-CURVE', {id: data.serverId, seq_num: j});
                        }
                    }

                    if(complete)
                    {
                        clearInterval(self.curveInTimeouts[data.serverId]);
                        var curveListNew = [];
                        if(self.state.curveListRem.length)
                        {
                            curveListNew = self.state.curveListRem.slice();
                        }

                        curveListNew[curveListNew.length] = {id: data.serverId, user: self.curveInBuffer[data.serverId].userId, isDeleted: false, colour: self.curveInBuffer[data.serverId].colour, size: self.curveInBuffer[data.serverId].size, curveSet: self.curveInBuffer[data.serverId].points};
                        self.setState({curveListRem: curveListNew});
                    }

                }, 30000);
            }
        }, 500);
    });
    this.socket.on('POINT', function(data)
    {
        // Make sure we know about this curve.
        if(self.curveInBuffer[data.id])
        {
            if(!self.curveInBuffer[data.id].points[data.num])
            {
                self.curveInBuffer[data.id].points[data.num] = {x: data.x, y: data.y};
            }
        }
        else
        {
            // Request curve data.
            self.socket.emit('UNKNOWN-CURVE', data.id);
        }
    });
    this.socket.on('IGNORE-CURVE', function(curveId)
    {
        clearInterval(self.curveInTimeouts[curveId]);
    });
    this.socket.on('CURVEID', function(data)
    {
        var i;
        self.curveOutBuffer[data.localId].serverID = data.serverId;

        clearInterval(self.curveOutTimeouts[data.localId]);
        self.curveOutTimeouts.splice(data.localId, 1);

        // Send the points for this curve.
        for(i = 0; i < self.curveOutBuffer[data.localId].curveSet.length; i++)
        {
            var curve = self.curveOutBuffer[data.localId].curveSet[i];
            self.socket.emit('POINT', {id: data.serverId, num: i, x: curve.x, y: curve.y});
        }

        var curveListNewLoc = self.state.curveListLoc.slice();

        for(i = 0; i < curveListNewLoc.length; i++)
        {
            if(curveListNewLoc[i].id == data.localId)
            {
                curveListNewLoc[i].serverID = data.serverId;
            }
        }

        self.setState({curveListLoc: curveListNewLoc});

    });
    this.socket.on('MISSED-CURVE', function(data)
    {
        // The server has not recieced this point, find it and send it.

        var i;
        var curve;

        for(i = 0; i < self.curveOutBuffer.length; i++)
        {
            if(self.curveOutBuffer[i].serverID == data.curve)
            {
                curve  = self.curveOutBuffer[i].curveSet[data.point];
            }
        }

        self.socket.emit('POINT', {id: data.curve, num: data.point, x: curve.x, y: curve.y});
    });
    this.socket.on('DROPPED-CURVE', function(data)
    {
        // TODO: We need to stop trying to get it.
    });
    this.socket.on('MOVE-CURVE', function(data)
    {
        // TODO
    });
    this.socket.on('DELETE-CURVE', function(curveId)
    {
        // TODO: Only set state on changed state
        var i;
        var curveListNewRem = this.state.curveListRem.slice();
        var curveListNewLoc = this.state.curveListLoc.slice();

        for(i = 0; i < curveListNewRem.length; i++)
        {
            if(curveListNewRem[i].id == id)
            {
                curveListNewRem[i].isDeleted = true;
            }
        }

        for(i = 0; i < curveListNewLoc.length; i++)
        {
            if(curveListNewLoc[i].serverID == id)
            {
                curveListNewLoc[i].isDeleted = true;
            }
        }

        this.setState({curveListRem: curveListNew});
        this.setState({curveListLoc: curveListNewLoc});
    });
    this.socket.on('TEXTBOX', function(data)
    {
        console.log('Received Textbox.');
        // Set up the buffers to recieve data.

        // TODO: keep editBuffer

        if(self.textInBuffer[data.serverId])
        {
            data.editBuffer = self.textInBuffer[data.serverId].editBuffer;
        }
        else
        {
            data.editBuffer = [];
        }

        self.textInBuffer[data.serverId] = data;
        self.textInBuffer[data.serverId].styles = [];

        var textListNew = [];

        if(self.state.textListRem.length)
        {
            textListNew = self.state.textListRem.slice();
        }

        textListNew[textListNew.length] =
        {
            id: data.serverId, text: '', user: data.userId, isDeleted: false, x: data.posX, y: data.posY, size: data.size, styles: [], editCount: 0,
            width: data.width, height: data.height, editLock: data.editLock
        };

        self.setState({textListRem: textListNew});
    });
    this.socket.on('STYLENODE', function(data)
    {
        console.log('Received Node.');

        if(!self.textInBuffer[data.id])
        {
            self.socket.emit('UNKNOWN-TEXT', data.id);
        }
        else
        {
            if(!self.textInBuffer[data.id].editBuffer[data.userId])
            {
                self.textInBuffer[data.id].editBuffer[data.userId] = [];
            }

            if(self.textInBuffer[data.id].editBuffer[data.userId][data.editId])
            {
                var buffer = self.textInBuffer[data.id].editBuffer[data.userId][data.editId];

                buffer.nodes.push(data);
                console.log('Num nodes is: ' + buffer.num_nodes);
                if(buffer.nodes.length == buffer.num_nodes)
                {
                    console.log('Received all nodes.');
                    self.completeEdit(data.id, data.userId, data.editId);
                }
            }
            else
            {
                self.socket.emit('UNKNOWN-EDIT', {id: data.id, userId: data.userId, editId: data.editId});
            }
        }
    });
    this.socket.on('TEXTID', function(data)
    {
        // TODO: set server ID, then send latest edit.

        var i;
        var textListNewLoc = self.state.textListLoc.slice();

        console.log('Recveived Textbox ID.');
        console.log(self.textOutBuffer[data.localId]);
        self.textOutBuffer[data.localId].serverID = data.serverId;

        for(i = 0; i < textListNewLoc.length; i++)
        {
            if(textListNewLoc[i].id == data.localId)
            {
                textListNewLoc[i].serverID = data.serverId;
            }
        }

        // TODO: Send the latest edit buffer entry

        self.setState({textListLoc: textListNewLoc});
    });
    this.socket.on('LOCK-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('LOCKID-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('EDITID-TEXT', function(data)
    {
        var i;
        // TODO: this may need a lock

        console.log('Got edit ID');

        if(data.localId > self.textOutBuffer[data.bufferId].lastSent || !self.textOutBuffer[data.bufferId].lastSent)
        {
            console.log('Starting to send stylenodes');
            console.log(data.localId);
            self.textOutBuffer[data.bufferId].lastSent = data.localId;
            console.log(self.textOutBuffer[data.bufferId].editBuffer[data.localId].nodes);
            for(i = 0; i < self.textOutBuffer[data.bufferId].editBuffer[data.localId].nodes.length; i++)
            {
                console.log('Sent node.');
                self.textOutBuffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.id;
                self.socket.emit('STYLENODE', self.textOutBuffer[data.bufferId].editBuffer[data.localId].nodes[i]);
            }
        }

    });
    this.socket.on('FAILED-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('REFUSED-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('RELEASE-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('EDIT-TEXT', function(data)
    {
        console.log('Received Edit.');
        if(!self.textInBuffer[data.id])
        {
            self.socket.emit('UNKNOWN-TEXT', data.id);
        }
        else
        {
            if(!self.textInBuffer[data.id].editBuffer[data.userId])
            {
                self.textInBuffer[data.id].editBuffer[data.userId] = [];
            }

            self.textInBuffer[data.id].editBuffer[data.userId][data.editId] = {num_nodes: data.nodes, nodes: []};
        }

    });
    this.socket.on('MOVE-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('DELETE-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('IGNORE-TEXT', function(curveId)
    {
        // TODO: Rename some shizzle
        clearInterval(self.curveInTimeouts[curveId]);
    });
    this.socket.on('DROPPED-TEXT', function(data)
    {
        // TODO: We need to stop trying to get it.
    });
    this.socket.on('MISSED-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('ERROR', function(data)
    {
        // TODO: Server error.
        console.log('SERVER: ' + data);
    });
},
colourChange: function(newColour)
{
    this.colour = newColour;
},
modeChange: function(newMode)
{
    this.mode = newMode;

    var whitElem = document.getElementById("whiteBoard-input");
    var context  = whitElem.getContext('2d');

    this.isDisplayed = false;
    this.isWriting = false;
    clearInterval(this.textBoxTimer);
    context.clearRect(0, 0, whitElem.width, whitElem.height);

},
handleCurveErase: function(local, id)
{
    if(this.mode == 2)
    {
        if(local)
        {
            var remId = this.curveOutBuffer[id].serverID;
            var curveListNew = this.state.curveListLoc.slice();
            curveListNew[id].isDeleted = true;
            this.socket.emit('DELETE-CURVE', remId);
            this.setState({curveListLoc: curveListNew});
        }
        else
        {   var i;
            var curveListNew = this.state.curveListRem.slice();

            for(i = 0; i < curveListNew.length; i++)
            {
                if(curveListNew[i].id == id)
                {
                    console.log('Test local user: ' + this.userId + ' curve user: ' + curveListNew[i].user);
                    if(this.isHost || this.userId == curveListNew[i].user)
                    {
                        curveListNew[i].isDeleted = true;
                        this.socket.emit('DELETE-CURVE', id);
                    }
                }
            }

            this.setState({curveListRem: curveListNew});
        }
    }
},
handleTextErase: function(local, id)
{
},
textFlash: function(whitElem, context, self)
{
    if(self.isDisplayed)
    {
        self.isDisplayed = false;
        context.clearRect(0, 0, whitElem.width, whitElem.height);
    }
    else
    {
        self.isDisplayed = true;
        context.beginPath();
        context.strokeStyle = 'black';
        context.setLineDash([5]);
        context.strokeRect(this.textParam.x, this.textParam.y, this.textParam.width, this.textParam.height);
        context.stroke();
    }
},
mouseUp: function(e)
{
    if(this.lMousePress && !this.wMousePress)
    {
        if(this.mode == 0)
        {
            this.isProcessing = true;

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

            if(this.isPoint)
            {
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY  = elemRect.top - document.body.scrollTop;
                var offsetX  = elemRect.left - document.body.scrollLeft;

                curves = [];
                curves[0] = {x: Math.round(e.clientX - offsetX) * this.scaleF + this.panX, y: Math.round(e.clientY - offsetY) * this.scaleF + this.panY};
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
                    reducedPoints[i].x = reducedPoints[i].x * this.scaleF + this.panX;
                    reducedPoints[i].y = reducedPoints[i].y * this.scaleF + this.panY;
                    tStr = tStr + "(" + reducedPoints[i].x + ", " + reducedPoints[i].y + "), ";
                }

                curves = FitCurve(reducedPoints, reducedPoints.length, 5);

                tStr = tStr + " Num Curves: " + curves.length;
                console.log(tStr);
            }

            this.curveOutBuffer[curveListNew.length] = {id: curveListNew.length, colour: this.colour, curveSet: curves, size: this.scaleF};
            curveListNew[curveListNew.length] = {id: curveListNew.length, isDeleted: false, colour: this.colour, curveSet: curves, size: this.scaleF};

            var self = this;

            // TODO: This is a callback, references may be screwy
            this.curveOutTimeouts[curveListNew.length - 1] = setInterval(function()
            {
                self.socket.emit('CURVE', {id: curveListNew.length - 1, colour: self.colour, num_points: curves.length, size: self.scaleF});
            }, 60000);

            this.socket.emit('CURVE', {id: curveListNew.length - 1, colour: this.colour, num_points: curves.length, size: this.scaleF});

            this.setState({curveListLoc: curveListNew});
        }
        else if(this.mode == 1)
        {
            var whitElem = document.getElementById("whiteBoard-input");
            var context  = whitElem.getContext('2d');

            if(!this.isWriting)
            {
                var self = this;
                var rectLeft;
                var rectTop;
                var rectWidth;
                var rectHeight;
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY  = elemRect.top - document.body.scrollTop;
                var offsetX  = elemRect.left - document.body.scrollLeft;
                var newPoint = {};

                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);


                if(newPoint.x > this.downPoint.x)
                {
                    rectLeft = this.downPoint.x;
                    rectWidth = newPoint.x - this.downPoint.x;
                }
                else
                {
                    rectLeft = newPoint.x;
                    rectWidth = this.downPoint.x - newPoint.x;
                }

                if(newPoint.y > this.downPoint.y)
                {
                    rectTop = this.downPoint.y;
                    rectHeight = newPoint.y - this.downPoint.y;
                }
                else
                {
                    rectTop = newPoint.y;
                    rectHeight = this.downPoint.y - newPoint.y;
                }

                this.textParam.x = rectLeft;
                this.textParam.y = rectTop;
                this.textParam.width = rectWidth;
                this.textParam.height = rectHeight;

                if(rectWidth > 0 && rectHeight > 0)
                {
                    this.isWriting = true;
                    this.isDisplayed = true;
                    this.cursorStart = 0;
                    this.cursorEnd = 0;

                    var textListNew = [];
                    var textBoxNew = {};

                    textBoxNew.x = this.textParam.x * this.scaleF + this.panX;
                    textBoxNew.y = this.textParam.y * this.scaleF + this.panY;
                    textBoxNew.width = this.textParam.width * this.scaleF;
                    textBoxNew.height = this.textParam.height * this.scaleF;
                    textBoxNew.size = this.scaleF * 20;
                    textBoxNew.colour = this.colour;
                    textBoxNew.text = '';
                    textBoxNew.styles = [];
                    textBoxNew.isDeleted = false;
                    textBoxNew.isLocal = true;
                    textBoxNew.editCount = 0;

                    if(this.state.textListLoc.length)
                    {
                        textListNew = this.state.textListLoc.slice();
                    }

                    textBoxNew.id = textListNew.length;
                    this.currTextEdit = textListNew.length;
                    textListNew[textListNew.length] = textBoxNew;

                    this.setState({textListLoc: textListNew});

                    this.textBoxTimer = setInterval(function() { self.textFlash(whitElem, context, self); }, 250);
                }
            }
            else
            {
                this.isWriting = false;
                clearInterval(this.textBoxTimer);
                this.isDisplayed = false;
                context.clearRect(0, 0, whitElem.width, whitElem.height);
            }
        }
    }

    this.lMousePress = false;
    this.wMousePress = false;
    this.isProcessing = false;
    this.pointList = [];
},
touchUp: function()
{
    this.touchPress = false;
},
mouseDown: function(e)
{
    if(!this.lMousePress && !this.wMousePress)
    {
        this.lMousePress = e.buttons & 1;
        this.wMousePress = e.buttons & 4;
        this.isPoint = true;
        var whitElem  = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY  = elemRect.top - document.body.scrollTop;
        var offsetX  = elemRect.left - document.body.scrollLeft;
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.downPoint = {x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY)};
    }
},
touchDown: function()
{
    this.touchPress = true;
},
mouseMove: function(e)
{
    if(!this.isProcessing)
    {

        if(this.wMousePress)
        {
            var whitElem  = document.getElementById("whiteboard-container");

            var newPanX = this.panX + (this.prevX - e.clientX) * this.scaleF;
            var newPanY = this.panY + (this.prevY - e.clientY) * this.scaleF;
            var vBoxW = whitElem.clientWidth * this.scaleF;
            var vBoxH = whitElem.clientHeight * this.scaleF;

            this.prevX = e.clientX;
            this.prevY = e.clientY;

            if(newPanX < 0)
            {
                newPanX = 0;
            }
            if(newPanY < 0)
            {
                newPanY = 0;
            }
            this.panX = newPanX;
            this.panY = newPanY;
            var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;

            this.setState({viewBox: newVBox});
        }
        else if(this.lMousePress)
        {
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY  = elemRect.top - document.body.scrollTop;
            var offsetX  = elemRect.left - document.body.scrollLeft;
            var context  = whitElem.getContext('2d');
            var newPoint = {};

            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);

            // Mode 0 is draw mode, mode 1 is text mode.
            if(this.mode == 0)
            {
                if(this.pointList.length)
                {

                    if(Math.round(this.pointList[this.pointList.length - 1].x - newPoint.x) < this.scaleF || Math.round(this.pointList[this.pointList.length - 1].y - newPoint.y))
                    {

                        this.isPoint = false;

                        context.beginPath();
                        context.strokeStyle = this.colour;
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
            else if(this.mode == 1)
            {
                var rectLeft;
                var rectTop;
                var rectWidth;
                var rectHeight;

                if(newPoint.x > this.downPoint.x)
                {
                    rectLeft = this.downPoint.x;
                    rectWidth = newPoint.x - this.downPoint.x;
                }
                else
                {
                    rectLeft = newPoint.x;
                    rectWidth = this.downPoint.x - newPoint.x;
                }

                if(newPoint.y > this.downPoint.y)
                {
                    rectTop = this.downPoint.y;
                    rectHeight = newPoint.y - this.downPoint.y;
                }
                else
                {
                    rectTop = newPoint.y;
                    rectHeight = this.downPoint.y - newPoint.y;
                }

                context.clearRect(0, 0, whitElem.width, whitElem.height);

                if(rectWidth > 0 && rectHeight > 0)
                {
                    context.beginPath();
                    context.strokeStyle = 'black';
                    context.setLineDash([5]);
                    context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
                    context.stroke();
                }
            }
        }

    }
},
touchMove: function(e)
{
    if(this.state.touchPress)
    {
    }
},
windowResize: function(e)
{
    var whitElem  = document.getElementById("whiteBoard-input");
    var whitCont  = document.getElementById("whiteboard-container");

    whitElem.style.width = whitCont.clientWidth + "px";
    whitElem.style.height = whitCont.clientHeight + "px";
    whitElem.width = whitElem.clientWidth;
    whitElem.height = whitElem.clientHeight;

    var vBoxW = whitElem.clientWidth * this.scaleF;
    var vBoxH = whitElem.clientHeight * this.scaleF;
    var newPanX = this.panX;
    var newPanY = this.panY;

    var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;

    this.setState({viewBox: newVBox});
},
mouseWheel: function(e)
{
    var whitElem  = document.getElementById("whiteboard-container");
    var newPanX;
    var newPanY;
    var newScale;

    this.scaleNum = this.scaleNum - e.deltaY / 2;

    if(this.scaleNum < -5)
    {
        this.scaleNum = -5;
    }
    if(this.scaleNum > 5)
    {
        this.scaleNum = 5;
    }

    newScale = Math.pow(0.8, this.scaleNum);
    var vBoxW = whitElem.clientWidth * newScale;
    var vBoxH = whitElem.clientHeight * newScale;

    if(e.deltaY < 0)
    {
        // Zoom in behaviour.
        newPanX = this.panX + (e.clientX - whitElem.offsetLeft) * this.scaleF - vBoxW / 2;
        newPanY = this.panY + (e.clientY - whitElem.offsetTop) * this.scaleF - vBoxH / 2;
    }
    else
    {
        // Zoom out behaviour.
        newPanX = this.panX + 0.5 * whitElem.clientWidth * (this.scaleF - newScale);
        newPanY = this.panY + 0.5 * whitElem.clientHeight * (this.scaleF - newScale);
    }

    this.scaleF = newScale;

    if(newPanX < 0)
    {
        newPanX = 0;
    }
    if(newPanY < 0)
    {
        newPanY = 0;
    }

    this.panX = newPanX;
    this.panY = newPanY;
    var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;

    this.setState({viewBox: newVBox});
},
keyDown: function(e)
{
    if(this.isWriting)
    {
        var inputChar = e.key;
    }
},
keyUp: function(e)
{

},
isCurrentStyle: function(style)
{
    if(style.colour == this.colour && style.decoration == this.textDecoration && style.weight == this.textWeight && style.style == this.textStyle)
    {
        return true;
    }
    else
    {
        return false;
    }
},
textEdited: function(textbox)
{
    console.log('Text Edit Called.');

    if(textbox.isLocal)
    {
        if(this.textOutBuffer[textbox.id])
        {
            // Check for changes
            var i;
            var newTxtBuffer = {id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, height: textbox.height, editCount: 0, editBuffer: []};
            var editNum = this.textOutBuffer[textbox.id].editCount;
            this.textOutBuffer[textbox.id].editCount++;

            this.textOutBuffer[textbox.id].editBuffer[editNum] = {};
            this.textOutBuffer[textbox.id].editBuffer[editNum].nodes = [];

            for(i = 0; i < textbox.styles.length; i++)
            {


                this.textOutBuffer[textbox.id].editBuffer[editNum].nodes.push(
                    {   num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                        weight: textbox.styles[i].weight, decor:  textbox.styles[i].decoration, style: textbox.styles[i].style,
                        start: textbox.styles[i].start, end: textbox.styles[i].end
                    }
                );
            }

            if(this.textOutBuffer[textbox.id].serverID)
            {
                console.log('This happend.');
                this.socket.emit('EDIT-TEXT', {id: this.textOutBuffer[textbox.id].serverID, bufferId: textbox.id, localId: editNum, nodes: textbox.styles.length});
            }

        }
        else
        {
            // This is a new textbox.
            var newTxtBuffer = {id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, height: textbox.height, editCount: 0, editBuffer: []};
            newTxtBuffer.styles = textbox.styles.slice();

            newTxtBuffer.editBuffer[newTxtBuffer.editCount] = {};
            newTxtBuffer.editBuffer[newTxtBuffer.editCount].nodes = [];

            for(i = 0; i < textbox.styles.length; i++)
            {
                newTxtBuffer.editBuffer[newTxtBuffer.editCount].nodes.push(
                    {   num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                        weight: textbox.styles[i].weight, decor:  textbox.styles[i].decoration, style: textbox.styles[i].style,
                        start: textbox.styles[i].start, end: textbox.styles[i].end
                    }
                );
            }

            newTxtBuffer.editCount++;

            this.textOutBuffer[textbox.id] = newTxtBuffer;
            this.socket.emit('TEXTBOX', {id: textbox.id, posX: this.textOutBuffer[textbox.id].x, posY: this.textOutBuffer[textbox.id].y, size: this.textOutBuffer[textbox.id].size, width: this.textOutBuffer[textbox.id].width, height: this.textOutBuffer[textbox.id].height});
        }
    }
    else
    {
        // Check for changes
        var i;

        for(i = textbox.styles.length; i < this.textInBuffer[textbox.id].styles.length; i++)
        {
            // Delete this style
            // TODO
            this.socket.emit('DELETE-NODE', {});
        }
        for(i = 0; i < textbox.styles.length; i++)
        {
            if(this.textInBuffer[textbox.id].styles[i])
            {
                // This style already exists, check if it is the same.
                // TODO
                if(!thesame)
                {
                    this.socket.emit('EDIT-NODE', {});
                }
            }
            else
            {
                // New node
                // TODO
                this.socket.emit('STYLENODE', {isNew: true});
            }
        }
    }
},
keyPress: function(e)
{
    if(this.isWriting)
    {
        e.preventDefault();
        var inputChar = e.key;

        switch(inputChar)
        {
            case 'ArrowLeft':
                break;
            case 'ArrowRight':
                break;
            case 'ArrowUp':
                break;
            case 'ArrowDown':
                break;
            case 'Backspace':
                break;
            default:
                var textListNew;

                if(this.isLocText)
                {
                    textListNew = this.state.textListLoc.slice();
                }
                else
                {
                    textListNew = this.state.textListRem.slice();
                }

                var i;
                var isNew = true;
                var textStart = textListNew[this.currTextEdit].text.slice(0, this.cursorStart);
                var textEnd = textListNew[this.currTextEdit].text.slice(this.cursorEnd, textListNew[this.currTextEdit].text.length);
                var styles = [];

                for(i = 0; i < textListNew[this.currTextEdit].styles.length; i++)
                {
                    var sty = textListNew[this.currTextEdit].styles[i];
                    styles[i] = {start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text};
                }

                textListNew[this.currTextEdit].text = textStart + inputChar + textEnd;

                for(i = 0; i < styles.length; i++)
                {
                    if(styles[i].end > this.cursorStart)
                    {
                        if(styles[i].start > this.cursorEnd)
                        {
                            // This style is all after the selected text.
                            styles[i].start -= this.cursorEnd - this.cursorStart - 1;
                            styles[i].end -= this.cursorEnd - this.cursorStart - 1;
                        }
                        else if(styles[i].start >= this.cursorStart)
                        {
                            // The style starts after the cursor
                            if(styles[i].end > this.cursorEnd)
                            {
                                // The style stradles the right side of the selection.
                                styles[i].start = this.cursorStart + 1;
                                styles[i].end -= this.cursorEnd - this.cursorStart - 1;
                                if(this.isCurrentStyle(styles[i]))
                                {
                                    isNew = false;
                                    styles[i].start--;
                                }
                            }
                            else
                            {
                                // The syle is completely within the cursor selection.
                                if(this.isCurrentStyle(styles[i]))
                                {
                                    isNew = false;
                                    styles[i].start = this.cursorStart;
                                    styles[i].end = this.cursorStart + 1;
                                }
                                else
                                {
                                    // Remove this style.
                                    styles.splice(i, 1);
                                    i--;
                                }
                            }
                        }
                        else
                        {
                            // The style starts before the cursor.
                            if(styles[i].end >= this.cursorEnd)
                            {
                                // The cursor selection is completely within the style.
                                if(this.isCurrentStyle(styles[i]))
                                {
                                    isNew = false;
                                    styles[i].end -= this.cursorEnd - this.cursorStart - 1;
                                }
                                else
                                {
                                    // Split this style ready for the new style.
                                    var newSplit = {start: this.cursorStart + 1, end: styles[i].end + this.cursorStart - cursorEnd + 1, decoration: styles[i].decoration, weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour};

                                    styles[i].end = this.cursorStart;

                                    styles.splice(i, 0, newSplit);
                                }
                            }
                            else
                            {
                                // The style stradles the left hand side of the selection.
                                if(this.isCurrentStyle(styles[i]))
                                {
                                    isNew = false;
                                }

                                styles[i].start = this.cursorEnd + 1;
                                styles[i].end -= this.cursorEnd - styles[i].end - 1;
                            }
                        }
                    }
                    else if(this.cursorStart == styles[i].end && this.isCurrentStyle(styles[i]))
                    {
                        isNew = false;
                        styles[i].end++;
                    }

                    styles[i].text = textListNew[this.currTextEdit].text.slice(styles[i].start, styles[i].end);

                }

                if(isNew)
                {
                    i = 0;

                    while(i < styles.length && styles[i].end < this.cursorStart)
                    {
                        i++
                    }

                    var newStyle = {start: this.cursorStart, end: this.cursorStart + 1, decoration: this.textDecoration, weight: this.textWeight, style: this.textStyle, colour: this.colour};
                    styles.splice(i + 1, 0, newStyle);
                }

                textListNew[this.currTextEdit].styles = styles;
                textListNew[this.currTextEdit].editCount++;

                if(textListNew[this.currTextEdit].editCount > 5)
                {
                    // Notify of changes and clear that pesky timeout
                    textListNew[this.currTextEdit].editCount = 0;
                    clearTimeout(textListNew[this.currTextEdit].editTimer);
                    this.textEdited(textListNew[this.currTextEdit]);
                }
                else
                {
                    // Set timeout
                    var self = this;
                    clearTimeout(this.editTimer);
                    this.editTimer = setTimeout(function(tBox)
                    {
                        tBox.editCount = 0;
                        self.textEdited(tBox);
                        clearTimeout(this.editTimer);

                    }, 30000, textListNew[this.currTextEdit]);
                }

                this.cursorStart++;
                this.cursorEnd = this.cursorStart;

                if(this.isLocText)
                {
                    this.setState({textListLoc: textListNew});
                }
                else
                {
                    this.setState({textListRem: textListNew});
                }

                break;
        }
    }
},
componentDidMount: function()
{
    var whitElem  = document.getElementById("whiteBoard-input");
    var whitCont  = document.getElementById("whiteboard-container");

    whitElem.style.width = whitCont.clientWidth + "px";
    whitElem.style.height = whitCont.clientHeight + "px";
    whitElem.width = whitElem.clientWidth;
    whitElem.height = whitElem.clientHeight;
    window.addEventListener("resize", this.windowResize);
    document.addEventListener("keypress", this.keyPress);

    var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;

    this.setState({viewBox: newVBox});
},
render: function render()
{
    this.isHost = this.props.isHost;
    this.userId = this.props.userId;

    var inElem = React.createElement('canvas', {className: "inputSpace", id: "whiteBoard-input"});

    //document.body.addEventListener("mouseup", this.mouseUp, false);
    //document.body.addEventListener("touchcancel", this.touchUp, false);

    var outElem = React.createElement(SVGComponent, {className: "renderSpace", id: "whiteBoard-output", curveEraseCall: this.handleCurveErase, textEraseCall: this.handleTextErase, curveListLoc: this.state.curveListLoc, curveListRem: this.state.curveListRem, textListLoc: this.state.textListLoc, textListRem: this.state.textListRem, viewBox: this.state.viewBox});
    var whitElem = React.createElement('div', {className: "large-11 small-10 columns", id: "whiteboard-container", onMouseDown: this.mouseDown, onMouseUp: this.mouseUp, onMouseMove: this.mouseMove, onMouseLeave: this.mouseUp, onWheel: this.mouseWheel}, inElem, outElem);
    var contElem = React.createElement(ControlComponent, {className: "controlPanel", id: "whiteboard-controller", colourCallback: this.colourChange, modeCallback: this.modeChange});

    return  (React.createElement("div", {className: "row", id: "whiteboard-row"}, whitElem, contElem));
}});


function SmoothCurve(d)
{
	var i;
	var smoothed = [];

	smoothed[0] = {};
	smoothed[0].x = d[0].x;
	smoothed[0].y = d[0].y;
	smoothed[d.length - 1] = {};
	smoothed[d.length - 1].x = d[d.length - 1].x;
	smoothed[d.length - 1].y = d[d.length - 1].y;

	if(d.length < 3)
	{
		return smoothed;
	}

	smoothed[1] 	= {};
	smoothed[1].x 	= Math.round(0.27901 * d[0].x + 0.44198 * d[1].x + 0.27901 * d[2].x);
	smoothed[1].y 	= Math.round(0.27901 * d[0].y + 0.44198 * d[1].y + 0.27901 * d[2].y);

	if(d.length < 4)
	{
		return smoothed;
	}

	smoothed[d.length - 2] 	= {};
	smoothed[d.length - 2].x 	= Math.round(0.27901 * d[d.length - 3].x + 0.44198 * d[d.length - 2].x + 0.27901 * d[d.length - 1].x);
	smoothed[d.length - 2].y 	= Math.round(0.27901 * d[d.length - 3].y + 0.44198 * d[d.length - 2].y + 0.27901 * d[d.length - 1].y);

	if(d.length < 5)
	{
		return smoothed;
	}

	smoothed[2] 	= {};
	smoothed[2].x 	= Math.round(0.06136 * d[0].x + 0.24477 * d[1].x + 0.38774 * d[2].x + 0.24477 * d[3].x + 0.06136 * d[4].x);
	smoothed[2].y 	= Math.round(0.06136 * d[0].y + 0.24477 * d[1].y + 0.38774 * d[2].y + 0.24477 * d[3].y + 0.06136 * d[4].y);

	if(d.length < 6)
	{
		return smoothed;
	}

	smoothed[d.length - 3] 		= {};
	smoothed[d.length - 3].x 	= Math.round(0.06136 * d[d.length - 5].x + 0.24477 * d[d.length - 4].x + 0.38774 * d[d.length - 3].x + 0.24477 * d[d.length - 2].x + 0.06136 * d[d.length - 1].x);
	smoothed[d.length - 3].y 	= Math.round(0.06136 * d[d.length - 5].y + 0.24477 * d[d.length - 4].y + 0.38774 * d[d.length - 3].y + 0.24477 * d[d.length - 2].y + 0.06136 * d[d.length - 1].y);

	if(d.length < 7)
	{
		return smoothed;
	}

	for(i = 3; i < d.length - 3; i++)
	{
		smoothed[i] = {};
		smoothed[i].x 	= 0.383103 * d[i].x;
		smoothed[i].x 	= smoothed[i].x + 0.241843 * d[i - 1].x + 0.060626 * d[i - 2].x + 0.00598 * d[i - 3].x;
		smoothed[i].x 	= smoothed[i].x + 0.241843 * d[i + 1].x + 0.060626 * d[i + 2].x + 0.00598 * d[i + 3].x;
		smoothed[i].x	= Math.round(smoothed[i].x);
		smoothed[i].y 	= 0.383103 * d[i].y;
		smoothed[i].y 	= smoothed[i].y + 0.241843 * d[i - 1].y + 0.060626 * d[i - 2].y + 0.00598 * d[i - 3].y;
		smoothed[i].y 	= smoothed[i].y + 0.241843 * d[i + 1].y + 0.060626 * d[i + 2].y + 0.00598 * d[i + 3].y;
		smoothed[i].y	= Math.round(smoothed[i].y);
	}

    return smoothed;
}

function DeCluster(d, Rsqr)
{
	var i;
	var j;
	var reduced = [];
	var tmpVals;
	var prevPoint;
	var tmpVals;
	var avPoint;

	reduced[0] = {};
	reduced[0].x = d[0].x;
	reduced[0].y = d[0].y;

	i = 0;
	j = 0;
	prevPoint = 0;


	while(i < d.length)
	{

		while((Math.pow((reduced[reduced.length - 1].x - d[i].x), 2) + Math.pow((reduced[reduced.length - 1].y - d[i].y), 2)) < Rsqr && i < d.length - 1)
		{
			i++;
		}

		tmpVals = [];

		for(j = prevPoint; j < d.length && (j < i || (Math.pow((d[j].x - d[i].x), 2) + Math.pow((d[j].y - d[i].y), 2)) < Rsqr); j++)
		{
			if((Math.pow((d[j].x - d[i].x), 2) + Math.pow((d[j].y - d[i].y), 2)) < Rsqr)
			{
				tmpVals.push(d[j]);
			}
		}

		avPoint = {};
		avPoint.x = 0;
		avPoint.y = 0;

		for(j = 0; j < tmpVals.length; j++)
		{
			avPoint.x = avPoint.x + tmpVals[j].x;
			avPoint.y = avPoint.y + tmpVals[j].y;
		}

		avPoint.x = Math.round(avPoint.x / tmpVals.length);
		avPoint.y = Math.round(avPoint.y / tmpVals.length);

		if(avPoint.x != reduced[reduced.length - 1].x && avPoint.y != reduced[reduced.length - 1].y)
		{
			reduced[reduced.length] = {};
			reduced[reduced.length - 1].x = avPoint.x;
			reduced[reduced.length - 1].y = avPoint.y;
			prevPoint = i;
		}
		else
		{
			reduced[reduced.length] = {};
			reduced[reduced.length - 1].x = d[i].x;
			reduced[reduced.length - 1].y = d[i].y;
			prevPoint = i;
		}

		i++;
	}

	return reduced;
}

function findPerpendicularDistance(point, line)
{
    var pointX = point.x;
    var pointY = point.y;
    var lineStart = line[0];
    var lineEnd = line[1];
    var slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
    var intercept = lineStart.y - (slope * lineStart.x);
    var result;

    result = Math.abs(slope * pointX - pointY + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);

    return result;
}

var bezierData = [];
var segcount;

function FitCurve(d, nPts, error)
{
	segcount = 0;
	bezierData = [];

	bezierData[0] = {};
	bezierData[0].x = d[0].x;
	bezierData[0].y = d[0].y;

    var leftTangent = ComputeLeftTangent(d, 0);
    var rightTangent = ComputeRightTangent(d, nPts - 1);

	var retVal = FitCubic(d, 0, nPts - 1, leftTangent, rightTangent, error);

	return bezierData;
}

/*
 *  FitCubic :
 *  	Fit a Bezier curve to a (sub)set of digitized points
 */
function FitCubic(d, first, last, leftTangent, rightTangent, error)
{
    var	bezCurve = [];		/* Control points of fitted Bezier curve*/
    var	u;					/* Parameter values for point  */
    var	uPrime;				/* Improved parameter values */
	var maxRet;
    var	maxError;			/* Maximum fitting error	 */
    var splitPoint;			/* Point to split point set at	 */
    var nPts;				/* Number of points in subset  */
    var	iterationError;		/* Error below which you try iterating  */
    var maxIterations = 4;	/* Max times to try iterating  */
    var tHatCenter;   		/* Unit tangent vector at splitPoint */
	var tHatLeft;
	var tHatRight;
    var i;

    iterationError = error * error;
    nPts = last - first + 1;

    /*  Use heuristic if region only has two points in it */
    if (nPts == 2)
	{
	    var dist = VDist(d[last], d[first]) / 3.0;

		bezCurve[0] = {};
		bezCurve[0].x = d[first].x;
		bezCurve[0].y = d[first].y;
		bezCurve[3] = {};
		bezCurve[3].x = d[last].x;
		bezCurve[3].y = d[last].y;
		bezCurve[2] = VAdd(bezCurve[3], VScale(rightTangent, dist));
		bezCurve[1] = VAdd(bezCurve[0], VScale(leftTangent, dist));


		bezierData[3 * segcount + 1] = {};
		bezierData[3 * segcount + 1].x = bezCurve[1].x;
		bezierData[3 * segcount + 1].y = bezCurve[1].y;
		bezierData[3 * segcount + 2] = {};
		bezierData[3 * segcount + 2].x = bezCurve[2].x;
		bezierData[3 * segcount + 2].y = bezCurve[2].y;
		bezierData[3 * segcount + 3] = {};
		bezierData[3 * segcount + 3].x = bezCurve[3].x;
		bezierData[3 * segcount + 3].y = bezCurve[3].y;
		segcount++;

		return;
    }

    /*  Parameterize points, and attempt to fit curve */
    u = ChordLengthParameterize(d, first, last);
    bezCurve = GenerateBezier(d, first, last, u, leftTangent, rightTangent);


    /*  Find max deviation of points to fitted curve */
    maxRet = ComputeMaxError(d, first, last, bezCurve, u, splitPoint);
	maxError = maxRet[0];
	splitPoint = maxRet[1];

	if (maxError < error)
	{
		bezierData[3 * segcount + 1] = {};
		bezierData[3 * segcount + 1].x = bezCurve[1].x;
		bezierData[3 * segcount + 1].y = bezCurve[1].y;
		bezierData[3 * segcount + 2] = {};
		bezierData[3 * segcount + 2].x = bezCurve[2].x;
		bezierData[3 * segcount + 2].y = bezCurve[2].y;
		bezierData[3 * segcount + 3] = {};
		bezierData[3 * segcount + 3].x = bezCurve[3].x;
		bezierData[3 * segcount + 3].y = bezCurve[3].y;
		segcount++;

		return;
    }

    /*  If error not too large, try some reparameterization  */
    /*  and iteration */
    if (maxError < iterationError)
	{
		for (i = 0; i < maxIterations; i++)
		{
	    	uPrime = Reparameterize(d, first, last, u, bezCurve);
	    	bezCurve = GenerateBezier(d, first, last, uPrime, leftTangent, rightTangent);
	    	maxRet = ComputeMaxError(d, first, last, bezCurve, uPrime, splitPoint);
			maxError = maxRet[0];
			splitPoint = maxRet[1];

	    	if (maxError < error)
			{
				bezierData[3 * segcount + 1] = {};
				bezierData[3 * segcount + 1].x = bezCurve[1].x;
				bezierData[3 * segcount + 1].y = bezCurve[1].y;
				bezierData[3 * segcount + 2] = {};
				bezierData[3 * segcount + 2].x = bezCurve[2].x;
				bezierData[3 * segcount + 2].y = bezCurve[2].y;
				bezierData[3 * segcount + 3] = {};
				bezierData[3 * segcount + 3].x = bezCurve[3].x;
				bezierData[3 * segcount + 3].y = bezCurve[3].y;
				segcount++;

				return;
			}

			u = uPrime;
		}
	}

	var splitarr = [];
	var i;
	var c;
	var dist;
	var mdist;
	var best;
	var dx;
	var dy;

	for (i = first; i < last; i ++)
	{
		c = 0;
		dx = d[i].x - d[i + 1].x;
		dy = d[i].y - d[i + 1].y;

		if (dx < 0.0)
		{
			c |= 1;
		}
		else if (dx > 0.0)
		{
			c |= 2;
		}

		if (dy < 0.0)
		{
			c |= 4;
		}
		else if (dy > 0.0)
		{
			c |= 8;
		}

		splitarr[i - first] = c;
	}

	/* zoek naar omslagpunten */
	for (i = 0; i < nPts - 1; i++)
	{
		splitarr[i] ^= splitarr[i + 1];
	}

	best = splitPoint;
	mdist = 0xffffff;

	/* eventueel nog optimaliseren naar meerdere omslagen na elkaar ?? */
	for (i = 1; i < nPts - 3; i++)
	{
		if (splitarr[i])
		{
			dist = (i + first + 1) - splitPoint;

			if (dist < 0) dist = -dist;

			if (dist < mdist)
			{
				best = i + first + 1;
				mdist = dist;
			}
		}
	}

	splitPoint = best;

    var tangents = ComputeCenterTangent_oud(d, splitPoint);
	tHatLeft = {};
	tHatLeft.x = tangents[0].x;
	tHatLeft.y = tangents[0].y;
	tHatRight = {};
	tHatRight.x = tangents[1].x;
	tHatRight.y = tangents[1].y;

    FitCubic(d, first, splitPoint, leftTangent, tHatLeft, error);
    FitCubic(d, splitPoint, last, tHatRight, rightTangent, error);

	return;
}

/*
 *  GenerateBezier :
 *  Use least-squares method to find Bezier control points for region.
 */
function GenerateBezier(d, first, last, uPrime, tHat1, tHat2)
{
    var i;
    var A = [];					/* Precomputed rhs for eqn	*/
    var nPts;					/* Number of pts in sub-curve */
    var	C = [];					/* Matrix C		*/
    var	X = [];					/* Matrix X			*/
    var	det_C0_C1;				/* Determinants of matrices	*/
	var det_C0_X;
	var det_X_C1;
    var alpha_l;				/* Alpha values, left and right	*/
	var alpha_r;
    var tmp;					/* Utility variable		*/
    var	bezCurve = [];			/* RETURN bezier curve ctl pts	*/

    nPts = last - first + 1;

    /* Compute the A's	*/
    for (i = 0; i < nPts; i++)
	{
		var	v1;
		var v2;
		A[i] = [];

		v1 = tHat1;
		v2 = tHat2;
		v1 = VScale(v1, B1(uPrime[i]));
		v2 = VScale(v2, B2(uPrime[i]));
		A[i][0] = v1;
		A[i][1] = v2;
    }

    /* Create the C and X matrices	*/
	C[0] = [];
	C[1] = [];
    C[0][0] = 0.0;
	C[0][1] = 0.0;
	C[1][0] = 0.0;
	C[1][1] = 0.0;
    X[0]    = 0.0;
	X[1]    = 0.0;

    for (i = 0; i < nPts; i++)
	{
        C[0][0] += VDot(A[i][0], A[i][0]);
		C[0][1] += VDot(A[i][0], A[i][1]);
		C[1][0] = C[0][1];
		C[1][1] += VDot(A[i][1], A[i][1]);

		var tmp1 = VScale(d[last], B3(uPrime[i]));
		var tmp2 = VScale(d[last], B2(uPrime[i]));
		var tmp3 = VScale(d[first], B1(uPrime[i]));
		var tmp4 = VScale(d[first], B0(uPrime[i]));
		var tmp5 = VAdd(tmp2, tmp1);
		var tmp6 = VAdd(tmp3, tmp5);
		var tmp7 = VAdd(tmp4, tmp6);

		tmp = VSub(d[first + i], tmp7);

		X[0] += VDot(A[i][0], tmp);
		X[1] += VDot(A[i][1], tmp);
    }

    /* Compute the determinants of C and X	*/
    det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1];
    det_C0_X  = C[0][0] * X[1]    - C[0][1] * X[0];
    det_X_C1  = X[0]    * C[1][1] - X[1]    * C[0][1];

    /* Finally, derive alpha values	*/
    if (det_C0_C1 == 0.0)
	{
		det_C0_C1 = (C[0][0] * C[1][1]) * 10e-12;
    }

	alpha_l = det_X_C1 / det_C0_C1;
	alpha_r = det_C0_X / det_C0_C1;

    /*  If alpha negative, use the Wu/Barsky heuristic (see text) */
    if (alpha_l < 0.0 || alpha_r < 0.0)
	{
		var dist = VDist(d[last], d[first]) / 3.0;

		bezCurve[0] = {};
		bezCurve[0].x = d[first].x;
		bezCurve[0].y = d[first].y;
		bezCurve[3] = {};
		bezCurve[3].x = d[last].x;
		bezCurve[3].y = d[last].y;
		bezCurve[2] = VAdd(bezCurve[3], VScale(tHat2, dist));
		bezCurve[1] = VAdd(bezCurve[0], VScale(tHat1, dist));

		return bezCurve;
    }

    /*  First and last control points of the Bezier curve are */
    /*  positioned exactly at the first and last data points */
    /*  Control points 1 and 2 are positioned an alpha distance out */
    /*  on the tangent vectors, left and right, respectively */
	bezCurve[0] = {};
	bezCurve[0].x = d[first].x;
	bezCurve[0].y = d[first].y;
	bezCurve[3] = {};
	bezCurve[3].x = d[last].x;
	bezCurve[3].y = d[last].y;
    bezCurve[2] = VAdd(bezCurve[3], VScale(tHat2, alpha_r));
	bezCurve[1] = VAdd(bezCurve[0], VScale(tHat1, alpha_l));

    return bezCurve;
}


/*
 *  Reparameterize:
 *	Given set of points and their parameterization, try to find
 *   a better parameterization.
 */
function Reparameterize(d, first, last, u, bezCurve)
{
    var i;
    var	uPrime = [];		/*  New parameter values	*/

    for (i = first; i <= last; i++)
	{
		uPrime[i-first] = NewtonRaphsonRootFind(bezCurve, d[i], u[i - first]);
    }

    return uPrime;
}


/*
 *  NewtonRaphsonRootFind :
 *	Use Newton-Raphson iteration to find better root.
 */
function NewtonRaphsonRootFind(Q, P, u)
{
    var numerator;
	var denominator;
    var Q1 = []; // Q'
	var Q2 = [];	// Q''
    var	Q_u;
	var Q1_u;
	var Q2_u; /*u evaluated at Q, Q', & Q''	*/
    var	uPrime;		/*  Improved u			*/
    var i;

    /* Compute Q(u)	*/
    Q_u = Bezier(3, Q, u);

    /* Generate control vertices for Q'	*/
    for (i = 0; i <= 2; i++)
	{
		Q1[i] = {};
		Q1[i].x = (Q[i+1].x - Q[i].x) * 3.0;
		Q1[i].y = (Q[i+1].y - Q[i].y) * 3.0;
    }

    /* Generate control vertices for Q'' */
    for (i = 0; i <= 1; i++)
	{
		Q2[i] = {};
		Q2[i].x = (Q1[i+1].x - Q1[i].x) * 2.0;
		Q2[i].y = (Q1[i+1].y - Q1[i].y) * 2.0;
    }

    /* Compute Q'(u) and Q''(u)	*/
    Q1_u = Bezier(2, Q1, u);
    Q2_u = Bezier(1, Q2, u);

    /* Compute f(u)/f'(u) */
    numerator = (Q_u.x - P.x) * (Q1_u.x) + (Q_u.y - P.y) * (Q1_u.y);
    denominator = (Q1_u.x) * (Q1_u.x) + (Q1_u.y) * (Q1_u.y) + (Q_u.x - P.x) * (Q2_u.x) + (Q_u.y - P.y) * (Q2_u.y);

    /* u = u - f(u)/f'(u) */
    uPrime = u - (numerator / denominator);

    return uPrime;
}


/*
 *  Bezier :
 *  	Evaluate a Bezier curve at a particular parameter value
 */
function Bezier(degree, V, t)
{
    var i;
	var j;
    var Q;	        	/* Point on curve at parameter t	*/
    var Vtemp = [];		/* Local copy of control points		*/

    for (i = 0; i <= degree; i++)
	{
		Vtemp[i] = {};
		Vtemp[i].x = V[i].x;
		Vtemp[i].y = V[i].y;
    }

    /* Triangle computation	*/
    for (i = 1; i <= degree; i++)
	{
		for (j = 0; j <= degree-i; j++)
		{
	    	Vtemp[j].x = (1.0 - t) * Vtemp[j].x + t * Vtemp[j + 1].x;
	    	Vtemp[j].y = (1.0 - t) * Vtemp[j].y + t * Vtemp[j + 1].y;
		}
    }

    Q = Vtemp[0];

    return Q;
}

/*
 *  B0, B1, B2, B3 :
 *	Bezier multipliers
 */
function B0(u)
{
    var tmp = 1.0 - u;
    return (tmp * tmp * tmp);
}


function B1(u)
{
    var tmp = 1.0 - u;
    return (3 * u * (tmp * tmp));
}

function B2(u)
{
    var tmp = 1.0 - u;
    return (3 * u * u * tmp);
}

function B3(u)
{
    return (u * u * u);
}

/*
 * ComputeLeftTangent, ComputeRightTangent, ComputeCenterTangent :
 *Approximate unit tangents at endpoints and "center" of digitized curve
 */
function ComputeLeftTangent(d, end)
{
    var	tHat1;

    tHat1 = VSub(d[end + 1], d[end]);
    tHat1 = VNorm(tHat1);

    return tHat1;
}

function ComputeRightTangent(d, end)
{
    var tHat2;

    tHat2 = VSub(d[end - 1], d[end]);
    tHat2 = VNorm(tHat2);

    return tHat2;
}


function ComputeCenterTangent_oud(d, center)
{
    var	VL;
	var VR;
	var tHatCenter = {};
	var tHatR = {};
	var tHatL = {};

    VL = VSub(d[center - 1], d[center]);
    VR = VSub(d[center], d[center + 1]);
	VL = VNorm(VL);
	VR = VNorm(VR);

	if (VDot(VL, VR) < -0.7)
	{
		return [VL, VR];
	}

    tHatCenter.x = VL.x + VR.x;
    tHatCenter.y = VL.y + VR.y;

	tHatCenter = VNorm(tHatCenter);
	tHatL = {};
	tHatL.x = tHatCenter.x;
	tHatL.y = tHatCenter.y;
	tHatR = {};
	tHatR.x = -tHatCenter.x;
	tHatR.y = -tHatCenter.y;

    return [tHatL, tHatR];
}

/*
 *  ChordLengthParameterize :
 *	Assign parameter values to digitized points
 *	using relative distances between points.
 */
function ChordLengthParameterize(d, first, last)
{
    var	i;
    var u = [];			/*  Parameterization		*/

    u[0] = 0.0;

    for (i = first + 1; i <= last; i++)
	{
		u[i - first] = u[i - first - 1] + VDist(d[i], d[i - 1]);
    }

    for (i = first + 1; i <= last; i++)
	{
		u[i - first] = u[i - first] / u[last - first];
    }

    return u;
}

/*
 *  ComputeMaxError :
 *	Find the maximum squared distance of digitized points
 *	to fitted curve.
*/
function ComputeMaxError(d, first, last, bezCurve, u)
{
    var	i;
    var	maxDist;				/*  Maximum error		*/
    var	dist;					/*  Current error		*/
    var	P;						/*  Point on curve		*/
    var	v;						/*  Vector from point to curve	*/
	var splitPoint;

    splitPoint = (last - first + 1) / 2;

	maxDist = 0.0;

    for (i = first + 1; i < last; i++)
	{
		P = Bezier(3, bezCurve, u[i - first]);
		v = VSub(P, d[i]);
		dist = VSquaredLength(v);

		if (dist >= maxDist)
		{
	    	maxDist = dist;
	    	splitPoint = i;
		}
    }

    return [maxDist, splitPoint];
}

function VAdd(a, b)
{
    var	c = {};

    c.x = a.x + b.x;
	c.y = a.y + b.y;

	return c;
}

function VScale(v, s)
{
    var result = {};

	result.x = v.x * s;
	result.y = v.y * s;

	return result;
}

function VSub(a, b)
{
    var	c = {};

    c.x = a.x - b.x;
	c.y = a.y - b.y;

    return c;
}

function VSquaredLength(v)
{
	var lSqr = Math.pow(v.x, 2) + Math.pow(v.y, 2);

	return lSqr;
}

function VDist(v1, v2)
{
	var dist = Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));

	return dist;
}

function VNorm(v)
{
	var retV = {};
	var len = 1 / Math.sqrt(VSquaredLength(v));

	retV.x = len * v.x;
	retV.y = len * v.y;

	return retV;
}

function VDot(v1, v2)
{
	return (v1.x * v2.x + v1.y * v2.y);
}
