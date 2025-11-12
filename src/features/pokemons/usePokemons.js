import { useState } from "react";

export function usePokemons(initialValue = []) {
  const [pokemons, setPokemons] = useState(initialValue);
  return { pokemons, setPokemons };
}

export default usePokemons;
