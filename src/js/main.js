
//global app object, used to keep global namespace clean
const app = {
    //app state object, contains data used to render and inside other methods
    state: {
        method: 'GET',
        url: './../resources/response',
        format: 'JSON',
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
    },
    // sets application inner state attributes, takes attribute name and value, returns app state
    setState: function (name, value) {
        this.state[name] = value;
        return this.state;
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
            let optionNode = document.createElement("option");
            optionNode.text = option.alias;
            optionNode.value = option.value;
            return optionNode;
        })
    }
}

const requestMehtodSelect = document.getElementById('request_method');
app.getOptionDomNodes(app.state.possibleMethods).forEach((option) => {
    requestMehtodSelect.add(option)
})
requestMehtodSelect.value = app.state.method;
requestMehtodSelect.addEventListener('change', (event) => {
    app.setState("method", event.target.value);
})

const requestFormatSelect = document.getElementById('request_format');
app.getOptionDomNodes(app.state.possibleFormats).forEach((option) => {
    requestFormatSelect.add(option)
})
requestFormatSelect.value = app.state.format;
requestFormatSelect.addEventListener('change', (event) => {
    app.setState("format", event.target.value);
})

const requestUrlInput = document.getElementById('request_url');
requestUrlInput.value = app.state.url
requestUrlInput.addEventListener('blur', (event) => {
    app.setState("url", event.target.value);
})

const sendRequestBtn = document.getElementById('request_send');
sendRequestBtn.addEventListener('click', () => {
    app.sendRequest(app.state.method, `${app.state.url}.${app.state.format}`).then((result) => {
        document.getElementById('response').innerHTML = app.prettifyResponse(result);
    })
        .catch((error) => {
            document.getElementById('response').innerHTML = app.prettifyResponse(error);
        })
})
