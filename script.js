document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA DO CARROSSEL DE BANNER (Mantida) ---
    const bannerCarouselContainer = document.querySelector('.banner-section .carousel-container');
    const bannerSlides = document.querySelectorAll('.banner-section .carousel-slide');
    const bannerIndicators = document.querySelectorAll('.banner-section .indicator-item');
    const bannerSlideIntervalTime = 5000;
    let currentBannerSlide = 0;
    let bannerAutoRotateInterval;
    let bannerTouchStartX = 0;
    let bannerTouchStartY = 0;
    let bannerTouchEndX = 0;
    const bannerIndicatorsContainer = document.querySelector('.banner-section .carousel-indicators');

    if (bannerSlides.length > 0) {
        function updateBannerIndicators(activeIndex) {
            if (bannerIndicators.length === bannerSlides.length) {
                bannerIndicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === activeIndex);
                });
            }
        }
        function showBannerSlide(index) {
            const N = bannerSlides.length;
            if (N === 0) return;
            const effectiveIndex = (index % N + N) % N;
            bannerSlides.forEach((slide) => slide.classList.remove('active'));
            if (bannerSlides[effectiveIndex]) {
                bannerSlides[effectiveIndex].classList.add('active');
                updateBannerIndicators(effectiveIndex);
                currentBannerSlide = effectiveIndex;
            }
        }
        function moveToNextBannerSlide() { showBannerSlide(currentBannerSlide + 1); }
        function moveToPrevBannerSlide() { showBannerSlide(currentBannerSlide - 1); }
        function startBannerAutoRotate() {
            clearInterval(bannerAutoRotateInterval);
            if (bannerSlides.length > 1) {
                bannerAutoRotateInterval = setInterval(moveToNextBannerSlide, bannerSlideIntervalTime);
            }
        }
        if (bannerIndicators.length === bannerSlides.length && bannerSlides.length > 1) {
            bannerIndicators.forEach(indicator => {
                indicator.addEventListener('click', function() {
                    const slideTo = parseInt(this.dataset.slideTo);
                    if (slideTo !== currentBannerSlide && bannerSlides[slideTo]) {
                        showBannerSlide(slideTo);
                        startBannerAutoRotate();
                    }
                });
            });
        }
        if (bannerSlides.length <= 1) {
            if(bannerIndicatorsContainer) bannerIndicatorsContainer.classList.add('hidden');
        }
        if (bannerCarouselContainer && bannerSlides.length > 1) {
            bannerCarouselContainer.addEventListener('touchstart', e => { bannerTouchStartX = e.touches?.[0]?.clientX; bannerTouchStartY = e.touches?.[0]?.clientY; }, { passive: true });
            bannerCarouselContainer.addEventListener('touchend', e => {
                if (bannerTouchStartX === 0) return;
                bannerTouchEndX = e.changedTouches?.[0]?.clientX;
                let bannerTouchEndY = e.changedTouches?.[0]?.clientY;
                handleBannerSwipe(bannerTouchEndY);
                bannerTouchStartX = 0; bannerTouchStartY = 0;
            }, { passive: true });
        }
        function handleBannerSwipe(currentTouchEndY) {
            const swipeThresholdX = 40, swipeThresholdY = 60;
            let diffX = bannerTouchStartX - bannerTouchEndX;
            let diffY = Math.abs(bannerTouchStartY - currentTouchEndY);
            if (Math.abs(diffX) > swipeThresholdX && diffY < swipeThresholdY) {
                if (diffX > 0) moveToNextBannerSlide(); else moveToPrevBannerSlide();
                startBannerAutoRotate();
            }
        }
        if (bannerSlides.length > 0) {
            showBannerSlide(0);
            startBannerAutoRotate();
        }
    } else {
        if(bannerIndicatorsContainer) bannerIndicatorsContainer.classList.add('hidden');
    }

    // --- LÓGICA DO CARROSSEL DE SERVIÇOS (REMOVIDA) ---
    // Todo o bloco de código referente ao carrossel de serviços foi removido daqui.

    // --- LÓGICA DO MODAL DE SERVIÇO (AJUSTADA) ---
    const modalContainer = document.querySelector('.service-modal-container');
    const servicosGridStatic = document.querySelector('.servicos-grid-static'); // Container dos cards de serviço estáticos

    if (servicosGridStatic && modalContainer) {
        const modalTitleEl = modalContainer.querySelector('#service-modal-title');
        const modalTextEl = modalContainer.querySelector('#service-modal-text');
        const modalCloseButton = modalContainer.querySelector('.modal-close-button');

        if (modalTitleEl && modalTextEl && modalCloseButton) {
            servicosGridStatic.addEventListener('click', function(event) {
                const clickedCard = event.target.closest('.servico-card-static'); // Procura pelo card clicado
                if (clickedCard) {
                    const title = clickedCard.dataset.serviceTitle || "Detalhes do Serviço";
                    let textData = clickedCard.dataset.serviceText || "Informação detalhada não disponível.|Por favor, entre em contato para mais informações.";
                    const paragraphs = textData.split('|').map(pText => `<p>${pText.trim()}</p>`).join('');

                    modalTitleEl.textContent = title;
                    modalTextEl.innerHTML = paragraphs;
                    modalContainer.classList.add('active');
                }
            });

            // Evento para fechar o modal no botão
            if (!modalCloseButton.dataset.listenerAttached) {
                modalCloseButton.addEventListener('click', () => {
                    modalContainer.classList.remove('active');
                });
                modalCloseButton.dataset.listenerAttached = 'true';
            }

            // Evento para fechar o modal clicando fora do conteúdo
            if (!modalContainer.dataset.listenerAttached) {
                 modalContainer.addEventListener('click', (e) => {
                    if (e.target === modalContainer) { // Verifica se o clique foi no próprio container do modal (fundo)
                        modalContainer.classList.remove('active');
                    }
                });
                modalContainer.dataset.listenerAttached = 'true';
            }
        }
    }
});