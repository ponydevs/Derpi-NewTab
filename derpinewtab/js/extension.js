import Settings, { DOMAINS, RATING_TAGS, RESOLUTION_CAP } from './settings.js';
import csrfToken from './csrf-token.js';
import Cache from './local-cache.js';
import { isFirefox } from './firefox-detector.js';
import { requestDomainPermission } from './perms.js';
import fa from './fa.js';
import { vote, fave } from './interactions.js';
import Connectivity from './connectivity.js';

class Extension {
	constructor() {
		this.$settings = $('#settings');
		this.$version = $('#version');
		this.$searchSettings = $('#search-settings');
		this.$body = $('body');
		this.$metaSettings = $('#metadata-settings');
		this.$domainSettings = $('#domain-settings');
		this.$ffDomainApply = $('#firefox-domain-apply');
		this.$image = $('#image');
		this.$imageGhost = $('#image-ghost');
		this.$data = $('#data');
		this.$style = $('#style');
		this.$viewport = $('#viewport');
		this.$clearSettings = $('#clear-settings');
		this.$searchLink = $('#search-link');
		this.$showSettingsButton = $('#show-settings-button');
		this.$rescapWidth = $('#rescap-width');
		this.$rescapHeight = $('#rescap-height');
		this.$noRatingTags = $('#no-rating-tags');

		this.$ratingTags = this.$settings.find('.rating-tags');
		this.$domainSelect = this.$domainSettings.find('select');
		this.$metaToggles = this.$metaSettings.find('.switch input');
		this.$showEQGInput = this.$searchSettings.find('input[name="showeqg"]');
		this.$hdInput = this.$searchSettings.find('input[name="hd"]');
		this.$rescapInput = this.$searchSettings.find('input[name="rescap"]');

		this.updatingImage = false;
		this.fetchController = null;

		this.searchSettingsRefreshCountdownInterval = undefined;

		this.handleDomainChange = this.handleDomainChange.bind(this);
		this.resetDomainSelect = this.resetDomainSelect.bind(this);
		this.updateImage = this.updateImage.bind(this);
	}

	async init() {
		this.$version.text(' v' + chrome.runtime.getManifest().version);
		this.$rescapWidth.text(RESOLUTION_CAP[0]);
		this.$rescapHeight.text(RESOLUTION_CAP[1]);

		await Settings.init();
		await Cache.init();

		this.createElements();
		this.createSubscriptions();
		this.attachEventHandlers();
		this.handleFirstRun();

		this.displayImageData();
		this.updateImage();
	}

	createElements() {
		// Click-able rating tags
		const currentTagsSet = new Set(Settings.getTags());
		RATING_TAGS.forEach(el => {
			this.$ratingTags.append(
				$(document.createElement('label')).append(
					$(document.createElement('input')).attr({
						type: 'checkbox',
						name: el,
					}).prop('checked', currentTagsSet.has(el)),
					`<span class="tag" data-tag-category="rating">${el}</span>`
				)
			);
		});

		// Domain select
		const currentDomain = Settings.getDomain();
		DOMAINS.forEach(domain => {
			this.$domainSelect.append(`<option ${domain === currentDomain ? 'selected' : ''}>${domain}</option>`);
		});
	}

	createSubscriptions() {
		Cache.interactions.subscribe(() => this.displayImageData());
		Cache.imageData.subscribe(imageData => this.displayImageData(imageData));

		Settings.searchLink.subscribe(link => {
			this.$searchLink.attr('href', link.replace('.json?perpage=5&', '?'));
		});
		Settings.domain.subscribe(domain => {
			if (isFirefox)
				this.$domainSelect.triggerHandler('change');
			csrfToken.clear();
			this.updateDomainsOnPage(domain);
		});
		Settings.eqg.subscribe(checked => this.$showEQGInput.prop('checked', checked));
		Settings.hd.subscribe(checked => this.$hdInput.prop('checked', checked));
		Settings.rescap.subscribe(checked => this.$rescapInput.prop('checked', checked));
		this.$metaToggles.each((_, el) => {
			const { name } = el;
			Settings[name].subscribe(value => {
				setTimeout(() => {
					el.checked = value;
					this.$data.find('.' + name.replace(/^show/, '').toLowerCase())[value ? 'removeClass' : 'addClass']('hidden');
					const showingMetaCount = this.$metaToggles.filter(':checked').length;
					$('#artist-list')[showingMetaCount === 0 ? 'addClass' : 'removeClass']('expand');
					$('#metadata-list')[showingMetaCount === 0 ? 'hide' : 'show']();
				});
			});
		});

		Connectivity.online.subscribe(online => {
			this.$body[online ? 'removeClass' : 'addClass']('offline');
			if (!Cache.getImageData().id)
				this.updateImage();
		});
	}

