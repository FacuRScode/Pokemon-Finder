# Pokedex

Una web interactiva para explorar Pokémon usando la PokéAPI.

## Características

- Búsqueda por nombre o número
- Listado paginado de Pokémon (24 por página)
- Fichas con detalles y color por tipo
- Modal con información ampliada
- Últimas búsquedas
- Autocompletado en el buscador
- Navegación entre páginas
- Responsive y moderno
- Gestión de favoritos (agregar, quitar, ver favoritos, límite de 50)
- Botón para limpiar todos los favoritos
- Filtrado en tiempo real desde el buscador
- Dropdown de últimas búsquedas

## Instalación y uso

1. Clona este repositorio o descarga los archivos.
2. Abre `index.html` en tu navegador.

No requiere backend ni instalación de dependencias.

**Demo online:**
[GitHub Pages - Pokedex](https://facurscode.github.io/Pokemon-Finder/index.html)

## Estructura

- `index.html`: Estructura principal y layout
- `styles.css`: Estilos y colores por tipo
- `app.js`: Lógica de búsqueda, renderizado, favoritos y paginación

## Recursos

- PokéAPI (documentación): [https://pokeapi.co/](https://pokeapi.co/)
- Endpoint detalle: `https://pokeapi.co/api/v2/pokemon/{nombre|id}`
- Endpoint listado: `https://pokeapi.co/api/v2/pokemon?offset=0&limit=20`
- Sprites artwork oficial (por id): `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- Sprites oficiales: [https://github.com/PokeAPI/sprites](https://github.com/PokeAPI/sprites)

## Autor

FacuRScode

---

¡Disfruta explorando el mundo Pokémon!