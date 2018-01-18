module.exports = {
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
}