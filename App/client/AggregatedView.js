var dagD3Draw = require('dagre-d3'); // Library for drawing graph on canvas

// Assigns color according to the pass fail ratio 
function colorPassFail(avgValue) {

    let passColor = {r: 95, g: 255, b: 95};
    let failColor = {r: 240, g: 128, b: 128};

    return {
        r: Math.round(passColor.r * avgValue + failColor.r * (1 - avgValue)),
        g: Math.round(passColor.g * avgValue + failColor.g * (1 - avgValue)),
        b: Math.round(passColor.b * avgValue + failColor.b * (1 - avgValue))
    };
}

class AggregatedView {

    constructor(Graphs){
        this.graphs = Graphs;
    }

    separateAggregatedGraphData(listTracibleEventIDs) {

        let tEiffelSourceChangeCreatedEvent = 0;
        let tEiffelSourceChangeSubmittedEvent = 0;
        let tEiffelArtifactCreatedEvent = 0;
        let tEiffelArtifactPublishedEvent = 0;
        let tEiffelTestSuiteStartedEvent = 0;
        let tEiffelTestSuiteFinishedEvent = 0;
        let fEiffelTestSuiteFinishedEvent = 0;
        let tEiffelConfidenceLevelModifiedEvent = 0;
        let fEiffelConfidenceLevelModifiedEvent = 0;

        let id = "";

        for (let i = 0; i < listTracibleEventIDs.length; i++) {

            for (let j = 0; j < listTracibleEventIDs[i].length; j++) {

                let queryData = this.graphs.find({'meta.id': listTracibleEventIDs[i][j]}).fetch();

                id = queryData[0].meta.type;

                if (id === "EiffelSourceChangeCreatedEvent") { // event type count
                    tEiffelSourceChangeCreatedEvent++;
                }
                else if (id === "EiffelSourceChangeSubmittedEvent") { // event type count
                    tEiffelSourceChangeSubmittedEvent++;
                }
                else if (id === "EiffelArtifactCreatedEvent") { // event type count
                    tEiffelArtifactCreatedEvent++;
                }
                else if (id === "EiffelArtifactPublishedEvent") { // event type count
                    tEiffelArtifactPublishedEvent++;
                }
                else if (id === "EiffelTestSuiteStartedEvent") { // event type count
                    tEiffelTestSuiteStartedEvent++;
                }
                else if (id === "EiffelTestSuiteFinishedEvent") { // event type count
                    tEiffelTestSuiteFinishedEvent++;
                    if (queryData[0].data.outcome.verdict == "PASSED") {
                        fEiffelTestSuiteFinishedEvent++;
                    }
                    else {
                    }
                }
                else if (id === "EiffelConfidenceLevelModifiedEvent") { // event type count
                    tEiffelConfidenceLevelModifiedEvent++;
                    if (queryData[0].data.name == "stable") {
                        fEiffelConfidenceLevelModifiedEvent++;
                    }
                    else {
                    }
                }
            }
        }

        let json = {};
        // Aggregated results
        json.eiffelSourceChangeCreatedEvent = '  Changes Created (' + tEiffelSourceChangeCreatedEvent + '/' + tEiffelSourceChangeCreatedEvent + ')     ';
        json.eiffelSourceChangeSubmittedEvent = 'Changes Submitted (' + tEiffelSourceChangeSubmittedEvent + '/' + tEiffelSourceChangeSubmittedEvent + ')';
        json.eiffelArtifactCreatedEvent = 'Artifacts Created (' + tEiffelArtifactCreatedEvent + '/' + tEiffelArtifactCreatedEvent + ')';
        json.eiffelArtifactPublishedEvent = 'Artifacts Published (' + tEiffelArtifactPublishedEvent + '/' + tEiffelArtifactPublishedEvent + ')';
        json.eiffelTestSuiteStartedEvent = 'Test Suits Started (' + tEiffelTestSuiteFinishedEvent + '/' + tEiffelTestSuiteFinishedEvent + ')';
        json.eiffelTestSuiteFinishedEvent = 'Test Suits Finished \npassed: ' + fEiffelTestSuiteFinishedEvent + '/' + tEiffelTestSuiteFinishedEvent;
        json.eiffelConfidenceLevelModifiedEvent = 'Confidence Level \npassed: ' + fEiffelConfidenceLevelModifiedEvent + '/' + tEiffelConfidenceLevelModifiedEvent;
        json.testSuite_Style = colorPassFail(fEiffelTestSuiteFinishedEvent / tEiffelTestSuiteFinishedEvent);
        json.confidenceStyle = colorPassFail(fEiffelConfidenceLevelModifiedEvent / tEiffelConfidenceLevelModifiedEvent);

        return json;
    };

