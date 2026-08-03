// custom js

document.addEventListener('DOMContentLoaded', () => {
    const scrollToTop = document.getElementById('scroll-to-top');

    if (scrollToTop !== null) {
        const isMobile = ('maxTouchPoints' in navigator) && (navigator.maxTouchPoints > 0);

        // For some reason, on mobile I could not get window.scrollTo(0,0) working.
        // So instead scroll to highest anchor (Note: has to be heading, h1, h2, etc for some reason).
        if (isMobile) {
            scrollToTop.onclick = (e) => {
                window.location.hash = '#header';
                window.location.hash = '#';
            }
        }
    }
});
