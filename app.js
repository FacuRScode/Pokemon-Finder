// Renderiza el listado de últimas búsquedas
function renderRecentSearches() {
    const containerId = 'recentSearches';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.margin = '16px 0';
        container.innerHTML = '<strong>Últimas búsquedas:</strong> <select id="recentDropdown" style="margin-left:8px;padding:4px 8px;border-radius:4px;border:1px solid #ccc;"></select>';
        document.querySelector('.search-box').appendChild(container);
    }
    const recentDropdown = document.getElementById('recentDropdown');
    recentDropdown.innerHTML = '';
    const recent = JSON.parse(localStorage.getItem('pokeapi:recent') || '[]');
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Selecciona...';
    defaultOption.value = '';
    recentDropdown.appendChild(defaultOption);
    recent.forEach(name => {
        const option = document.createElement('option');
        option.textContent = name;
        option.value = name;
        recentDropdown.appendChild(option);
    });
    recentDropdown.onchange = async function() {
        if (this.value) {
            document.getElementById('pokemonInput').value = this.value;
            document.getElementById('searchBtn').click();
            this.selectedIndex = 0;
        }
    };
}
// Renderiza la ficha de un Pokémon en el div pokemonInfo
// Renderiza uno o varios Pokémon en el contenedor indicado
function renderPokemonCard(data, container = null) {
    const pokemons = Array.isArray(data) ? data : [data];
    const cards = pokemons.map(poke => {
        const mainType = poke.types[0].type.name;
        const isFav = isFavorite(poke.id);
        const star = isFav ? '★' : '☆';
        return `
        <div class="pokemon-card type-${mainType}" style="cursor:pointer;position:relative;" data-id="${poke.id}">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png" alt="${poke.name}">
            <button class="fav-btn" data-id="${poke.id}" style="margin-bottom:8px;padding:4px 10px;background:#ffe259;color:#333;border:none;border-radius:6px;cursor:pointer;font-size:0.9rem;">${star} Favorito</button>
            <h2 style="margin-top:8px;">${poke.name.charAt(0).toUpperCase() + poke.name.slice(1)} (#${poke.id})</h2>
            <p><strong>Tipo:</strong> ${poke.types.map(t => t.type.name).join(', ')}</p>
        </div>
        `;
    }).join('');
    const target = container || document.getElementById('pokemonInfo');
    target.innerHTML = cards;
    // Evento para agregar/quitar favoritos
    Array.from(target.getElementsByClassName('fav-btn')).forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const pokeId = btn.getAttribute('data-id');
            const poke = pokemons.find(p => p.id == pokeId);
            if (!isFavorite(poke.id)) {
                if (!addFavorite(poke)) {
                    btn.textContent = 'Límite 50';
                    btn.style.background = '#ffbaba';
                    setTimeout(() => {
                        btn.textContent = '☆ Favorito';
                        btn.style.background = '#ffe259';
                    }, 1200);
                    return;
                }
                btn.textContent = '★ Favorito';
                btn.style.background = '#ffd700';
            } else {
                removeFavorite(poke);
                btn.textContent = '☆ Favorito';
                btn.style.background = '#ffe259';
            }
        };
    });
    // Si es solo uno, agregar modal y eventos
    if (pokemons.length === 1) {
        const poke = pokemons[0];
        const card = target.querySelector('.pokemon-card');
        card.onclick = () => {
            showPokemonModal(poke, target);
        };
    }
}

// Mostrar el primer Pokémon al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await fetchPokemon(1); // Bulbasaur
        renderPokemonCard(data);
    } catch (err) {
        document.getElementById('pokemonInfo').innerHTML = '<p>No se pudo cargar el primer Pokémon.</p>';
    }
});

// --- Funciones de fetch ---


/**
 * Obtiene el detalle de un Pokémon por nombre o id, con caché localStorage opcional
 * @param {string|number} nameOrId
 * @param {boolean} useCache Si es false, no guarda en localStorage
 * @returns {Promise<Object>} Detalle del Pokémon
 */
async function fetchPokemon(nameOrId, useCache = true) {
    const key = `pokeapi:pokemon:${nameOrId}`;
    if (useCache) {
        const cached = localStorage.getItem(key);
        if (cached) {
            try {
                const obj = JSON.parse(cached);
                return obj.data;
            } catch {}
        }
    }
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    if (!res.ok) throw new Error('Pokémon no encontrado');
    const data = await res.json();
    if (useCache) {
        try {
            localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
        } catch {}
    }
    return data;
}


