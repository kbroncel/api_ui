
//global app object, used to keep global namespace clean
const app = {
    //app state object, contains data used to render and inside other methods
    state: {
        services: [
            {
                name: "Advertiser List",
                selectedMethod: 'GET',
                selectedFormat: 'JSON',
                url: './../resources/response',
                possibleMethods: [
                    {
                        alias: 'GET',
                        value: 'GET'
                    }
                ],
                possibleFormats: [
                    {
                        alias: 'JSON',
                        value: 'JSON'
                    },
                    {
                        alias: 'XML',
                        value: 'XML'
                    }
                ]
            }
        ]
    },
    // promise that takes a chosen method (GET, POST, etc.) and a url address and returns a promise object
    // resolves with request response
    // rejects with request error
    sendRequest: function (method, url) {
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr)
                }
                else {
                    reject(xhr)
                }
            }
            xhr.onerror = () => {
                reject(xhr)
            }
            xhr.send();
        });
        return promise;
    },
    // takes a xhrHttp object and returns render ready string
    prettifyResponse: function (xhrHttp) {
        const Prism = require('prismjs');
        const meta = `http ${xhrHttp.status} ${xhrHttp.statusText}`
        const html = Prism.highlight(xhrHttp.responseText, Prism.languages.javascript);
        return `${meta} <br/> ${html}`;
    },
    // takes an array of alias, value pairs and returns array of option domNodes
    getOptionDomNodes: function (optionsArray) {
        return optionsArray.map(option => {
            const optionNode = document.createElement("option");
            optionNode.text = option.alias;
            optionNode.value = option.value;
            return optionNode;
        })
    },
    // takes a string and returns a h2 with that title
    getHeaderNode: function (title) {
        const headerNode = document.createElement("h2");
        headerNode.innerHTML = title;
        return headerNode;
    },
    // takes a config object 
    // {
    //     context: service object,
    //     oprtions: string - attribute identifier of options array in context object,
    //     parameter: string - attribute identifier chosen option in context object
    // } 
    // returns a select node containing options based on provided config object
    getSelectNode: function (config) {
        const selectNode = document.createElement("select");
        this.getOptionDomNodes(config.context[config.options]).forEach((option) => {
            selectNode.add(option);
        })
        selectNode.value = config.context[config.parameter];
        selectNode.addEventListener('change', (event) => {
            config.context[config.parameter] = event.target.value;
        })
        return selectNode;
    },
    // takes string and returns a span with provided text (url in that case)
    getUrlNode: function (url) {
        const urlNode = document.createElement("span");
        urlNode.innerHTML = url;
        return urlNode;
    },
    // takes a service object and a target node
    // on click sends request based on actual service object state
    // renders results inside target node
    getButtonNode: function (service, targetNode) {
        const buttonNode = document.createElement("button");
        buttonNode.innerHTML = "Send request";
        buttonNode.addEventListener("click", () => {
            app.sendRequest(service.selectedMethod, `${service.url}.${service.selectedFormat}`).then((result) => {
                targetNode.innerHTML = this.prettifyResponse(result);
            })
                .catch((error) => {
                    targetNode.innerHTML = this.prettifyResponse(error);
                })
        })
        return buttonNode;
    },
    // returns Pre tag, used as target node to render request result in it
    getPreNode: function () {
        const preNode = document.createElement("pre");
        return preNode;
    }
}

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
