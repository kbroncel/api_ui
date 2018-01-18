const app = require("./api_ui");

app.state.services.forEach(service => {
    const container = document.getElementById("servicesContainer");

    const section = document.createElement("section");
    section.appendChild(app.getSelectNode({ context: service, options: "possibleMethods", parameter: "selectedMethod" }));
    section.appendChild(app.getUrlNode(service.url));
    section.appendChild(app.getSelectNode({ context: service, options: "possibleFormats", parameter: "selectedFormat" }));
    const pre = app.getPreNode();
    section.appendChild(app.getButtonNode(service, pre));

    container.appendChild(app.getHeaderNode(service.name));
    container.appendChild(section);
    container.appendChild(pre);
})