/**
 * Obtiene un listado de Pokémon con paginación, con caché localStorage
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<Object>} Listado paginado
 */
async function fetchPokemonList(offset = 0, limit = 20) {
    const key = `pokeapi:list:${offset}:${limit}`;
    const cached = localStorage.getItem(key);
    if (cached) {
        try {
            const obj = JSON.parse(cached);
            // Opcional: puedes agregar expiración aquí si lo deseas
            return obj.data;
        } catch {}
    }
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    if (!res.ok) throw new Error('No se pudo obtener el listado');
    const data = await res.json();
    localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
    return data;
}




document.getElementById('searchBtn').addEventListener('click', async () => {
    const input = document.getElementById('pokemonInput').value.trim().toLowerCase();
    const infoDiv = document.getElementById('pokemonInfo');
    if (!input) {
        infoDiv.innerHTML = '<p>Por favor ingresa un nombre o número de Pokémon.</p>';
        return;
    }
    infoDiv.innerHTML = '<p>Buscando...</p>';
    try {
        const data = await fetchPokemon(input);
        renderPokemonCard(data);
        // Actualizar últimas búsquedas
        let recent = JSON.parse(localStorage.getItem('pokeapi:recent') || '[]');
        if (recent[0] !== input) {
            recent.unshift(input);
        }
        // Eliminar duplicados consecutivos y limitar a 10
        recent = recent.filter((v, i, arr) => i === 0 || v !== arr[i - 1]);
        if (recent.length > 10) recent = recent.slice(0, 10);
        localStorage.setItem('pokeapi:recent', JSON.stringify(recent));
        renderRecentSearches();
    } catch (err) {
        infoDiv.innerHTML = '<p>Pokémon no encontrado. Intenta con otro nombre o número.</p>';
    }
});
// Renderizar las búsquedas al cargar
window.addEventListener('DOMContentLoaded', () => {
    renderRecentSearches();
});

// Autocompletado de Pokémon en el buscador
let allPokemonNames = [];

// Obtener todos los nombres al cargar la página
async function fetchAllPokemonNames() {
    if (allPokemonNames.length) return allPokemonNames;
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000');
    const data = await res.json();
    allPokemonNames = data.results.map(p => p.name);
    return allPokemonNames;
}

// Crear el contenedor de sugerencias
const inputEl = document.getElementById('pokemonInput');
inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});
let suggestionBox = document.getElementById('suggestionBox');
if (!suggestionBox) {
    suggestionBox = document.createElement('div');
    suggestionBox.id = 'suggestionBox';
    suggestionBox.style.position = 'absolute';
    suggestionBox.style.background = '#fff';
    suggestionBox.style.border = '1px solid #ccc';
    suggestionBox.style.borderRadius = '4px';
    suggestionBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    suggestionBox.style.zIndex = '100';
    suggestionBox.style.width = inputEl.offsetWidth + 'px';
    suggestionBox.style.maxHeight = '200px';
    suggestionBox.style.overflowY = 'auto';
    suggestionBox.style.display = 'none';
    suggestionBox.style.left = inputEl.getBoundingClientRect().left + 'px';
    suggestionBox.style.top = (inputEl.getBoundingClientRect().bottom + window.scrollY) + 'px';
    document.body.appendChild(suggestionBox);
}

inputEl.addEventListener('input', async (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) {
        suggestionBox.style.display = 'none';
        return;
    }
    await fetchAllPokemonNames();
    const filtered = allPokemonNames.filter(name => name.startsWith(value)).slice(0, 10);
    if (filtered.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }
    suggestionBox.innerHTML = '';
    filtered.forEach(name => {
        const item = document.createElement('div');
        item.textContent = name;
        item.style.padding = '8px';
        item.style.cursor = 'pointer';
        item.style.width = '100%';
        item.onclick = () => {
            inputEl.value = name;
            suggestionBox.style.display = 'none';
            document.getElementById('searchBtn').click();
        };
        suggestionBox.appendChild(item);
    });
    // Posicionar y mostrar el box justo debajo del input
    const rect = inputEl.getBoundingClientRect();
    suggestionBox.style.width = rect.width + 'px';
    suggestionBox.style.left = rect.left + 'px';
    suggestionBox.style.top = (rect.bottom + window.scrollY) + 'px';
    suggestionBox.style.display = 'block';
});

