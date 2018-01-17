# api_ui
Simplified API user interface

<p>Application was written in vanilla JavaScript with scss. Additionaly, gulp was used for translation, minification, uglification and building for production. To build application use 'npm run build'</p>

<p> App was developed using "Live Server" plugin for Visual Studio Code so no additional server was needed to run it in development. However a simple node server (server.js file) was added to help start the app in another environment. Just run `node server.js` and head to localhost:8080.</p>

<p>App uses a state object to contain vital data. Right now it has one service to render (as described in brief), but it should handle more if necessary without any changes in code.</p>

<p>In current state, app requires an html dom node with "servicesContainer" id, to render pieces of interface in it. Can be changed at will. </p>

<p>Service object structure should be preserved, but more services, possible methods and possible formats can be added.

<pre>
service:
    {
        name: srting,
        selectedMethod: srting,
        selectedFormat: srting,
        url: srting,
        possibleMethods: array <'possibleMethod'>,
        possibleFormats: array <'possibleFormat'>
    }
possibleMethod:
    {
        alias: srting,
        value: srting
    }
possibleFormat:
    {
        alias: srting,
        value: srting
    } 
</pre>

<p>Prism.js was used to prettify response text. It isn't necessery, but definitely looks cool</p>