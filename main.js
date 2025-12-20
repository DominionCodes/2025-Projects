document.addEventListener('DOMContentLoaded', () => {
	const toggle = document.querySelector('.nav-toggle');
	const menu = document.getElementById('primary-navigation');
	if (!toggle || !menu) return;

	toggle.addEventListener('click', (e) => {
		const expanded = toggle.getAttribute('aria-expanded') === 'true';
		toggle.setAttribute('aria-expanded', String(!expanded));
		menu.classList.toggle('open');
	});

	// Close menu when a navigation link is clicked (mobile)
	menu.querySelectorAll('a').forEach((link) => {4
		link.addEventListener('click', () => {
			if (menu.classList.contains('open')) {
				menu.classList.remove('open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	});

	// Click outside to close
	document.addEventListener('click', (e) => {
		if (!menu.classList.contains('open')) return;
		const path = e.composedPath ? e.composedPath() : (e.path || []);
		if (!path.includes(menu) && !path.includes(toggle)) {
			menu.classList.remove('open');
			toggle.setAttribute('aria-expanded', 'false');
		}
	});

	// Close via Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && menu.classList.contains('open')) {
			menu.classList.remove('open');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.focus();
		}
	});

	// --- Scroll-to-bottom button behavior ---
	const scrollBtn = document.getElementById('scrollToBottom');
	if (scrollBtn) {
		const SHOW_AFTER = 300; // px scrolled from top before showing
		const atBottom = () => (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 6);

		const updateScrollButton = () => {
			if (atBottom()) {
				scrollBtn.classList.remove('visible');
				return;
			}
			if (window.scrollY > SHOW_AFTER) {
				scrollBtn.classList.add('visible');
			} else {
				scrollBtn.classList.remove('visible');
			}
		};

		// Click -> smooth scroll to footer or bottom
		scrollBtn.addEventListener('click', () => {
			const footer = document.querySelector('.footer') || document.querySelector('footer');
			if (footer) {
				footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
			} else {
				window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
			}
		});

		// Keyboard accessibility (Enter / Space)
		scrollBtn.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				scrollBtn.click();
			}
		});

		// Update on scroll/resize
		window.addEventListener('scroll', updateScrollButton, { passive: true });
		window.addEventListener('resize', updateScrollButton);

		// Initial check
		updateScrollButton();
	}
});