// Ocultar sugerencias al perder foco
inputEl.addEventListener('blur', () => {
    setTimeout(() => { suggestionBox.style.display = 'none'; }, 150);
});

// Renderiza 24 Pokémon en el div pokemonInfo, pidiendo de a 1 y mostrando cada uno apenas llega
let currentOffset = 0;
const PAGE_SIZE = 24;

async function renderNPokemon(n = PAGE_SIZE, offset = 0) {
    currentOffset = offset;
    const data = await fetchPokemonList(offset, n);
    const container = document.getElementById('pokemonInfo');
    container.innerHTML = '';
    // Array para guardar los datos completos de cada Pokémon
    const pokeDatas = [];
    for (const p of data.results) {
        try {
            const pokeData = await fetchPokemon(p.name, false); // No guardar en localStorage
            pokeDatas.push(pokeData);
        } catch (err) {
            console.warn('Error al renderizar:', p.name, err);
        }
    }
    // Renderizar todas las cards juntas
    renderPokemonCard(pokeDatas, container);
    // Agregar evento a cada card para mostrar la modal sin borrar la lista
    Array.from(container.getElementsByClassName('pokemon-card')).forEach(card => {
        card.onclick = async () => {
            const pokeId = card.getAttribute('data-id');
            const pokeData = pokeDatas.find(p => p.id == pokeId);
            showPokemonModal(pokeData, container);
        };
    });
    // Actualizar paginación
    updatePagination(data.count);
}

function updatePagination(totalCount) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const pageSelector = document.getElementById('pageSelector');
    const goToPageBtn = document.getElementById('goToPage');
    const currentPage = Math.floor(currentOffset / PAGE_SIZE) + 1;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentOffset === 0;
    nextBtn.disabled = currentOffset + PAGE_SIZE >= totalCount;
    if (pageSelector) {
        pageSelector.max = totalPages;
        pageSelector.value = currentPage;
    }
    if (goToPageBtn && pageSelector) {
        goToPageBtn.onclick = () => {
            let page = parseInt(pageSelector.value);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            renderNPokemon(PAGE_SIZE, (page - 1) * PAGE_SIZE);
        };
    }
}