	attachEventHandlers() {
		this.$showSettingsButton.removeClass('disabled').on('click', () => {
			this.$body.toggleClass('sidebar-open');
		});
		if (isFirefox){
			this.$ffDomainApply.on('click', this.handleDomainChange);
			this.$domainSelect.on('change', function() {
				this.$ffDomainApply.prop('disabled', this.$domainSelect.val() === Settings.getDomain());
			});
		}
		else {
			this.$ffDomainApply.remove();
			this.$domainSelect.on('change', this.handleDomainChange);
		}
		this.$searchSettings.find('input').on('click', () => {
			if (typeof this.searchSettingsRefreshCountdownInterval === "number"){
				clearInterval(this.searchSettingsRefreshCountdownInterval);
				this.searchSettingsRefreshCountdownInterval = undefined;
			}

			let i = 1,
				refreshCountdown = () => {
					if (i-- <= 0){
						this.updateSearchSettings();
						clearInterval(this.searchSettingsRefreshCountdownInterval);
					}
				};

			this.searchSettingsRefreshCountdownInterval = setInterval(refreshCountdown, 1000);
			refreshCountdown();
		});
		this.$metaSettings.find('.switch input').on('click', e => {
			e.preventDefault();

			const { name } = e.target;

			Settings.toggleSetting(name);
		});
		this.$clearSettings.on('click', e => {
			e.preventDefault();

			if (!confirm("This will clear all data from the extension's local storage. Any cached image data will be removed along with your settings.\n\nReady to start fresh?"))
				return;

			localStorage.clear();
			location.reload();
		});

		this.$data.on('click', '.upvotes', function() {
			const $this = $(this);
			const active = $this.hasClass('active');
			vote(active ? 'false' : 'up').then(() => {
				$this[active ? 'removeClass' : 'addClass']('active');
				const down = active ? undefined : false;
				Cache.setInteractions({ up: !active, down });
			});
		});
		this.$data.on('click', '.downvotes', function() {
			const $this = $(this);
			const active = $this.hasClass('active');
			vote(active ? 'false' : 'down').then(() => {
				$this[active ? 'removeClass' : 'addClass']('active');
				const up = active ? void 0 : false;
				Cache.setInteractions({ down: !active, up });
			});
		});
		this.$data.on('click', '.faves', function() {
			const $this = $(this);
			const active = $this.hasClass('active');
			fave(active ? 'false' : 'true').then(() => {
				$this[active ? 'removeClass' : 'addClass']('active');
				const up = !active ? true : undefined;
				const down = !active ? false : undefined;
				Cache.setInteractions({ fave: !active, up, down });
			});
		});
	}

	handleFirstRun() {
		if (localStorage.getItem('firstrun'))
			return;

		$(document.createElement('div'))
			.attr('id', 'dialog')
			.html('<div id="dialog-inner"><h1>Welcome to Derpi-New Tab</h1><p>To access the settings click the menu icon in the bottom left.<br><span class="faded">(this message is only displayed once)</span></p></div>')
			.children()
			.append($(document.createElement('button')).text('Got it').on('click', function(e) {
				e.preventDefault();

				localStorage.setItem('firstrun', '1');
				let $dialog = $('#dialog').addClass('gtfo');
				setTimeout(function() {
					$dialog.remove();
				}, 550);
			}))
			.end()
			.prependTo(this.$body);
	}

	handleDomainChange() {
		const newDomain = this.$domainSelect.val();

		if (!DOMAINS.has(newDomain)){
			this.resetDomainSelect();
			return;
		}

		requestDomainPermission(newDomain)
			.then(() => {
				Settings.setSetting('domain', newDomain);
			})
			.catch(this.resetDomainSelect);
	}

	resetDomainSelect() {
		this.$domainSelect.val(Settings.getDomain()).triggerHandler('change');
	}

	hideImages() {
		this.$viewport.removeClass('show-images');
	}

	showImages() {
		this.$viewport.addClass('show-images');
	}

	updateImage() {
		if (this.updatingImage){
			this.fetchController.abort();
		}

		this.updatingImage = true;
		this.fetchController = new AbortController();
		const isOffline = !Connectivity.isOnline();
		const cachedImageData = Cache.getImageData();
		const done = () => {
			this.updatingImage = false;
			this.$body.removeClass('loading');
		};
		const err = () => {
			if (!cachedImageData.id)
				this.$data.html('<h1>There was an error while fetching the image data</h1><p>' + (isOffline ? 'You are not connected to the Internet.' : 'Derpibooru may be down for maintenance, try again later.') + '</p>');
			else console.error('There was an error while searching for new images, keeping last cached state silently');
			done();
		};

		this.$searchSettings.find('.re-request:visible').slideUp();

		if (isOffline){
			err();
			return;
		}

		if (this.$data.is(':empty'))
			this.$data.html('<h1>Requesting metadata&hellip;</h1>');
		this.$body.addClass('loading');

		Cache.updateImageData(this.fetchController.signal).then(image => {
			const cachedImageData = Cache.getImageData();
			if (cachedImageData.sha512_hash === image.sha512_hash){
				this.showImages();
				done();
				return;
			}

			$(new Image()).attr('src', image.image).on('load', () => {
				this.updatingImage = false;
				this.$body.removeClass('loading');
				Cache.setImageData(image);
			}).on('error', () => {
				if (!image.is_rendered)
					this.$data.html('<h1>Image has not been rendered yet</h1><p>Try reloading in a minute or so</p>');
				else this.$data.html('<h1>Image failed to load</h1><p>Either the image is no longer available or the extension is broken</p>');
				this.showImages();
				done();
			});
		}).catch(msgs => {
			if (!Array.isArray(msgs)){
				if (msgs.indexOf('abort') !== -1){
					done();
					return;
				}
				err();
			}
			this.showImages();
			this.$body.removeClass('loading');
			this.$data.html(`<h1>${msgs[0]}</h1>`);
			if (msgs.length > 1)
				this.$data.appendChild(`<p>${msgs[1]}</p>`);
			done();
		});
	}

