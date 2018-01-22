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

const container = document.getElementById("servicesContainer");
container.appendChild(testService.getServiceDom());