// Muestra la modal sobre la lista, sin borrar las cards
function showPokemonModal(poke, container) {
    // Elimina cualquier modal previa
    const oldModal = container.querySelector('#pokeModal');
    if (oldModal) oldModal.remove();
    const mainType = poke.types[0].type.name;
    const isFav = isFavorite(poke.id);
    const star = isFav ? '★' : '☆';
    const modal = document.createElement('div');
    modal.id = 'pokeModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <div class="modal-content type-${mainType}" style="background:#fff;padding:24px;border-radius:8px;max-width:350px;position:relative;">
            <span id="closeModal" style="position:absolute;top:8px;right:12px;font-size:1.5rem;cursor:pointer;">&times;</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png" alt="${poke.name}" style="width:120px;height:120px;object-fit:contain;display:block;margin:0 auto 8px auto;">
            <button id="favModalBtn" style="display:block;margin:0 auto 12px auto;padding:4px 10px;background:#ffe259;color:#333;border:none;border-radius:6px;cursor:pointer;font-size:0.9rem;">${star} Favorito</button>
            <h2 style="margin-top:8px;">${poke.name.charAt(0).toUpperCase() + poke.name.slice(1)} (#${poke.id})</h2>
            <p><strong>Tipo:</strong> ${poke.types.map(t => t.type.name).join(', ')}</p>
            <p><strong>Peso:</strong> ${poke.weight / 10} kg</p>
            <p><strong>Altura:</strong> ${poke.height / 10} m</p>
            <p><strong>Habilidades:</strong></p>
            <ul>${poke.abilities.map(a => `<li>${a.ability.name}</li>`).join('')}</ul>
            <p><strong>Stats:</strong></p>
            <ul>${poke.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}</ul>
        </div>
    `;
    document.body.appendChild(modal);
    const closeBtn = modal.querySelector('#closeModal');
    closeBtn.onclick = () => { modal.remove(); };
    modal.onclick = (e) => { if (e.target.id === 'pokeModal') modal.remove(); };
    // Evento favorito en modal
    const favBtn = modal.querySelector('#favModalBtn');
    favBtn.onclick = () => {
        if (!isFavorite(poke.id)) {
            if (!addFavorite(poke)) {
                favBtn.textContent = 'Límite 50';
                favBtn.style.background = '#ffbaba';
                return;
            }
            favBtn.textContent = '★ Favorito';
            favBtn.style.background = '#ffd700';
        } else {
            removeFavorite(poke);
            favBtn.textContent = '☆ Favorito';
            favBtn.style.background = '#ffe259';
        }
        // Actualizar el botón de favorito en la card de la lista
        const cardBtn = document.querySelector(`.pokemon-card[data-id='${poke.id}'] .fav-btn`);
        if (cardBtn) {
            cardBtn.textContent = isFavorite(poke.id) ? '★ Favorito' : '☆ Favorito';
            cardBtn.style.background = isFavorite(poke.id) ? '#ffd700' : '#ffe259';
        }
    };
}

// Llama a la función al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    renderRecentSearches();
    renderNPokemon(PAGE_SIZE, 0);
    // Eventos de paginación
    document.getElementById('firstPage').onclick = () => {
        renderNPokemon(PAGE_SIZE, 0);
    };
    document.getElementById('prevPage').onclick = () => {
        if (currentOffset >= PAGE_SIZE) {
            renderNPokemon(PAGE_SIZE, currentOffset - PAGE_SIZE);
        }
    };
    document.getElementById('nextPage').onclick = () => {
        renderNPokemon(PAGE_SIZE, currentOffset + PAGE_SIZE);
    };
    document.getElementById('lastPage').onclick = () => {
        fetchPokemonList(0, PAGE_SIZE).then(data => {
            const totalPages = Math.ceil(data.count / PAGE_SIZE);
            renderNPokemon(PAGE_SIZE, (totalPages - 1) * PAGE_SIZE);
        });
    };
    // Activar paginación con Enter en el input
    document.getElementById('pageSelector').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('goToPage').click();
        }
    });
    // Evento para quitar todos los favoritos
    document.getElementById('clearFavoritesBtn').onclick = () => {
        // Borrar todos los datos de los Pokémon favoritos
        const favs = getFavorites();
        favs.forEach(f => removeFavorite(f));
        setFavorites([]);
        // Actualizar botones de favoritos en cards
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.textContent = '☆ Favorito';
            btn.style.background = '#ffe259';
        });
    };
    // Evento para mostrar favoritos
    document.getElementById('showFavoritesBtn').onclick = () => {
        renderFavoritePokemons();
    };
});

// Helpers para favoritos
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('pokeapi:favorites') || '[]');
    } catch { return []; }
}
function setFavorites(favs) {
    localStorage.setItem('pokeapi:favorites', JSON.stringify(favs));
}
function isFavorite(id) {
    return getFavorites().some(f => f.id == id);
}
function addFavorite(poke) {
    let favs = getFavorites();
    if (favs.length >= 50) return false;
    if (!isFavorite(poke.id)) {
        favs.unshift({ id: poke.id, name: poke.name });
        setFavorites(favs);
        return true;
    }
    return false;
}
function removeFavorite(poke) {
    let favs = getFavorites().filter(f => f.id != poke.id);
    setFavorites(favs);
    localStorage.removeItem(`pokeapi:pokemon:${poke.id}`);
    localStorage.removeItem(`pokeapi:pokemon:${poke.name}`);
}

// Renderiza todos los Pokémon favoritos desde localStorage
function renderFavoritePokemons() {
    const favs = getFavorites();
    if (!favs.length) {
        document.getElementById('pokemonInfo').innerHTML = '<p>No tienes favoritos aún.</p>';
        return;
    }
    Promise.all(
        favs.map(f => fetchPokemon(f.id))
    ).then(pokeDatas => {
        renderPokemonCard(pokeDatas, document.getElementById('pokemonInfo'));
        // Agregar evento a cada card para mostrar la modal
        const container = document.getElementById('pokemonInfo');
        Array.from(container.getElementsByClassName('pokemon-card')).forEach(card => {
            card.onclick = async () => {
                const pokeId = card.getAttribute('data-id');
                const pokeData = pokeDatas.find(p => p.id == pokeId);
                showPokemonModal(pokeData, container);
            };
        });
    }).catch(() => {
        document.getElementById('pokemonInfo').innerHTML = '<p>Error al cargar favoritos.</p>';
    });
}
