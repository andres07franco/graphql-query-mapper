# graphql-query-mapper

This  library is a client graphql for typescript.

## Intall

    npm install graphql-query-mapper --save

## Usage

 Import  dependecy

  ```typescript
    //Import 
    import { GraphqlQuery,  } from "graphql-query-mapper";
  ```

Create the model

  ```typescript
    //The model
    class Pokemon{
        id: string      = null
        name: string    = null
        image: string   = null
        evolutions:Evolution[] =  [new Evolution()];
        evolutionRequirements: PokemonEvolutionRequirement 
                        = new  PokemonEvolutionRequirement();
    }

    class Evolution{
        id  = null
        number = null
        name  = null
    }

    class PokemonEvolutionRequirement{
        name:string = null
    }

```
Create the repository
```typescript
    //The repository mapping
     const pokeApi = 'https://graphql-pokemon.now.sh/?'
     
     class PokemonGraphQlRespository{

        @GraphqlQuery(pokeApi,Pokemon)
        static pokemon(name: string = null):Observable<Pokemon>{ return }
    }
```
Run 
  ```typescript
    //Run
    PokemonGraphQlRespository.pokemon('Charmander')
                             .subscribe(poke=>{
                                    console.log(poke); 
                             })

/* Query 
{
  pokemon(name: "Charmander") {
    id
    number
    name
    image
    evolutions {
      id
      number
      name
    }
    evolutionRequirements {
      name
    }
  }
}
*/

/*
RESPONSE
{
    "id": "UG9rZW1vbjowMDQ=",
    "number": "004",
    "name": "Charmander",
    "image": "https://img.pokemondb.net/artwork/charmander.jpg",
    "evolutions": [
        {
        "id": "UG9rZW1vbjowMDU=",
        "number": "005",
        "name": "Charmeleon"
        },
        {
        "id": "UG9rZW1vbjowMDY=",
        "number": "006",
        "name": "Charizard"
        }
    ],
    "evolutionRequirements": {
        "name": "Charmander candies"
    }
    }
*/


  ```
## Contributors
> Carlos Andrés Marriaga  Franco @andres07franco

Feel free to send your pull requests and contribute to this project

## License
 
 MIT