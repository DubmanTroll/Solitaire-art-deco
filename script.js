document.addEventListener('DOMContentLoaded', () => {
            const SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
            const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' };
            
            let stock = [], waste = [], foundations = [[], [], [], []], tableau = [[], [], [], [], [], [], []];
            let moveHistory = [];
            let timerInterval, seconds = 0;
            let drawCount = 1;
            let cardOffset = 38;
            let score = 0, highScore = 0;
            
            let dragState = {
                draggedCards: [],
                source: null,
                startMouseX: 0,
                startMouseY: 0,
                initialCardPositions: []
            };

            const newGameBtn = document.getElementById('new-game-btn');
            const winNewGameBtn = document.getElementById('win-new-game-btn');
            const undoBtn = document.getElementById('undo-btn');
            const timerEl = document.getElementById('timer');
            const scoreEl = document.getElementById('score');
            const winMessageEl = document.getElementById('win-message');
            const stockEl = document.getElementById('stock');
            const wasteEl = document.getElementById('waste');
            const foundationEls = Array.from({ length: 4 }, (_, i) => document.getElementById(`foundation-${i}`));
            const tableauEls = Array.from({ length: 7 }, (_, i) => document.getElementById(`tableau-${i}`));
            const getHintBtn = document.getElementById('get-hint-btn');
            const hintModal = document.getElementById('hint-modal');
            const hintText = document.getElementById('hint-text');
            const closeHintBtn = document.getElementById('close-hint-btn');
            const loader = document.getElementById('loader');
            const startMenuOverlay = document.getElementById('start-menu-overlay');
            const easyModeBtn = document.getElementById('easy-mode-btn');
            const realisticModeBtn = document.getElementById('realistic-mode-btn');
            
            function updateLayoutValues() {
                const newOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--card-offset'));
                if (!isNaN(newOffset)) {
                    cardOffset = newOffset;
                }
            }
            
            function startGame(selectedDrawCount) {
                drawCount = selectedDrawCount;
                startMenuOverlay.classList.remove('show');

                stock = [], waste = [], foundations = [[], [], [], []], tableau = [[], [], [], [], [], [], []];
                moveHistory = [];
                document.querySelectorAll('.card').forEach(card => card.remove());
                undoBtn.disabled = true;
                winMessageEl.classList.remove('show');
                
                score = 0;
                updateScore(0);

                startTimer();
                createDeck();
                shuffleDeck();
                dealCards();
                renderAllPiles();
            }

            function initGame() {
                clearInterval(timerInterval);
                timerEl.textContent = 'Tiempo: 00:00';
                highScore = parseInt(localStorage.getItem('solitaireHighScore')) || 0;
                score = 0;
                updateScore(0);
                stock = [], waste = [], foundations = [[], [], [], []], tableau = [[], [], [], [], [], [], []];
                renderAllPiles();
                startMenuOverlay.classList.add('show');
            }

            function updateScore(points) {
                score += points;
                if (score < 0) score = 0; // Score cannot be negative
                scoreEl.textContent = `Puntos: ${score}`;
            }

            function createDeck() {
                stock = [];
                for (const suit of SUITS) {
                    for (let i = 0; i < RANKS.length; i++) {
                        stock.push({ suit, rank: RANKS[i], value: i + 1, color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black', faceUp: false, id: `${RANKS[i]}-${suit}` });
                    }
                }
            }
            
            function shuffleDeck() {
                for (let i = stock.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [stock[i], stock[j]] = [stock[j], stock[i]];
                }
            }
            
            function dealCards() {
                for (let i = 0; i < 7; i++) {
                    for (let j = i; j < 7; j++) {
                        const card = stock.pop();
                        if (i === j) card.faceUp = true;
                        tableau[j].push(card);
                    }
                }
            }

            function createCardElement(card) {
                const cardEl = document.createElement('div');
                cardEl.id = card.id;
                cardEl.className = `card ${card.color}`;
                if (card.faceUp) cardEl.classList.add('face-up');
                cardEl.innerHTML = `
                    <div class="card-back"></div>
                    <div class="card-face">
                        <div class="card-top"><span class="card-rank">${card.rank}</span><span class="card-suit">${SUIT_SYMBOLS[card.suit]}</span></div>
                        <div class="card-middle-suit">${SUIT_SYMBOLS[card.suit]}</div>
                        <div class="card-bottom"><span class="card-rank">${card.rank}</span><span class="card-suit">${SUIT_SYMBOLS[card.suit]}</span></div>
                    </div>`;
                cardEl.addEventListener('mousedown', onDragStart);
                cardEl.addEventListener('touchstart', onDragStart, { passive: false });
                return cardEl;
            }

            function renderAllPiles() {
                renderStock();
                renderWaste();
                renderTableau();
                renderFoundations();
            }
            
            function renderStock() {
                stockEl.innerHTML = '';
                if (stock.length > 0) {
                    const cardBack = createCardElement({ id: 'stock-card', faceUp: false });
                    cardBack.style.position = 'static';
                    cardBack.removeEventListener('mousedown', onDragStart);
                    cardBack.removeEventListener('touchstart', onDragStart);
                    cardBack.addEventListener('click', drawFromStock);
                    stockEl.appendChild(cardBack);
                } else if (waste.length > 0) {
                    const recycleEl = document.createElement('div');
                    recycleEl.style.width = '100%';
                    recycleEl.style.height = '100%';
                    recycleEl.style.display = 'flex';
                    recycleEl.style.justifyContent = 'center';
                    recycleEl.style.alignItems = 'center';
                    recycleEl.style.fontSize = '3rem';
                    recycleEl.style.color = 'rgba(212, 175, 55, 0.5)';
                    recycleEl.style.cursor = 'pointer';
                    recycleEl.title = 'Reciclar Descarte';
                    recycleEl.innerHTML = '⟳';
                    recycleEl.addEventListener('click', drawFromStock);
                    stockEl.appendChild(recycleEl);
                }
            }
            
            function renderWaste() {
                wasteEl.innerHTML = '';
                if (waste.length > 0) {
                    const cardsToShow = (drawCount === 3) ? waste.slice(-3) : waste.slice(-1);
                    cardsToShow.forEach((card, index) => {
                         const cardEl = createCardElement(card);
                         if (index !== cardsToShow.length - 1) {
                            cardEl.removeEventListener('mousedown', onDragStart);
                            cardEl.removeEventListener('touchstart', onDragStart);
                            cardEl.style.cursor = 'default';
                         }
                         if(drawCount === 3) {
                           cardEl.style.left = `${index * 20}px`;
                           cardEl.style.top = '0';
                         }
                         wasteEl.appendChild(cardEl);
                    });
                }
            }

            function renderTableau() {
                tableauEls.forEach((pileEl, i) => {
                    pileEl.innerHTML = '';
                    tableau[i].forEach((card, j) => {
                        const cardEl = createCardElement(card);
                        cardEl.style.top = `${j * cardOffset}px`;
                        pileEl.appendChild(cardEl);
                    });
                });
            }

            function renderFoundations() {
                foundationEls.forEach((pileEl, i) => {
                    pileEl.innerHTML = '';
                    if (foundations[i].length > 0) {
                        const cardEl = createCardElement(foundations[i][foundations[i].length - 1]);
                        pileEl.appendChild(cardEl);
                    }
                });
            }
            
            function drawFromStock() {
                if (stock.length > 0) {
                    saveMoveState();
                    const cardsToDraw = Math.min(drawCount, stock.length);
                    for (let i = 0; i < cardsToDraw; i++) {
                        const card = stock.pop();
                        card.faceUp = true;
                        waste.push(card);
                    }
                } else if (waste.length > 0) {
                    saveMoveState();
                    updateScore(-100);
                    stock = [...waste].reverse();
                    stock.forEach(c => c.faceUp = false);
                    waste = [];
                }
                renderStock();
                renderWaste();
            }

            function onDragStart(e) {
                e.preventDefault();
                const cardEl = e.currentTarget;
                if (!cardEl.classList.contains('face-up')) return;
                const parentPileEl = cardEl.parentElement;

                dragState = { draggedCards: [], source: null, startMouseX: 0, startMouseY: 0, initialCardPositions: [] };

                let sourceCards = [];
                if (parentPileEl.classList.contains('tableau')) {
                    const pileIndex = parseInt(parentPileEl.id.split('-')[1]);
                    const cardIndex = tableau[pileIndex].findIndex(c => c.id === cardEl.id);
                    sourceCards = tableau[pileIndex].slice(cardIndex);
                    dragState.source = { type: 'tableau', pileIndex };
                } else if (parentPileEl.id === 'waste' && waste.length > 0) {
                    sourceCards = [waste[waste.length - 1]];
                    dragState.source = { type: 'waste' };
                } else if (parentPileEl.classList.contains('foundation')) {
                    const pileIndex = parseInt(parentPileEl.id.split('-')[1]);
                    if (foundations[pileIndex].length > 0) {
                        sourceCards = [foundations[pileIndex][foundations[pileIndex].length - 1]];
                        dragState.source = { type: 'foundation', pileIndex };
                    }
                } else {
                    return;
                }

                const touch = e.touches ? e.touches[0] : null;
                const clientX = touch ? touch.clientX : e.clientX;
                const clientY = touch ? touch.clientY : e.clientY;

                dragState.draggedCards = sourceCards;
                dragState.startMouseX = clientX;
                dragState.startMouseY = clientY;

                dragState.draggedCards.forEach((card) => {
                    const el = document.getElementById(card.id);
                    el.classList.add('dragging');
                    el.style.zIndex = 1000 + dragState.initialCardPositions.length;
                    dragState.initialCardPositions.push({
                        left: el.offsetLeft,
                        top: el.offsetTop
                    });
                });

                document.addEventListener('mousemove', onDragMove);
                document.addEventListener('touchmove', onDragMove, { passive: false });
                document.addEventListener('mouseup', onDragEnd);
                document.addEventListener('touchend', onDragEnd);
            }

            function onDragMove(e) {
                if (e.type === 'touchmove') e.preventDefault();
                const touch = e.touches ? e.touches[0] : null;
                const clientX = touch ? touch.clientX : e.clientX;
                const clientY = touch ? touch.clientY : e.clientY;
                const deltaX = clientX - dragState.startMouseX;
                const deltaY = clientY - dragState.startMouseY;
                dragState.draggedCards.forEach((card, i) => {
                    const el = document.getElementById(card.id);
                    if (el) {
                        const initialPos = dragState.initialCardPositions[i];
                        el.style.left = `${initialPos.left + deltaX}px`;
                        el.style.top = `${initialPos.top + deltaY}px`;
                    }
                });
            }

            function onDragEnd(e) {
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('touchmove', onDragMove);
                document.removeEventListener('mouseup', onDragEnd);
                document.removeEventListener('touchend', onDragEnd);
                if (dragState.draggedCards.length === 0) return;
                const touch = e.changedTouches ? e.changedTouches[0] : null;
                const clientX = touch ? touch.clientX : e.clientX;
                const clientY = touch ? touch.clientY : e.clientY;
                const dropTarget = getDropTarget(clientX, clientY);
                let moveSuccessful = false;
                if (dropTarget) {
                    if (dropTarget.type === 'tableau' && isValidTableauMove(dragState.draggedCards[0], tableau[dropTarget.index])) {
                        performMove(dropTarget.type, dropTarget.index);
                        moveSuccessful = true;
                    } else if (dropTarget.type === 'foundation' && isValidFoundationMove(dragState.draggedCards[0], foundations[dropTarget.index], dropTarget.index)) {
                        performMove(dropTarget.type, dropTarget.index);
                        moveSuccessful = true;
                    }
                }
                if (!moveSuccessful) {
                    renderAllPiles();
                }
                dragState = { draggedCards: [], source: null, startMouseX: 0, startMouseY: 0, initialCardPositions: [] };
            }
            
            function getDropTarget(x, y) {
                for (let i = 0; i < 7; i++) {
                    const pile = tableau[i];
                    const rect = tableauEls[i].getBoundingClientRect();
                    const extendedRect = {
                        top: rect.top,
                        bottom: rect.bottom + (pile.length > 1 ? (pile.length - 1) * cardOffset : 0),
                        left: rect.left,
                        right: rect.right
                    };
                    if (y >= extendedRect.top && y <= extendedRect.bottom && x >= extendedRect.left && x <= extendedRect.right) {
                        return { type: 'tableau', index: i };
                    }
                }
                for (let i = 0; i < 4; i++) {
                    const rect = foundationEls[i].getBoundingClientRect();
                    if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) return { type: 'foundation', index: i };
                }
                return null;
            }

            function isValidTableauMove(card, targetPile) {
                if (targetPile.length === 0) return card.value === 13;
                const topCard = targetPile[targetPile.length - 1];
                return card.color !== topCard.color && card.value === topCard.value - 1;
            }
            
            function isValidFoundationMove(card, targetPile, targetIndex) {
                if (dragState.draggedCards.length > 1) return false;
                const foundationSuit = SUITS[targetIndex];
                if (card.suit !== foundationSuit) return false;
                if (targetPile.length === 0) return card.value === 1;
                const topCard = targetPile[targetPile.length - 1];
                return card.value === topCard.value + 1;
            }
            
            function performMove(targetType, targetIndex) {
                saveMoveState();
                
                // --- Scoring Logic ---
                let pointsEarned = 0;
                const sourceIsTableau = dragState.source.type === 'tableau';
                const sourceIsWaste = dragState.source.type === 'waste';
                const sourceIsFoundation = dragState.source.type === 'foundation';

                // Restriction: No points are awarded for any move originating from a foundation pile.
                if (!sourceIsFoundation) {
                    // Score for moving from Waste to Tableau
                    if (sourceIsWaste && targetType === 'tableau') {
                        pointsEarned = 25;
                    }
                    // Score for moving to a Foundation pile
                    else if (targetType === 'foundation') {
                        pointsEarned = 100;
                    }
                    // Score for moving from Tableau to Tableau
                    else if (sourceIsTableau && targetType === 'tableau') {
                        const sourcePile = tableau[dragState.source.pileIndex];
                        const cardsBeneathCount = sourcePile.length - dragState.draggedCards.length;
                        // Restriction: Points are only awarded if the move reveals a face-down card.
                        // This prevents gaining points by moving already revealed cards between columns.
                        if (cardsBeneathCount > 0 && !sourcePile[cardsBeneathCount - 1].faceUp) {
                            pointsEarned = 20;
                        }
                    }
                }

                if (pointsEarned > 0) {
                    updateScore(pointsEarned);
                }
                
                // --- Update Game State ---
                if (sourceIsTableau) {
                    const sourcePile = tableau[dragState.source.pileIndex];
                    sourcePile.splice(-dragState.draggedCards.length);
                    if (sourcePile.length > 0 && !sourcePile[sourcePile.length - 1].faceUp) {
                        sourcePile[sourcePile.length - 1].faceUp = true;
                    }
                } else if (sourceIsWaste) {
                    waste.pop();
                } else if (sourceIsFoundation) {
                    foundations[dragState.source.pileIndex].pop();
                }

                if (targetType === 'tableau') {
                    tableau[targetIndex].push(...dragState.draggedCards);
                } else {
                    foundations[targetIndex].push(...dragState.draggedCards);
                }

                renderAllPiles();
                if (targetType === 'foundation') {
                    const cardEl = foundationEls[targetIndex].querySelector('.card');
                    if (cardEl) cardEl.classList.add('bounce');
                }
                checkWinCondition();
            }

            function saveMoveState() {
                moveHistory.push({
                    stock: JSON.parse(JSON.stringify(stock)),
                    waste: JSON.parse(JSON.stringify(waste)),
                    foundations: JSON.parse(JSON.stringify(foundations)),
                    tableau: JSON.parse(JSON.stringify(tableau)),
                    score: score
                });
                undoBtn.disabled = false;
            }
            
            function undoMove() {
                if (moveHistory.length === 0) return;
                const lastState = moveHistory.pop();
                stock = lastState.stock;
                waste = lastState.waste;
                foundations = lastState.foundations;
                tableau = lastState.tableau;
                score = lastState.score;
                updateScore(-2);
                renderAllPiles();
                if (moveHistory.length === 0) undoBtn.disabled = true;
            }

            function startTimer() {
                clearInterval(timerInterval);
                seconds = 0;
                timerEl.textContent = 'Tiempo: 00:00';
                timerInterval = setInterval(() => {
                    seconds++;
                    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
                    const sec = String(seconds % 60).padStart(2, '0');
                    timerEl.textContent = `Tiempo: ${min}:${sec}`;
                }, 1000);
            }

            function checkWinCondition() {
                if (foundations.reduce((sum, pile) => sum + pile.length, 0) === 52) {
                    clearInterval(timerInterval);
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('solitaireHighScore', highScore.toString());
                    }
                    document.getElementById('final-score').textContent = score;
                    document.getElementById('high-score').textContent = highScore;
                    winMessageEl.classList.add('show');
                }
            }

            function showLoader() { loader.classList.add('show'); }
            function hideLoader() { loader.classList.remove('show'); }
            function showHint(text) { hintText.textContent = text; hintModal.classList.add('show'); }
            function hideHint() { hintModal.classList.remove('show'); }

            function formatGameStateForLLM() {
                let state = "Estado actual del juego de Solitario:\n";
                state += `Puntuación: ${score}\n`;
                state += `Tiempo: ${timerEl.textContent}\n`;
                
                const topWasteCard = waste.length > 0 ? `${waste[waste.length - 1].rank} de ${waste[waste.length - 1].suit}` : 'vacío';
                state += `Descarte: ${topWasteCard}\n`;
                
                state += "Bases:\n";
                foundations.forEach((pile, i) => {
                    const topCard = pile.length > 0 ? `${pile[pile.length - 1].rank} de ${SUITS[i]}` : 'vacío';
                    state += `- ${SUITS[i]}: ${topCard}\n`;
                });

                state += "Columnas:\n";
                tableau.forEach((pile, i) => {
                    if (pile.length === 0) {
                        state += `- Columna ${i+1}: vacía\n`;
                    } else {
                        const cardsStr = pile.map(c => c.faceUp ? `${c.rank} de ${c.suit}` : 'Boca abajo').join(', ');
                        state += `- Columna ${i+1}: ${cardsStr}\n`;
                    }
                });

                return state;
            }

            async function getHintFromLLM() {
                showLoader();
                getHintBtn.disabled = true;
                const systemPrompt = "Eres un experto en el juego de Solitario Klondike. Tu única función es analizar el estado actual del juego que se te proporciona y sugerir el mejor movimiento posible en una frase corta y directa. No saludes, no expliques las reglas, solo da la sugerencia. Si no hay movimientos posibles, dilo. Por ejemplo: 'Mueve el 5 de corazones sobre el 6 de picas.' o 'Voltea una carta del mazo.'";
                const userQuery = formatGameStateForLLM();
                const apiKey = ""; // API key is handled by the environment
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: userQuery }] }],
                            systemInstruction: { parts: [{ text: systemPrompt }] },
                        })
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const result = await response.json();
                    const hint = result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener una pista.";
                    showHint(hint);
                } catch (error) {
                    console.error("Error fetching hint:", error);
                    showHint("Hubo un problema al contactar al experto en Solitario. Verifica tu conexión e inténtalo de nuevo.");
                } finally {
                    hideLoader();
                    getHintBtn.disabled = false;
                }
            }

            newGameBtn.addEventListener('click', initGame);
            winNewGameBtn.addEventListener('click', () => startGame(drawCount));
            undoBtn.addEventListener('click', undoMove);
            getHintBtn.addEventListener('click', getHintFromLLM);
            closeHintBtn.addEventListener('click', hideHint);
            easyModeBtn.addEventListener('click', () => startGame(1));
            realisticModeBtn.addEventListener('click', () => startGame(3));
            hintModal.addEventListener('click', (e) => { if (e.target === hintModal) hideHint(); });
            
            window.addEventListener('resize', () => {
                updateLayoutValues();
                renderTableau();
            });
            
            initGame();
            updateLayoutValues();
        });