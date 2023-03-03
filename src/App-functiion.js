import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
const [isLoading, setLoading] = useState(true); // Loading state
const [pokemon, setPokemon] = useState(); // pokemon state

useEffect(() => { // useEffect hook
setTimeout(() => { // simulate a delay
axios.get("https://pokeapi.co/api/v2/pokemon/1")
.then((response) => {

  // Get pokemon data
  setPokemon(response.data); //set pokemon state
  setLoading(false); //set loading state
  });
}, 3000);
}, []);

if (isLoading) {
  return (
  <div style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  }}>Loading the data {console.log("loading state")}</div>
);
}

return (
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  }}
  >
  <span>{pokemon.name}</span>
  <img alt={pokemon.name}
    src={pokemon.sprites.front_default} />
  </div>
);
}

export default App;
