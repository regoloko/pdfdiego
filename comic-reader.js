/**
 * comic-reader.js
 * Copyright(c) 2012 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 * @author : Aaron Hedges <aaron@dashron.com>
 * @todo : pull all dom out of the comic reader, have it fire events, and have the jquery plugin attach the dom to the events
 */
(function( $ ) {
	var ComicReader = function(root_element, options) {
		var _self = this,
			i = 0;
		_self.root_element = root_element;
		_self.image_urls = [];
		_self.options = options;

		if (typeof options.start == "undefined" || options.start === null) {
			options.start = 0;
		}

		_self.current_image = options.start;

		// populate the initial elements array
		_self.elements = [];

		// Find all of the images, and create an array of urls
		root_element.find('.page').each(function() {
			_self.addElement($(this));
		});

		// Remove all the metadata
		root_element.find('ol').remove();

		// Preload some images
		_self.images = new Array(_self.image_urls.length);

		// load the current image first
		this.loadImages(_self.current_image, 1);
		// load the next {preload_images} images next
		this.loadImages(_self.current_image + 1, options.preload_quantity);
		// load the previous {preload_images} images next
		this.loadImages(_self.current_image - options.preload_quantity + 1, options.preload_quantity);
	};

	ComicReader.prototype.current_image = 0;
	ComicReader.prototype.root_element = null;
	ComicReader.prototype.image_urls = null;
	ComicReader.prototype.images = null;
	ComicReader.prototype.elements = null;

	/**
	 * Add images and metadata from an element to the comic reader
	 * @param {Element} element
	 */
	ComicReader.prototype.addElement = function (element) {
		var _self = this;
		element.find('ol.images li').each(function () {
			_self.image_urls.push($(this).html());
			_self.elements.push(element);
		});
	};

	/**
	 * Returns the element attached to the current image
	 * @return {Element} 
	 */
	ComicReader.prototype.currentElement = function () {
		return this.elements[this.current_image];
	}

	/**
	 * Switches to the next image
	 */
	ComicReader.prototype.next = function () {
		// show/hiding elements is probably faster than adding/removing from dom
		if (this.hasNext()) {
			// load one image, to ensure that there are at least preload_quantity of images loaded in each direction
			this.loadImages(this.current_image + this.options.preload_quantity);

			this.current_image += 1;
			this._showCurrentImage();
		}
	};

	/**
	 * Switches to the previous image
	 */
	ComicReader.prototype.previous = function () {
		// show/hiding elements is probably faster than adding/removing from dom
		if (this.hasPrevious()) {
			// load one image, to ensure that there are at least preload_quantity of images loaded in each direction
			this.loadImages(this.current_image - this.options.preload_quantity);

			this.current_image -= 1;
			this._showCurrentImage();
		}
	};

	/**
	 * If there are images beyond the current one
	 * @return {Boolean} [description]
	 */
	ComicReader.prototype.hasNext = function () {
		return this.current_image < this.images.length - 1;
	};

	/**
	 * If there are images before the current one
	 * @return {Boolean}
	 */
	ComicReader.prototype.hasPrevious = function () {
		return this.current_image > 0;
	};


	/**
	 * Preloads a chunk of images, from start to start + count
	 * @param  {Number} start the first image to load
	 * @param  {Number} count the amount of images to laod
	 */
	ComicReader.prototype.loadImages = function (start, count) {
		// if count is left out, load one image only
		if (!count) {
			count = 1;
		}
		// if start is left out or negative, start at 0
		if (start < 0) {
			start = 0;
		}

		var end = start + count;

		// do not load beyond the last image
		if (this.images.length < end) {
			end = this.images.length;
		}

		// load images from start to end
		for (i = start; i < end; i++) {
			// if the image has not been loaded yet, create the image
			if (typeof this.images[i] === "undefined") {
				this.images[i] = $('<img>', {
					src : this.image_urls[i]
				});
			}
		}
	};

	/**
	 * Shows the Comic Reader
	 * @param  {Number} current_image Optional, sets the current image
	 */
	ComicReader.prototype.show = function (current_image) {
		if (typeof current_image != "undefined" && current_image != null) {
			this.current_image = current_image;

			// load the current image first
			this.loadImages(this.current_image, 1);
			// load the next {preload_images} images next
			this.loadImages(this.current_image + 1, this.options.preload_quantity);
			// load the previous {preload_images} images next
			this.loadImages(this.current_image - this.options.preload_quantity + 1, this.options.preload_quantity);

			this._showCurrentImage();
		}

		// if no images have been shown yet, add them
		if (this.root_element.find('img').length === 0) {
			this._showCurrentImage();
		}

		this.root_element.show();
	};

	/**
	 * Displays an the current image in the reader
	 * @return 
	 */
	ComicReader.prototype._showCurrentImage = function () {
		this.root_element.find('img').remove();
		this.root_element.append(this.images[this.current_image]);
		this.root_element.trigger('change');
	};


	/**
	 * Hides the Comic Reader
	 */
	ComicReader.prototype.hide = function () {
		this.root_element.hide();
	};

	/**
	 * Core of the jquery plugin. 
	 * This initalizes a ComicReader for each element, and returns an array of all created comic reader objects
	 * 
	 * Options keys:
	 * preload_quantity: the amount of images to load before navigation
	 * next: a string used to select a sub element of the ComicReader. Clicking this element will call ComicReader.next()
	 * previous: a string used to select a sub element of the ComicReader. Clicking this element will call ComicReader.previous()
	 * 1start: which image should first be shown
	 * 
	 * @param  {Object} options a list of options, accepts preload_quantity, next, previous and start.
	 * @return {[type]}         [description]
	 */
	$.fn.comicReader = function(options) {
		var comic_readers = [];
		options = $.extend({
		}, options);

		this.each(function () {
			var reader = new ComicReader($(this), options);
			comic_readers.push(reader);
			$(this).data('comic reader', reader);
		});

		return comic_readers;
	};
})( jQuery );
