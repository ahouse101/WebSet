#!/usr/bin/env node

const parseArgs = require('minimist');
const Fs = require('fs');
const Path = require('path');
const Chokidar = require('chokidar');
const Pdf = require('html-pdf');
const Chalk = require('chalk');

let config = processOptions();
runWebSet(config, (err) => {
	if (err) return console.log(Chalk.red(err));
	if (config.shouldWatch) {
		let watcher = Chokidar.watch(config.watchedFiles, {
			persistent: true,
			awaitWriteFinish: {
				stabilityThreshold: 500
			}
		});
		watcher.on('ready', () => {
			console.log(Chalk.blue.bold('\nFile watcher started.'));
		});
		watcher.on('change', (path, stats) => {
			console.log(Chalk.blue('\nFile change detected.'));
			runWebSet(config, (err) => {
				if (err) return console.log(Chalk.red(err));
			});
		});
	}
});

/*=================================================================================================
This is the central WebSet function. Read HTML, create preview, and do PDF conversion.
=================================================================================================*/
function runWebSet(config, callback = (err) => {}) {
	let html = fetchHTML(config.inputPath);
	if (config.shouldPreview) {
		createPreview(html, config, (err) => {
			convertPDF(html, config, (err) => {
				callback(err);
			});
		});
	} else {
		convertPDF(html, config, (err) => {
			callback(err);
		});
	}
}

/*=================================================================================================
Process command line arguments and read in file.
=================================================================================================*/
function processOptions() {
	let args = parseArgs(process.argv.slice(2), {
		string: 'output',
		boolean: ['preview', 'watch'],
		alias: {
			o: 'output',
			p: 'preview',
			w: 'watch'
		},
		default: {
			output: null,
			preview: true,
			watch: false
		}
	});
	
	let options = {}
	options.inputPath = Path.resolve(process.cwd(), args['_'][0]);
	options.inputDir = Path.dirname(options.inputPath);
	options.inputFile = Path.basename(options.inputPath);
	options.inputBase = Path.basename(options.inputPath, Path.extname(options.inputPath));
	options.outputName = args['o'];
	if (options.outputName === null) options.outputName = options.inputBase + ".pdf";
	options.outputPath = Path.resolve(options.inputDir, options.outputName);
	options.shouldPreview = args['p'];
	options.shouldWatch = args['w'];
	options.watchedFiles = [options.inputPath];
	for (let fileIndex in args['_']) {
		if (fileIndex !== 0) {
			options.watchedFiles.push(args['_'][fileIndex]);
		}
	}
	
	return options;
}

/*=================================================================================================
Return the contents of the given HTML file.
=================================================================================================*/
function fetchHTML(inputPath) {
	console.log('Reading "' + config.inputFile + '"...');
	return Fs.readFileSync(inputPath, 'utf8');
}

/*=================================================================================================
Add elements and CSS to HTML to make it look more similar to the PDF output.
=================================================================================================*/
function createPreview(html, config, callback = (err) => {}) {
	console.log('Creating preview...');
	
	// Get relevant indices.
	let headOpenPos = html.indexOf('<head>') + 6;
	let bodyOpenPos = html.indexOf('<body>') + 6;
	let bodyClosePos = html.indexOf('</body>');
	
	// Slice the HTML string into sections.
	let startToHead = html.slice(0, headOpenPos);
	let headToBody = html.slice(headOpenPos, bodyOpenPos);
	let body = html.slice(bodyOpenPos, bodyClosePos);
	let bodyToEnd = html.slice(bodyClosePos);
	
	// Read page CSS and reconstruct the HTML with extra markup.
	Fs.readFile(Path.resolve(__dirname, 'page.css'), (err, css) => {
		if (err) throw err;
		let styleBlock = '\n<style>\n' + css + '\n</style>\n';
		let pageOpen = '<div class="webset-page">';
		let pageClose = '</div>';
		
		let output = startToHead + styleBlock + headToBody + pageOpen + body + pageClose + bodyToEnd;
		
		// Save the HTML as a file.
		let outputPath = Path.resolve(config.inputDir, config.inputBase + '_preview.html');
		Fs.writeFile(outputPath, output, 'utf8', (err) => {
			if (err) callback(err);
			console.log(Chalk.green('Preview saved to "' + outputPath + '"'));
			callback(null);
		});
	});
}

/*=================================================================================================
Converts an HTML string to PDF and saves it, given the specified configuration.
=================================================================================================*/
function convertPDF(html, config, callback = (err) => {}) {
	console.log('Starting PDF conversion...');
	let pdfOptions = {
		format: 'Letter',
		border: '0.5in',
		base: 'file:///' + config.inputDir + '/'
	};

	Pdf.create(html, pdfOptions).toFile(config.outputPath, function(err, result) {
		if (err) callback(err);
		console.log(Chalk.green('PDF saved to "' + result.filename + '"'));
		callback(null);
	});
}
