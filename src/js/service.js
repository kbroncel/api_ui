class Service {
    constructor(
        name,
        url,
        selectedMethod,
        selectedFormat,
        possibleMethods,
        possibleFormats
    ) {
        this.name = name;
        this.url = url;
        this.selectedMethod = selectedMethod;
        this.selectedFormat = selectedFormat;
        this.possibleMethods = possibleMethods;
        this.possibleFormats = possibleFormats;
    }
    setSelectedFormat(format) {
        this.selectedFormat = format;
    }
    setSelectedMethod(method) {
        this.selectedMethod = method;
    }
    // returns a select node containing options based on provided config object
    getSelectNode(values, callback) {
        const selectNode = document.createElement("select");
        this.getOptionDomNodes(values).forEach((option) => {
            selectNode.add(option);
        })
        // selectNode.value = this.selectedFormat;
        selectNode.addEventListener('change', (event) => {
            callback(event.target.value);
        })
        return selectNode;
    }
    // takes an array of alias, value pairs and returns array of option domNodes
    getOptionDomNodes(optionsArray) {
        return optionsArray.map(option => {
            const optionNode = document.createElement("option");
            optionNode.text = option.alias;
            optionNode.value = option.value;
            return optionNode;
        })
    }
    getMethodNode() {
        return this.getSelectNode(this.possibleMethods, this.setSelectedMethod.bind(this));
    }
    getFormatNode() {
        return this.getSelectNode(this.possibleFormats, this.setSelectedFormat.bind(this));
    }
    // returns a span with provided text (url in that case)
    getUrlNode() {
        const urlNode = document.createElement("span");
        urlNode.innerHTML = this.url;
        return urlNode;
    }
    // takes a xhrHttp object and returns render ready string
    prettifyResponse(xhrHttp) {
        const Prism = require('prismjs');
        const meta = `http ${xhrHttp.status} ${xhrHttp.statusText}`
        const html = Prism.highlight(xhrHttp.responseText, Prism.languages.javascript);
        return `${meta} <br/> ${html}`;
    }
    // promise that takes a chosen method (GET, POST, etc.) and a url address and returns a promise object
    // resolves with request response
    // rejects with request error
    sendRequest(method, url) {
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
    }
    // takes a target node
    // on click sends request based on actual service object state
    // renders results inside target node

    getButtonNode(targetNode) {
        const buttonNode = document.createElement("button");
        buttonNode.innerHTML = "Send request";
        buttonNode.addEventListener("click", () => {
            this.sendRequest(this.selectedMethod, `${this.url}.${this.selectedFormat}`).then((result) => {
                targetNode.innerHTML = this.prettifyResponse(result);
            })
                .catch((error) => {
                    targetNode.innerHTML = this.prettifyResponse(error);
                })
        })
        return buttonNode;
    }
    // returns a h2 with that title
    getHeaderNode() {
        const headerNode = document.createElement("h2");
        headerNode.innerHTML = this.name;
        return headerNode;
    }
    // returns Pre tag, used as target node to render request result in it
    getPreNode() {
        const preNode = document.createElement("pre");
        return preNode;
    }
    getServiceDom() {
        const target = document.createElement("div");
        const section = document.createElement("section");
        const pre = this.getPreNode();

        section.appendChild(this.getMethodNode());
        section.appendChild(this.getUrlNode());
        section.appendChild(this.getFormatNode());
        section.appendChild(this.getButtonNode(pre));

        target.appendChild(this.getHeaderNode());
        target.appendChild(section);
        target.appendChild(pre);
        return target;
    }
}

module.exports = Service;