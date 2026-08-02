document.addEventListener('DOMContentLoaded', () => {
    let viewerModule;
    let webGLSupported;

    const supportsWebGL = () => {
        if (webGLSupported !== undefined) return webGLSupported;
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
            webGLSupported = context !== null;
        } catch (error) {
            webGLSupported = false;
        }
        return webGLSupported;
    };

    document.querySelectorAll('.model-card').forEach((card) => {
        const media = card.querySelector('.model-media');
        const poster = media.querySelector('img');
        const placeholder = media.querySelector('.model-placeholder');
        const loadButton = card.querySelector('.model-load');
        const viewerControls = card.querySelector('.model-view-controls');
        const partSelect = card.querySelector('.model-part-select');
        const renderMode = card.querySelector('.model-render-mode');
        const lightingMode = card.querySelector('.model-lighting-mode');
        const resetButton = card.querySelector('.model-reset');
        const fullscreenButton = card.querySelector('.model-fullscreen');
        const closeButton = card.querySelector('.model-close');
        const status = card.querySelector('.model-status');
        let viewer;

        const loadViewer = async () => {
            viewer?.dispose();
            viewer = undefined;
            viewerControls.hidden = true;
            card.classList.add('is-viewing');
            media.classList.add('is-active');
            status.textContent = 'Loading 3D viewer…';

            const selectedPart = partSelect?.selectedOptions[0];
            const src = selectedPart?.value || loadButton.dataset.model;
            const fallbackSrc = selectedPart?.dataset.fallbackModel || loadButton.dataset.fallbackModel;
            const upAxis = selectedPart?.dataset.upAxis || loadButton.dataset.upAxis;

            try {
                viewerModule ??= import(loadButton.dataset.viewerModule);
                const module = await viewerModule;
                viewer = await module.createModelViewer(media, {
                    src,
                    fallbackSrc,
                    upAxis,
                    alt: loadButton.dataset.alt,
                    onStatus: (message) => {
                        status.textContent = message;
                    },
                });
                media.append(viewerControls);
                viewer.setRenderMode(renderMode.value);
                viewer.setLightingMode(lightingMode.value);
                status.textContent = '3D model loaded. Drag to orbit and scroll to zoom.';
                viewerControls.hidden = false;
                loadButton.hidden = true;
                fullscreenButton.hidden = !document.fullscreenEnabled;
            } catch (error) {
                console.error('Unable to load 3D model', error);
                media.replaceChildren(...[poster, placeholder].filter(Boolean));
                card.classList.remove('is-viewing');
                media.classList.remove('is-active');
                viewerControls.hidden = true;
                loadButton.disabled = false;
                loadButton.hidden = false;
                loadButton.textContent = 'Try again';
                status.textContent = 'The 3D viewer could not be loaded. Source and download links remain available.';
            }
        };

        loadButton.addEventListener('click', async () => {
            if (!supportsWebGL()) {
                loadButton.disabled = true;
                loadButton.textContent = '3D unavailable';
                status.textContent = 'WebGL is unavailable in this browser. The source and STL download remain available.';
                return;
            }

            loadButton.disabled = true;
            loadButton.textContent = 'Loading…';
            await loadViewer();
        });

        partSelect?.addEventListener('change', loadViewer);
        placeholder?.addEventListener('click', () => loadButton.click());

        closeButton.addEventListener('click', async () => {
            if (document.fullscreenElement === media) await document.exitFullscreen();
            viewer?.dispose();
            viewer = undefined;
            media.replaceChildren(...[poster, placeholder].filter(Boolean));
            card.classList.remove('is-viewing');
            media.classList.remove('is-active');
            viewerControls.hidden = true;
            loadButton.disabled = false;
            loadButton.hidden = false;
            loadButton.textContent = 'View 3D';
            status.textContent = '';
        });

        resetButton.addEventListener('click', () => {
            viewer?.reset();
        });

        renderMode.addEventListener('change', () => {
            viewer?.setRenderMode(renderMode.value);
        });

        lightingMode.addEventListener('change', () => {
            viewer?.setLightingMode(lightingMode.value);
        });

        fullscreenButton.addEventListener('click', async () => {
            if (!document.fullscreenElement) {
                await media.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        });

        document.addEventListener('fullscreenchange', () => {
            const fullscreen = document.fullscreenElement === media;
            fullscreenButton.title = fullscreen ? 'Exit fullscreen' : 'Fullscreen';
            fullscreenButton.setAttribute('aria-label', fullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
            fullscreenButton.querySelector('i').className = fullscreen ? 'fas fa-compress' : 'fas fa-expand';
        });
    });
});
