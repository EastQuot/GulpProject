let s        = 'sass', // Syntax: sass or scss;

	gulp          = require('gulp'),
	gutil         = require('gulp-util' ),
	sass          = require('gulp-sass'),
	browserSync   = require('browser-sync'),
	concat        = require('gulp-concat'),
	uglify        = require('gulp-uglify'),
	cleancss      = require('gulp-clean-css'),
	rename        = require('gulp-rename'),
	del           = require('del'),
	autoprefixer  = require('gulp-autoprefixer'),
	notify        = require('gulp-notify'),
	imagemin      = require('gulp-imagemin'),
	pngquant      = require('imagemin-pngquant'),
	cache         = require('gulp-cache'), 
	rsync         = require('gulp-rsync');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('styles', function() {
	return gulp.src('app/'+s+'/**/*.'+s+'')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

gulp.task('scripts', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});


gulp.task('watch', function() {
		gulp.watch('app/'+s+'/**/*.'+s+'', gulp.parallel('styles'));
		gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
		gulp.watch('app/*.html', gulp.parallel('code'))
	});







	gulp.task('clean', async function() {
		return del.sync('dist'); // Удаляем папку dist перед сборкой
	});
	
	gulp.task('img', function() {
		return gulp.src('app/img/**/*') // Берем все изображения из app
			.pipe(cache(imagemin({ // С кешированием
			// .pipe(imagemin({ // Сжимаем изображения без кеширования
				interlaced: true,
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant()]
			}))/**/)
			.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
	});
	
	gulp.task('prebuild', async function() {
	
		var buildCss = gulp.src([ // Переносим библиотеки в продакшен
			'app/css/main.min.css',
			])
		.pipe(gulp.dest('dist/css'))
	
		var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
		.pipe(gulp.dest('dist/fonts'))
	
		var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
		.pipe(gulp.dest('dist/js'))
	
		var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
		.pipe(gulp.dest('dist'));
	
	});





	gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));
	gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', 'styles', 'scripts'));







	
		
		gulp.task('rsync', function() {
			return gulp.src('app/**')
			.pipe(rsync({
				root: 'app/',
				hostname: 'username@yousite.com',
				destination: 'yousite/public_html/',
				// include: ['*.htaccess'], // Includes files to deploy
				exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
				recursive: true,
				archive: true,
				silent: false,
				compress: true
			}))
		});