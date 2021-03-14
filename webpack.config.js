var Encore = require('@symfony/webpack-encore');

Encore
    // the project directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // the public path used by the web server to access the previous directory
    .setPublicPath('/build')


    .cleanupOutputBeforeBuild()

    .enableBuildNotifications()

    .enableSourceMaps(!Encore.isProduction())


    .enableReactPreset()
    .enableTypeScriptLoader()
    //.enableForkedTypeScriptTypesChecking()
    .enableSassLoader()

    // uncomment to create hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // Add asset entries
    .addEntry('room', './assets/js/pages/room.ts')
    .addEntry('site_frame', './assets/js/pages/site_frame.ts')
    .addEntry('base', './assets/js/pages/base.ts')

    .addEntry('whiteboard_worker', './assets/js/tutorial/WhiteBoardWorker.ts')

    .addEntry('curve_element', './assets/js/tutorial/Elements/FreeCurveElement.ts')
    .addEntry('curve_view', './assets/js/tutorial/Elements/FreeCurveView.ts')
    .addEntry('text_element', './assets/js/tutorial/Elements/WhiteBoardTextElement.ts')
    .addEntry('text_view', './assets/js/tutorial/Elements/WhiteBoardTextView.ts')
    .addEntry('upload_element', './assets/js/tutorial/Elements/UploadElement.ts')
    .addEntry('upload_view', './assets/js/tutorial/Elements/UploadView.ts')
    .addEntry('highlight_element', './assets/js/tutorial/Elements/HighlightElement.ts')
    .addEntry('highlight_view', './assets/js/tutorial/Elements/HighlightView.ts')

    .addEntry('what-input.min', './assets/js/what-input.min.js')
    .addEntry('foundation', './assets/js/foundation.js')
    .addEntry('normalize', './assets/js/normalize.js')
;

module.exports = Encore.getWebpackConfig();