	async updateSearchSettings() {
		const tagArray = [];
		this.$ratingTags.find('input').each(function(_, el) {
			const { name, checked } = el;
			if (checked)
				tagArray.push(name);
		});
		if (!tagArray.length){
			this.$noRatingTags.stop().slideDown();
			return;
		}
		this.$noRatingTags.stop().slideUp();

		await Settings.setSetting('tags', tagArray);
		await Settings.setSetting('eqg', this.$showEQGInput.prop('checked'));
		await Settings.setSetting('hd', this.$hdInput.prop('checked'));
		await Settings.setSetting('rescap', this.$rescapInput.prop('checked'));

		this.hideImages();
		this.updateImage();
	}

	updateDomainsOnPage(domain = Settings.getDomain()) {
		$('#view-comments').attr('href', `https://${domain}/${Cache.getImageData().id}#comments`);
		$('.anchor-domain').each(function() {
			const $el = $(this);
			if (typeof $el.attr('data-href') === 'undefined')
				$el.attr('data-href', $el.attr('href'));
			$el.attr('href', $el.attr('data-href').replace('domain.tld', domain));
		});
		$('.contents-domain').html(domain);
	}

	displayImageData(imageData = Cache.getImageData()) {
		if (!imageData.id)
			return;

		let tags = imageData.tags.split(', '),
			artists = [];

		$.each(tags, function(i, el) {
			if (el.indexOf('artist:') === 0)
				artists.push(el.substring(7));
		});

		let artistText = artists.length ? 'By ' + artists.join(', ').replace(/, ([^,]+)$/g, ' and $1') : 'Unknown Artist';

		const $artistList = $('#artist-list');
		const artistsLink = `<a href="https://domain.tld/${imageData.id}" class="anchor-domain">${artistText}</a>`;
		if (!$artistList.length)
			this.$data.html(`<h1 id="artist-list">${artistsLink}</h1>`);
		else $artistList.html(artistsLink);
		const $metadataList = $('#metadata-list');
		const score = imageData.upvotes - imageData.downvotes;
		const interactions = Cache.getInteractions();
		if (!$metadataList.length){
			this.$data.append(
				`<p id="metadata-list">
					<span class="uploader">${fa.upload}<span>${imageData.uploader.replace(/</g, '&lt;')}</span></span>
					<a class="faves${interactions.fave ? ' active' : ''}">${fa.star}<span>${imageData.faves}</span></a>
					<a class="upvotes votes${interactions.up ? ' active' : ''}">${fa.arrowUp}<span class="votecounts">${imageData.upvotes}</span></a>
					<span class="score"><span>${score}</span></span>
					<a class="downvotes votes${interactions.down ? ' active' : ''}">${fa.arrowDown}<span class="votecounts">${imageData.downvotes}</span></a>
					<a class="comments" id="view-comments">${fa.comments}<span>${imageData.comment_count}</span></a>
				</p>`
			);
		}
		else {
			$metadataList.children('.uploader')
				.children().last().text(imageData.uploader);
			$metadataList.children('.faves')[interactions.fave ? 'addClass' : 'removeClass']('active')
				.children().last().html(imageData.faves);
			$metadataList.children('.upvotes')[interactions.up ? 'addClass' : 'removeClass']('active')
				.children().last().html(imageData.upvotes);
			$metadataList.children('.score')
				.children().last().html(score);
			$metadataList.children('.downvotes')[interactions.down ? 'addClass' : 'removeClass']('active')
				.children().last().html(imageData.downvotes);
			$metadataList.children('.comments')
				.children().last().html(imageData.comment_count);
		}

		this.setBackgroundStyles(imageData);
		this.updateDomainsOnPage();
		this.showImages();
	}

	setBackgroundStyles(imageData) {
		if (typeof imageData.image !== 'string')
			return;
		this.$body.removeClass('no-pony');
		this.hideImages();
		$(new Image()).attr('src', imageData.image).on('load', () => {
			let url = imageData.image.replace(/"/g, '%22');
			this.$style.html(
				'#image{background-image:url("' + url + '")}' +
				'#image-ghost{background-image:url("' + url + '")}'
			);
			this.$body.removeClass('loading');
			this.showImages();
		}).on('error', () => {
			this.$style.empty();
			this.$body.removeClass('loading').addClass('no-pony');
			this.hideImages();
		});
	}
}


export default (new Extension());