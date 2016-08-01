
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var saveLicense = require('uglify-save-license');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var iconfont = require('gulp-iconfont');
var gutil = require('gulp-util');
var Q = require('q');
var runTimestamp = Math.round(Date.now()/1000);
/*var redis = require("redis"),
    redisClient = redis.createClient();*/

// == PATH STRINGS ========

var paths = {
    scripts: 'client/**/*.js',
    styles: ['./client/**/*.css', './client/**/*.scss'],
    images: './client/assets/images/**/*',
    fonts: './client/assets/**/*.{otf,eot,svg,ttf,woff,woff2}',
    translation: './client/assets/**/*.json',
    index: './client/index.html',
    partials: ['client/**/*.html', '!client/index.html'],
    distDev: './dist.dev',
    distProd: './dist.prod',
    distScriptsProd: './dist.prod/scripts',
    scriptsDevServer: 'server/**/*.js'
};

// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.js', 'angular.js', 'angular-route.js',
                        'angular-resource.js', 'bootstrap.js',  'ui-bootstrap-tpls.js',
                        'angular-ui-router.js', 'ng-file-upload-shim.js', 'ng-file-upload.js',
                        'jasny-bootstrap.js', 'scrollglue.js', 'underscore.js', 'angular-growl.js',
                        'bootstrap-slider.js', 'moment.js', 'angular-sanitize.js', 'angular-translate.js',
                        'angular-translate-handler-log.js', 'angular-translate-loader-static-files.js',
                        'angular-translate-loader-partial.js', 'angular-cookies.js', 'angular-translate-storage-cookie.js',
                        'angular-translate-storage-local.js']);
};


pipes.orderedAppScripts = function() {
    return plugins.order(['config.js' , 'application.js',
                        'modules/home/home.client.module.js',
                        'modules/app/factories/app.factory.translate-growl.js',
                        'modules/app/factories/app.factory.dateselector.js',
                        'modules/app/factories/app.service.modal.js',
                        'modules/home/config/home.client.routes.js',
                        'modules/home/controllers/home.client.controller.js',
                        'modules/home/services/home.client.services.js',
                        'modules/users/users.client.module.js',
                        'modules/users/config/users.client.routes.js',
                        'modules/users/directives/users.client.locationSearch.js',
                        'modules/users/directives/user.fileupload.js',
                        'modules/users/directives/users.client.checkbox.js',
                        'modules/users/directives/users.client.nl2br.js',
                        'modules/users/filters/advertiser.client.filters.js',
                        'modules/users/filters/influencer.client.filters.js',
                        'modules/users/controllers/influencer.client.controller.js',
                        'modules/users/controllers/campaign.client.controller.js',
                        'modules/users/controllers/apply.campaign.client.controller.js',
                        'modules/users/controllers/paypal.email.client.controller.js',
                        'modules/users/controllers/invite.client.controller.js',
                        'modules/users/controllers/afterHire.client.controller.js',
                        'modules/users/controllers/hire.client.controller.js',
                        'modules/users/controllers/endContract.client.controller.js',
                        'modules/users/controllers/request.client.controller.js',
                        'modules/users/controllers/advertiser.client.controller.js',
                        'modules/users/services/authentication.client.service.js',
                        'modules/users/services/influencer.client.service.js',
                        'modules/users/services/advertiser.client.service.js',
                        'modules/users/services/category.client.service.js',
                        'modules/users/services/instagramMedia.client.service.js',
                        'modules/admin/admin.client.module.js',
                        'modules/admin/config/admin.client.routes.js',
                        'modules/admin/controllers/admin.client.controller.js',
                        'modules/admin/services/admin.client.service.js',
                        'assets/js/owl.carousel.min.js',
                        'assets/js/socket.io-1.2.0.js']);
};

pipes.orderedStyle = function (){
    return plugins.order([
                        'assets/styles/normalize.css',
                        'assets/styles/owl.carousel.css',
                        'assets/styles/owl.theme.css',
                        'assets/styles/style_landingpage.css',
                        'assets/styles/responsive.css',
                        'assets/styles/advertiser_login.css',
                        'assets/styles/style.css',
                        'assets/styles/growl.css',
                        'assets/styles/influencer.css',
                        'assets/styles/modules/chosen.css']);
}

pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScriptsDev = function() {
    return pipes.validatedAppScripts()
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
    var scriptedPartials = pipes.scriptedPartials();
    var validatedAppScripts = pipes.validatedAppScripts();

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        //.pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat('app.min.js'))
            .pipe(plugins.uglify().on('error', gutil.log))
        //.pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsDev = function() {
    return gulp.src(bowerFiles())
        .pipe(gulp.dest('dist.dev/bower_components'));
};