    drawGraphs(myGraph, container, label) {

        let dagD3Draw = require('dagre-d3');

        $(container).empty(); // Empty the conatainer at start

        // Renderer is used to draw and show final graph to user
        let renderer = new dagD3Draw.render();

        // Append the title
        $(container).append('<h3>' + label + '</h3>');

        for (let i = 0; i < myGraph.length; i++) {

            // Append graph to the div
            // Height of each graph can also be set from here
            $(container).append('<svg id="graph' + i + '" width="100%" height="45%"> <g> </svg>');

            let svg = d3.select('#graph' + i);
            let inner = svg.select("g");

            // renderer.run(gr, inner); if graph is string use graphlib.parse(g) and then it to this function
            myGraph[i].graph().rankdir = "LR"; // Horizontal or vertical drawing property of graph
            myGraph[i].graph().ranksep = 30; // Horizontal size of the diplayed graph
            myGraph[i].graph().nodesep = 30; // Nodes' inter distances vertical

            // Draws the final aggregated graph
            renderer(inner, myGraph[i]);

        }

        // Optional - resize the SVG element based on the contents
        let svg = document.querySelector(container);
        //let bbox = svg.getBBox();
        svg.style.width = 100 + "%";
        svg.style.height = 750 + "px";

    };

// make graph format for separated aggregated view 
    makeAggGraph(json) {

        let g = [];
        let states = ["EiffelSourceChangeCreatedEvent", "EiffelSourceChangeSubmittedEvent", "EiffelArtifactCreatedEvent", "EiffelArtifactPublishedEvent",
            "EiffelTestSuiteStartedEvent", "EiffelTestSuiteFinishedEvent", "EiffelConfidenceLevelModifiedEvent"];

        g[0] = new dagD3Draw.graphlib.Graph().setGraph({});

        states.forEach(function (state) {
            if (state == "EiffelSourceChangeCreatedEvent") {
                g[0].setNode(state, {label: json.eiffelSourceChangeCreatedEvent});
            }
            else if (state == "EiffelSourceChangeSubmittedEvent") {
                g[0].setNode(state, {label: json.eiffelSourceChangeSubmittedEvent});
            }
            else if (state == "EiffelSourceChangeCreatedEvent") {
                g[0].setNode(state, {label: json.eiffelSourceChangeCreatedEvent, style: 'fill: #66FF66'});
            }
            else if (state == "EiffelArtifactCreatedEvent") {
                g[0].setNode(state, {label: json.eiffelArtifactCreatedEvent, style: ''});
            }
            else if (state == "EiffelArtifactPublishedEvent") {
                g[0].setNode(state, {
                    label: json.eiffelArtifactPublishedEvent,
                    shape: 'circle',
                    style: 'fill: #9B50D2'
                });
            }
            else if (state == "EiffelTestSuiteStartedEvent") {
                g[0].setNode(state, {label: json.eiffelTestSuiteStartedEvent});
            }
            else if (state == "EiffelTestSuiteFinishedEvent") {
                g[0].setNode(state, {
                    label: json.eiffelTestSuiteFinishedEvent,
                    style: 'fill: rgb(' + json.testSuite_Style.r + ',' + json.testSuite_Style.g + ',' + json.testSuite_Style.b + ');'
                });
            }
            else if (state == "EiffelConfidenceLevelModifiedEvent") {
                g[0].setNode(state, {
                    label: json.eiffelConfidenceLevelModifiedEvent,
                    shape: 'circle',
                    style: 'fill: rgb(' + json.confidenceStyle.r + ',' + json.confidenceStyle.g + ',' + json.confidenceStyle.b + ');'
                });
            }
        });
        for (let i = 0; i < states.length - 1; i++) {
            g[0].setEdge(states[i], states[i + 1], {});
        }
        return g;
    }
}

export default AggregatedView;