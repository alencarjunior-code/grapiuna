document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA DO CARROSSEL DE BANNER ---
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

    // --- LÓGICA DO MODAL ---
    const modalContainer = document.querySelector('.service-modal-container');
    const servicosGridStatic = document.querySelector('.servicos-grid-static');
    const produtosCarouselList = document.querySelector('.produtos-carousel');

    if (modalContainer) {
        const modalTitleEl = modalContainer.querySelector('#service-modal-title');
        const modalTextEl = modalContainer.querySelector('#service-modal-text');
        const modalCloseButton = modalContainer.querySelector('.modal-close-button');

        if (modalTitleEl && modalTextEl && modalCloseButton) {
            function openModalWithContent(title, textData) {
                const paragraphs = textData.split('|').map(pText => `<p>${pText.trim()}</p>`).join('');
                modalTitleEl.textContent = title;
                modalTextEl.innerHTML = paragraphs;
                modalContainer.classList.add('active');
            }

            if (!modalCloseButton.dataset.listenerAttached) {
                modalCloseButton.addEventListener('click', () => {
                    modalContainer.classList.remove('active');
                });
                modalCloseButton.dataset.listenerAttached = 'true';
            }

            if (!modalContainer.dataset.listenerAttached) {
                 modalContainer.addEventListener('click', (e) => {
                    if (e.target === modalContainer) {
                        modalContainer.classList.remove('active');
                    }
                });
                modalContainer.dataset.listenerAttached = 'true';
            }

            if (servicosGridStatic) {
                servicosGridStatic.addEventListener('click', function(event) {
                    const clickedCard = event.target.closest('.servico-card-static');
                    if (clickedCard) {
                        const title = clickedCard.dataset.serviceTitle || "Detalhes do Serviço";
                        const textData = clickedCard.dataset.serviceText || "Informação detalhada não disponível.|Por favor, entre em contato para mais informações.";
                        openModalWithContent(title, textData);
                    }
                });
            }

            if (produtosCarouselList) {
                produtosCarouselList.addEventListener('click', function(event) {
                    const clickedProduto = event.target.closest('.produto-item');
                    if (clickedProduto && clickedProduto.dataset.produtoTitle) {
                        const title = clickedProduto.dataset.produtoTitle;
                        const textData = clickedProduto.dataset.produtoText || "Descrição detalhada não disponível.|Consulte-nos para mais informações.";
                        openModalWithContent(title, textData);
                    }
                });
            }
        }
    }

    // --- LÓGICA DO CARROSSEL DE PRODUTOS ---
    const produtosCarouselJS = document.querySelector('.produtos-carousel');
    const produtosCarouselViewportJS = document.querySelector('.produtos-carousel-viewport');
    const prevButtonProdutos = document.querySelector('.produto-carousel-btn.prev');
    const nextButtonProdutos = document.querySelector('.produto-carousel-btn.next');

    if (produtosCarouselJS && prevButtonProdutos && nextButtonProdutos) {
        const produtoItemsAll = document.querySelectorAll('.produto-item');
        const totalProdutoItems = produtoItemsAll.length;

        let itemsPerPageProdutos;
        let currentProdutoItemIndex = 0;
        let numDistinctPositionsProdutos;

        let produtosAutoRotateInterval;
        const produtosSlideIntervalTime = 5000;

        let produtosTouchStartX = 0;
        let produtosTouchEndX = 0;

        function setupProdutoCarousel() {
            const screenWidth = window.innerWidth;
            if (screenWidth <= 768) {
                itemsPerPageProdutos = 1;
            } else if (screenWidth <= 992) {
                itemsPerPageProdutos = 2;
            } else {
                itemsPerPageProdutos = 4;
            }

            if (totalProdutoItems === 0) {
                numDistinctPositionsProdutos = 0;
            } else if (itemsPerPageProdutos === 1) {
                 numDistinctPositionsProdutos = totalProdutoItems;
            } else if (totalProdutoItems <= itemsPerPageProdutos) {
                numDistinctPositionsProdutos = 1;
            } else {
                numDistinctPositionsProdutos = totalProdutoItems - itemsPerPageProdutos + 1;
            }

            if (numDistinctPositionsProdutos === 0 || (numDistinctPositionsProdutos === 1 && totalProdutoItems <= itemsPerPageProdutos && itemsPerPageProdutos > 1) ) {
                currentProdutoItemIndex = 0;
            } else {
                currentProdutoItemIndex = Math.min(currentProdutoItemIndex, numDistinctPositionsProdutos - 1);
                currentProdutoItemIndex = Math.max(0, currentProdutoItemIndex);
            }

            updateProdutoCarouselView();
            startProdutosAutoRotate();
        }

        function updateProdutoCarouselView() {
            if (totalProdutoItems === 0) {
                produtosCarouselJS.style.transform = `translateX(0%)`;
                if (prevButtonProdutos) prevButtonProdutos.style.display = 'none';
                if (nextButtonProdutos) nextButtonProdutos.style.display = 'none';
                return;
            }

            if (numDistinctPositionsProdutos > 1) {
                if (prevButtonProdutos) prevButtonProdutos.style.display = 'flex';
                if (nextButtonProdutos) nextButtonProdutos.style.display = 'flex';
            } else {
                if (prevButtonProdutos) prevButtonProdutos.style.display = 'none';
                if (nextButtonProdutos) nextButtonProdutos.style.display = 'none';
            }

            const itemWidthPercentage = 100 / itemsPerPageProdutos;
            const translateXValue = -currentProdutoItemIndex * itemWidthPercentage;
            produtosCarouselJS.style.transform = `translateX(${translateXValue}%)`;
        }

        function moveToNextProdutoItem() {
            if (numDistinctPositionsProdutos <= 1) return;
            currentProdutoItemIndex++;
            if (currentProdutoItemIndex >= numDistinctPositionsProdutos) {
                currentProdutoItemIndex = 0;
            }
            updateProdutoCarouselView();
        }

        function moveToPrevProdutoItem() {
            if (numDistinctPositionsProdutos <= 1) return;
            currentProdutoItemIndex--;
            if (currentProdutoItemIndex < 0) {
                currentProdutoItemIndex = numDistinctPositionsProdutos - 1;
            }
            updateProdutoCarouselView();
        }

        function startProdutosAutoRotate() {
            clearInterval(produtosAutoRotateInterval);
            if (numDistinctPositionsProdutos > 1) {
                produtosAutoRotateInterval = setInterval(moveToNextProdutoItem, produtosSlideIntervalTime);
            }
        }

        nextButtonProdutos.addEventListener('click', () => {
            moveToNextProdutoItem();
            startProdutosAutoRotate();
        });

        prevButtonProdutos.addEventListener('click', () => {
            moveToPrevProdutoItem();
            startProdutosAutoRotate();
        });

        if (produtosCarouselViewportJS) {
            produtosCarouselViewportJS.addEventListener('touchstart', e => {
                produtosTouchStartX = e.touches[0].clientX;
                clearInterval(produtosAutoRotateInterval);
            }, { passive: true });

            produtosCarouselViewportJS.addEventListener('touchend', e => {
                if (produtosTouchStartX === 0 || numDistinctPositionsProdutos <=1) {
                    startProdutosAutoRotate();
                    return;
                }
                produtosTouchEndX = e.changedTouches[0].clientX;
                handleProdutosSwipe();
                produtosTouchStartX = 0;
                startProdutosAutoRotate();
            }, { passive: true });
        }

        function handleProdutosSwipe() {
            const swipeThreshold = 50;
            let diffX = produtosTouchStartX - produtosTouchEndX;
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) { moveToNextProdutoItem(); } else { moveToPrevProdutoItem(); }
            }
        }

        setupProdutoCarousel();
        window.addEventListener('resize', setupProdutoCarousel);

        const produtosCarouselWrapper = document.querySelector('.produtos-carousel-wrapper');
        if (produtosCarouselWrapper) {
            produtosCarouselWrapper.addEventListener('mouseenter', () => {
                clearInterval(produtosAutoRotateInterval);
            });
            produtosCarouselWrapper.addEventListener('mouseleave', () => {
                startProdutosAutoRotate();
            });
        }

    } else {
        if (prevButtonProdutos) prevButtonProdutos.style.display = 'none';
        if (nextButtonProdutos) nextButtonProdutos.style.display = 'none';
    }

    // --- LÓGICA PARA ABAS DA SEÇÃO INFORMAÇÕES TÉCNICAS ---
    const infoTabsNav = document.querySelector('.info-tabs-nav');
    if (infoTabsNav) {
        const infoTabButtons = infoTabsNav.querySelectorAll('.info-tab-btn');
        const infoTabContents = document.querySelectorAll('.info-tab-content');

        function showInfoTab(tabId) {
            infoTabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
            infoTabButtons.forEach(button => {
                button.classList.toggle('active', ('tab-' + button.dataset.tab) === tabId);
            });
        }

        infoTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTabId = 'tab-' + this.dataset.tab;
                showInfoTab(targetTabId);
            });
        });

        const activeTabButton = infoTabsNav.querySelector('.info-tab-btn.active');
        if (activeTabButton) {
            showInfoTab('tab-' + activeTabButton.dataset.tab);
        } else if (infoTabButtons.length > 0) {
            infoTabButtons[0].classList.add('active');
            if (infoTabContents.length > 0) {
                 infoTabContents[0].classList.add('active');
            }
        }
    }

    // --- LÓGICA PARA CARROSSEL DE AVALIAÇÕES ---
    const avaliacoesCarousel = document.querySelector('.avaliacoes-carousel');
    const avaliacoesCarouselViewport = document.querySelector('.avaliacoes-carousel-viewport');
    const prevButtonAvaliacoes = document.querySelector('.avaliacao-carousel-btn.prev');
    const nextButtonAvaliacoes = document.querySelector('.avaliacao-carousel-btn.next');

    if (avaliacoesCarousel && prevButtonAvaliacoes && nextButtonAvaliacoes) {
        const avaliacaoCards = document.querySelectorAll('.avaliacao-card');
        const totalAvaliacaoCards = avaliacaoCards.length;

        let itemsPerPageAvaliacoes;
        let currentAvaliacaoPaneIndex = 0;
        let totalAvaliacaoPanes;

        let avaliacoesAutoRotateInterval;
        const avaliacoesSlideIntervalTime = 7000;

        let avaliacoesTouchStartX = 0;
        let avaliacoesTouchEndX = 0;

        function setupAvaliacoesCarousel() {
            const screenWidth = window.innerWidth;
            if (screenWidth <= 768) {
                itemsPerPageAvaliacoes = 1;
            } else if (screenWidth <= 992) {
                itemsPerPageAvaliacoes = 2;
            } else {
                itemsPerPageAvaliacoes = 4;
            }

            totalAvaliacaoPanes = totalAvaliacaoCards > 0 ? Math.ceil(totalAvaliacaoCards / itemsPerPageAvaliacoes) : 0;

            if (totalAvaliacaoPanes === 0) {
                currentAvaliacaoPaneIndex = 0;
            } else {
                currentAvaliacaoPaneIndex = Math.min(currentAvaliacaoPaneIndex, totalAvaliacaoPanes - 1);
                currentAvaliacaoPaneIndex = Math.max(0, currentAvaliacaoPaneIndex);
            }

            updateAvaliacoesCarouselView();
            startAvaliacoesAutoRotate();
        }

        function updateAvaliacoesCarouselView() {
            if (totalAvaliacaoCards === 0 || totalAvaliacaoPanes === 0) {
                avaliacoesCarousel.style.transform = `translateX(0%)`;
                if (prevButtonAvaliacoes) prevButtonAvaliacoes.style.display = 'none';
                if (nextButtonAvaliacoes) nextButtonAvaliacoes.style.display = 'none';
                return;
            }

            if (totalAvaliacaoPanes > 1) {
                if (prevButtonAvaliacoes) prevButtonAvaliacoes.style.display = 'flex';
                if (nextButtonAvaliacoes) nextButtonAvaliacoes.style.display = 'flex';
            } else {
                if (prevButtonAvaliacoes) prevButtonAvaliacoes.style.display = 'none';
                if (nextButtonAvaliacoes) nextButtonAvaliacoes.style.display = 'none';
            }

            const translateXValue = -currentAvaliacaoPaneIndex * 100;
            avaliacoesCarousel.style.transform = `translateX(${translateXValue}%)`;
        }

        function moveToNextAvaliacaoPane() {
            if (totalAvaliacaoPanes <= 1) return;
            currentAvaliacaoPaneIndex++;
            if (currentAvaliacaoPaneIndex >= totalAvaliacaoPanes) {
                currentAvaliacaoPaneIndex = 0;
            }
            updateAvaliacoesCarouselView();
        }

        function moveToPrevAvaliacaoPane() {
            if (totalAvaliacaoPanes <= 1) return;
            currentAvaliacaoPaneIndex--;
            if (currentAvaliacaoPaneIndex < 0) {
                currentAvaliacaoPaneIndex = totalAvaliacaoPanes - 1;
            }
            updateAvaliacoesCarouselView();
        }

        function startAvaliacoesAutoRotate() {
            clearInterval(avaliacoesAutoRotateInterval);
            if (totalAvaliacaoPanes > 1) {
                avaliacoesAutoRotateInterval = setInterval(moveToNextAvaliacaoPane, avaliacoesSlideIntervalTime);
            }
        }

        nextButtonAvaliacoes.addEventListener('click', () => {
            moveToNextAvaliacaoPane();
            startAvaliacoesAutoRotate();
        });

        prevButtonAvaliacoes.addEventListener('click', () => {
            moveToPrevAvaliacaoPane();
            startAvaliacoesAutoRotate();
        });

        if (avaliacoesCarouselViewport) {
            avaliacoesCarouselViewport.addEventListener('touchstart', e => {
                avaliacoesTouchStartX = e.touches[0].clientX;
                clearInterval(avaliacoesAutoRotateInterval);
            }, { passive: true });

            avaliacoesCarouselViewport.addEventListener('touchend', e => {
                if (avaliacoesTouchStartX === 0 || totalAvaliacaoPanes <= 1) {
                    startAvaliacoesAutoRotate();
                    return;
                }
                avaliacoesTouchEndX = e.changedTouches[0].clientX;
                handleAvaliacoesSwipe();
                avaliacoesTouchStartX = 0;
                startAvaliacoesAutoRotate();
            }, { passive: true });
        }

        function handleAvaliacoesSwipe() {
            const swipeThreshold = 50;
            let diffX = avaliacoesTouchStartX - avaliacoesTouchEndX;

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    moveToNextAvaliacaoPane();
                } else {
                    moveToPrevAvaliacaoPane();
                }
            }
        }

        setupAvaliacoesCarousel();
        window.addEventListener('resize', setupAvaliacoesCarousel);

        const avaliacoesCarouselWrapper = document.querySelector('.avaliacoes-carousel-wrapper');
        if (avaliacoesCarouselWrapper) {
            avaliacoesCarouselWrapper.addEventListener('mouseenter', () => {
                clearInterval(avaliacoesAutoRotateInterval);
            });
            avaliacoesCarouselWrapper.addEventListener('mouseleave', () => {
                startAvaliacoesAutoRotate();
            });
        }
    } else {
        if (prevButtonAvaliacoes) prevButtonAvaliacoes.style.display = 'none';
        if (nextButtonAvaliacoes) nextButtonAvaliacoes.style.display = 'none';
    }

    // --- LÓGICA PARA CARROSSEL GALERIA CONFIANÇA ---
    const galeriaConfiancaCarousel = document.querySelector('.galeria-confianca-carousel');
    const galeriaConfiancaCarouselViewport = document.querySelector('.galeria-confianca-carousel-viewport');
    const prevButtonGaleriaConfianca = document.querySelector('.galeria-confianca-carousel-btn.prev');
    const nextButtonGaleriaConfianca = document.querySelector('.galeria-confianca-carousel-btn.next');

    if (galeriaConfiancaCarousel && prevButtonGaleriaConfianca && nextButtonGaleriaConfianca) {
        const galeriaConfiancaItems = document.querySelectorAll('.galeria-confianca-item');
        const totalGaleriaConfiancaItems = galeriaConfiancaItems.length;

        let currentGaleriaConfiancaIndex = 0;

        let galeriaConfiancaAutoRotateInterval;
        const galeriaConfiancaSlideIntervalTime = 7000;

        let galeriaConfiancaTouchStartX = 0;
        let galeriaConfiancaTouchEndX = 0;

        function setupGaleriaConfiancaCarousel() {
            if (totalGaleriaConfiancaItems <= 1) {
                if(prevButtonGaleriaConfianca) prevButtonGaleriaConfianca.style.display = 'none';
                if(nextButtonGaleriaConfianca) nextButtonGaleriaConfianca.style.display = 'none';
            } else {
                if(prevButtonGaleriaConfianca) prevButtonGaleriaConfianca.style.display = 'flex';
                if(nextButtonGaleriaConfianca) nextButtonGaleriaConfianca.style.display = 'flex';
            }
            updateGaleriaConfiancaCarouselView();
            startGaleriaConfiancaAutoRotate();
        }

        function updateGaleriaConfiancaCarouselView() {
            if (totalGaleriaConfiancaItems === 0) {
                galeriaConfiancaCarousel.style.transform = `translateX(0%)`;
                return;
            }
            const translateXValue = -currentGaleriaConfiancaIndex * 100;
            galeriaConfiancaCarousel.style.transform = `translateX(${translateXValue}%)`;
        }

        function moveToNextGaleriaConfianca() {
            if (totalGaleriaConfiancaItems <= 1) return;
            currentGaleriaConfiancaIndex++;
            if (currentGaleriaConfiancaIndex >= totalGaleriaConfiancaItems) {
                currentGaleriaConfiancaIndex = 0;
            }
            updateGaleriaConfiancaCarouselView();
        }

        function moveToPrevGaleriaConfianca() {
            if (totalGaleriaConfiancaItems <= 1) return;
            currentGaleriaConfiancaIndex--;
            if (currentGaleriaConfiancaIndex < 0) {
                currentGaleriaConfiancaIndex = totalGaleriaConfiancaItems - 1;
            }
            updateGaleriaConfiancaCarouselView();
        }

        function startGaleriaConfiancaAutoRotate() {
            clearInterval(galeriaConfiancaAutoRotateInterval);
            if (totalGaleriaConfiancaItems > 1) {
                galeriaConfiancaAutoRotateInterval = setInterval(() => {
                    moveToNextGaleriaConfianca();
                }, galeriaConfiancaSlideIntervalTime);
            }
        }

        nextButtonGaleriaConfianca.addEventListener('click', () => {
            moveToNextGaleriaConfianca();
            startGaleriaConfiancaAutoRotate();
        });

        prevButtonGaleriaConfianca.addEventListener('click', () => {
            moveToPrevGaleriaConfianca();
            startGaleriaConfiancaAutoRotate();
        });

        if (galeriaConfiancaCarouselViewport) {
            galeriaConfiancaCarouselViewport.addEventListener('touchstart', e => {
                galeriaConfiancaTouchStartX = e.touches[0].clientX;
                clearInterval(galeriaConfiancaAutoRotateInterval);
            }, { passive: true });

            galeriaConfiancaCarouselViewport.addEventListener('touchend', e => {
                if (galeriaConfiancaTouchStartX === 0 || totalGaleriaConfiancaItems <= 1) {
                    startGaleriaConfiancaAutoRotate();
                    return;
                }
                galeriaConfiancaTouchEndX = e.changedTouches[0].clientX;
                handleGaleriaConfiancaSwipe();
                galeriaConfiancaTouchStartX = 0;
                startGaleriaConfiancaAutoRotate();
            }, { passive: true });
        }

        function handleGaleriaConfiancaSwipe() {
            const swipeThreshold = 40;
            let diffX = galeriaConfiancaTouchStartX - galeriaConfiancaTouchEndX;
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    moveToNextGaleriaConfianca();
                } else {
                    moveToPrevGaleriaConfianca();
                }
            }
        }

        if (totalGaleriaConfiancaItems > 0) {
            setupGaleriaConfiancaCarousel();
        } else {
             if(prevButtonGaleriaConfianca) prevButtonGaleriaConfianca.style.display = 'none';
             if(nextButtonGaleriaConfianca) nextButtonGaleriaConfianca.style.display = 'none';
        }

        const galeriaConfiancaWrapper = document.querySelector('.galeria-confianca-carousel-wrapper');
        if (galeriaConfiancaWrapper) {
            galeriaConfiancaWrapper.addEventListener('mouseenter', () => {
                clearInterval(galeriaConfiancaAutoRotateInterval);
            });
            galeriaConfiancaWrapper.addEventListener('mouseleave', () => {
                startGaleriaConfiancaAutoRotate();
            });
        }

    } else {
        if (prevButtonGaleriaConfianca) prevButtonGaleriaConfianca.style.display = 'none';
        if (nextButtonGaleriaConfianca) nextButtonGaleriaConfianca.style.display = 'none';
    }
    // --- FIM DA LÓGICA PARA CARROSSEL GALERIA CONFIANÇA ---


    // --- LÓGICA PARA CARROSSEL CLIENTES E PARCEIROS (LOOP AUTOMÁTICO) ---
    const clientesCarousel = document.querySelector('.clientes-parceiros-carousel');
    if (clientesCarousel) {
        const clientesItems = clientesCarousel.querySelectorAll('.cliente-parceiro-item');
        if (clientesItems.length > 0) {
            // Duplica os itens para criar o efeito de loop contínuo
            clientesItems.forEach(item => {
                const clone = item.cloneNode(true);
                clientesCarousel.appendChild(clone);
            });
            // Adiciona a classe que ativa a animação CSS de loop
            clientesCarousel.classList.add('infinite-loop');
        }
    }
    // --- FIM DA LÓGICA PARA CARROSSEL CLIENTES E PARCEIROS ---

}); // Fecha o DOMContentLoaded