pipes.builtVendorScriptsProd = function() {

    return gulp.src(bowerFiles('**/*.js'))
        .pipe(pipes.orderedVendorScripts())
        //.pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.min.js',{newLine:'\n;'}))
        .pipe(plugins.uglify({output: {
    comments: saveLicense
  }}))
        //.pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.validatedDevServerScripts = function() {
    return gulp.src(paths.scriptsDevServer)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedPartials = function() {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartialsDev = function() {
    return pipes.validatedPartials()
        .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
        .pipe(plugins.htmlhint.reporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.ngHtml2js({
            moduleName: "expaus"
        }));
};

pipes.builtStylesDev = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sass({errLogToConsole: true}))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesProd = function() {
    //console.log(paths.styles);
    return gulp.src(paths.styles)
        //.pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        
        .pipe(plugins.concat('style.css'))
        .pipe(plugins.minifyCss())
        //.pipe(plugins.sourcemaps.write())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.distProd +'/assets/styles'));
};

pipes.processedImagesDev = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distDev + '/assets/images/'));
};


pipes.processedImagesProd = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distProd + '/assets/images/'));
};

pipes.processedFontDev = function() {
      return gulp.src(paths.fonts)
      .pipe(gulp.dest(paths.distDev + '/assets/'));;
}

pipes.processedFontProd = function() {
      return gulp.src(paths.fonts)
      .pipe(gulp.dest(paths.distProd + '/assets/'));;
}

pipes.processedTranslationDev = function() {
      return gulp.src(paths.translation)
      .pipe(gulp.dest(paths.distDev + '/assets/'));;
}

pipes.processedTranslationProd = function() {
      return gulp.src(paths.translation)
      .pipe(gulp.dest(paths.distProd + '/assets/'));;
}

/*pipes.processedFontProd = function() {
      return gulp.src(['assets/fonts/*.svg'])
        .pipe(iconfont({
          fontName: 'myfont', // required
          appendUnicode: true, // recommended option
          formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available
          timestamp: runTimestamp, // recommended to get consistent builds when watching files
        }))
          .on('glyphs', function(glyphs, options) {
            // CSS templating, e.g.
            console.log(glyphs, options);
          })
        .pipe(gulp.dest(paths.distDev+'/fonts/'));
}
*/

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtIndexDev = function() {

    var orderedVendorScripts = pipes.builtVendorScriptsDev()
        .pipe(pipes.orderedVendorScripts());

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var appStyles = pipes.builtStylesDev()
                    .pipe(pipes.orderedStyle());

    var appFonts = pipes.processedFontDev();
    var appTranslation = pipes.processedTranslationDev();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
        .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(orderedAppScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(plugins.inject(appFonts, {relative: true}))
        .pipe(plugins.inject(appTranslation, {relative: true}))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtIndexProd = function() {

    var vendorScripts = pipes.builtVendorScriptsProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd().pipe(pipes.orderedStyle());
    var appFonts = pipes.processedFontProd();
    var appTranslation = pipes.processedTranslationProd();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(plugins.inject(appFonts, {relative: true}))
        .pipe(plugins.inject(appTranslation, {relative: true}))
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
    return es.merge(pipes.builtIndexDev(), pipes.builtPartialsDev(), pipes.processedImagesDev());
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.processedImagesProd());
};

// == TASKS ========

// removes all compiled dev files
gulp.task('clean-dev', function() {
    var deferred = Q.defer();
    del(paths.distDev, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    del(paths.distProd, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev environment
gulp.task('build-partials-dev', pipes.builtPartialsDev);

// converts partials to javascript using html2js
gulp.task('convert-partials-to-js', pipes.scriptedPartials);

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// moves app scripts into the dev environment
gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev environment
gulp.task('build-styles-dev', pipes.builtStylesDev);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles-prod', pipes.builtStylesProd);

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

// validates and injects sources into index.html and moves it to the dev environment
gulp.task('build-index-dev', pipes.builtIndexDev);

// validates and injects sources into index.html, minifies and moves it to the dev environment
gulp.task('build-index-prod', pipes.builtIndexProd);

// builds a complete dev environment
gulp.task('build-app-dev', pipes.builtAppDev);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

// clean, build, and watch live changes to the dev environment
gulp.task('watch-dev', ['clean-build-app-dev', 'validate-devserver-scripts'], function() {

    //redisClient.flushall();
    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['server/', 'server.js'], env: {NODE_ENV : 'develop'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
           /* redisClient.flushall(function (err,res) {
                console.log("Flushed redis");

            });*/
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({ start: true });

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexDev()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsDev()
            .pipe(plugins.livereload());
    });

    // watch html partials
    gulp.watch(paths.partials, function() {
        return pipes.builtPartialsDev()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesDev()
            .pipe(plugins.livereload());
    });

    // watch traslation files
    gulp.watch(paths.translation, function() {
        return pipes.processedTranslationDev()
            .pipe(plugins.livereload());
    });

});

// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build-app-prod', 'validate-devserver-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['server/'], env: {NODE_ENV : 'production'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({start: true});

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexProd()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch hhtml partials
    gulp.watch(paths.partials, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesProd()
            .pipe(plugins.livereload());
    });

});

// default task builds for prod
gulp.task('default', ['clean-build-app-prod']);