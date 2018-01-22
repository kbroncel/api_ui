const App = require("./api_ui");
const Service = require("./service");

const testService = new Service(
    "Advertiser List",
    './../resources/response',
    'GET',
    'JSON',
    [
        {
            alias: 'GET',
            value: 'GET'
        }
    ],
    [
        {
            alias: 'JSON',
            value: 'JSON'
        },
        {
            alias: 'XML',
            value: 'XML'
        }
    ]
)
const testApp = new App([testService]);

testApp.state.forEach(service => {
    const container = document.getElementById("servicesContainer");

    const section = document.createElement("section");
    section.appendChild(testApp.getSelectNode({ context: service, options: "possibleMethods", parameter: "selectedMethod" }));
    section.appendChild(testApp.getUrlNode(service.url));
    section.appendChild(testApp.getSelectNode({ context: service, options: "possibleFormats", parameter: "selectedFormat" }));
    const pre = testApp.getPreNode();
    section.appendChild(testApp.getButtonNode(service, pre));

    container.appendChild(testApp.getHeaderNode(service.name));
    container.appendChild(section);
    container.appendChild(pre);
})
