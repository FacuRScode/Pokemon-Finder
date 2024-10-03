let allPokemons = [];
let currentPage = 1; 
const pokemonsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemons(); // Obtiene la lista de pokemons 
    getElementById('btnFavorito').addEventListener('click', showFavorites); // Muestra los favoritos
});

// llama a la api y fechea la lista de pokemons
function fetchPokemons() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            allPokemons = data.results;
            renderPokemonList();
        })
        .catch(error => console.error('Error al obtener los Pokemons:', error));
}

// Renderizar la lista de Pokémon
function renderPokemonList() {
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = ''; 

    const startIndex = (currentPage - 1) * pokemonsPerPage;
    const endIndex = startIndex + pokemonsPerPage;
    const paginatedPokemons = allPokemons.slice(startIndex, endIndex);

    const favorites = getFavorites(); // Obtener favoritos desde localStorage

    paginatedPokemons.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');

        const isFavorite = favorites.includes(pokemon.name);

        pokemonCard.innerHTML = `
            <h3>${pokemon.name}</h3>
            <img onclick="fetchPokemonDetails('${pokemon.name}')" src="https://img.pokemondb.net/sprites/home/normal/${pokemon.name}.png" alt="${pokemon.name}">
            <button onclick="fetchPokemonDetails('${pokemon.name}')">Ver Detalles</button>
            <button class="button-favorites" onclick="toggleFavorite('${pokemon.name}')">
                ${isFavorite ? '★ Favorito' : '☆ Marcar Favorito'}
            </button>
        `;

        pokemonList.appendChild(pokemonCard);
    });

    updatePaginationControls();
}

// Función de búsqueda
function searchPokemon() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    if (searchInput) {
        allPokemons = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchInput));
    } else {
        fetchPokemons(); // Si esta vacio carga todos los pokemon
    }
    currentPage = 1;
    renderPokemonList();
}

// fechea los detalles del pokemon seleccionado y los carga en la modal
function fetchPokemonDetails(name) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(response => response.json())
        .then(pokemon => {
            document.getElementById('pokemon-name').textContent = pokemon.name;
            document.getElementById('pokemon-image').src = pokemon.sprites.front_default;
            document.getElementById('pokemon-height').textContent = pokemon.height / 10;
            document.getElementById('pokemon-weight').textContent = pokemon.weight / 10;
            document.getElementById('pokemon-abilities').textContent = pokemon.abilities.map(a => a.ability.name).join(', ');

            document.getElementById('pokemon-modal').style.display = 'block';
        })
        .catch(error => console.error('Error al obtener los detalles del Pokemon:', error));
}

// Función para marcar y desmarcar favoritos
function toggleFavorite(name) {
    let favorites = getFavorites();

    if (favorites.includes(name)) {
        favorites = favorites.filter(fav => fav !== name);
    } else {
        favorites.push(name);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (currentPage !== 0){
        renderPokemonList(); // Refrescar la lista para mostrar el estado actualizado
    } else {
        showFavorites();
    }
}

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function showFavorites() {
    currentPage = 0;
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            const pokemonList = document.getElementById('pokemon-list');
            pokemonList.innerHTML = ''; 

            const favorites = getFavorites(); // Obtener favoritos desde localStorage

            data.results.forEach(pokemon => {
                if (!favorites.includes(pokemon.name)) {
                    return; // Mostrar solo los favoritos si está habilitado
                }

                const pokemonCard = document.createElement('div'); // Crea la card para los favoritos
                pokemonCard.classList.add('pokemon-card');

                const isFavorite = favorites.includes(pokemon.name);

                pokemonCard.innerHTML = `
                    <h3>${pokemon.name}</h3>
                    <img onclick="fetchPokemonDetails('${pokemon.name}')" src="https://img.pokemondb.net/sprites/home/normal/${pokemon.name}.png" alt="${pokemon.name}">
                    <button onclick="fetchPokemonDetails('${pokemon.name}')">Ver Detalles</button>
                    <button class="button-favorites" onclick="toggleFavorite('${pokemon.name}')">
                        ${isFavorite ? '★ Favorito' : '☆ Marcar Favorito'}
                    </button>
                `;

                pokemonList.appendChild(pokemonCard);
            });
        })
        .catch(error => console.error('Error al obtener los Pokémons:', error));
}

// Paginacion
function changePage(direction) {

    if(direction === 0){
        currentPage = 1;
        renderPokemonList();
    } else {
        currentPage += direction;
        renderPokemonList();
    }
}

// Actualizar controles de paginación
function updatePaginationControls() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = (currentPage * pokemonsPerPage) >= allPokemons.length;
}

// Cerrar modal de detalles
function closeModal() {
    document.getElementById('pokemon-modal').style.display = 'none';
}
