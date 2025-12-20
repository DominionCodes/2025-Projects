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
	menu.querySelectorAll('a').forEach((link) => {
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
});
