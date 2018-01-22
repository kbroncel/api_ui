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
}

module.exports = Service;